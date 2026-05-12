from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import require_admin, require_authenticated
from app.core.database import get_db
from app.models.category import Category
from app.models.cart import CartItem
from app.models.order import OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.services.pricing import resolve_product_price

router = APIRouter(tags=["products"])


class ProductPricePreviewRequest(BaseModel):
    product_ids: list[int]
    quantity: int = 1


class ProductPricePreviewOut(BaseModel):
    product_id: int
    unit_price: float
    base_price: float
    price_source: str
    applied_price_list_id: int | None = None


@router.get("/products", response_model=list[ProductOut])
def get_products(
    category_id: int | None = Query(default=None),
    search: str | None = Query(default=None),
    line: str | None = Query(default=None),
    active_only: bool = Query(default=False),
    include_children: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if category_id is not None:
        category_ids = [category_id]

        if include_children:
            pending_ids = [category_id]
            while pending_ids:
                child_ids = [
                    row.id
                    for row in db.query(Category.id)
                    .filter(Category.parent_id.in_(pending_ids))
                    .all()
                ]
                category_ids.extend(child_ids)
                pending_ids = child_ids

        query = query.filter(Product.category_id.in_(category_ids))

    if line:
        query = query.filter(Product.line == line)

    if active_only:
        query = query.filter(Product.is_active.is_(True))

    if search:
        normalized = f"%{search.strip()}%"
        query = query.filter(
            (Product.name.ilike(normalized))
            | (Product.description.ilike(normalized))
            | (Product.sku.ilike(normalized))
            | (Product.brand.ilike(normalized))
        )

    return query.order_by(Product.id.desc()).all()


@router.post("/products/prices/preview", response_model=list[ProductPricePreviewOut])
def preview_product_prices(
    payload: ProductPricePreviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    product_ids = list(dict.fromkeys(payload.product_ids))
    if not product_ids:
        return []

    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    products_by_id = {product.id: product for product in products}
    quantity = max(int(payload.quantity or 1), 1)

    result = []
    for product_id in product_ids:
        product = products_by_id.get(product_id)
        if not product:
            continue

        pricing = resolve_product_price(
            db,
            user_id=current_user.id,
            product=product,
            quantity=quantity,
        )
        result.append(
            {
                "product_id": product_id,
                "unit_price": float(pricing["unit_price"]),
                "base_price": float(pricing["base_price"]),
                "price_source": pricing["price_source"],
                "applied_price_list_id": pricing["applied_price_list_id"],
            }
        )

    return result


@router.get("/products/{product_id}/price", response_model=ProductPricePreviewOut)
def get_product_price(
    product_id: int,
    quantity: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ",
        )

    pricing = resolve_product_price(
        db,
        user_id=current_user.id,
        product=product,
        quantity=max(int(quantity or 1), 1),
    )
    return {
        "product_id": product.id,
        "unit_price": float(pricing["unit_price"]),
        "base_price": float(pricing["base_price"]),
        "price_source": pricing["price_source"],
        "applied_price_list_id": pricing["applied_price_list_id"],
    }


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Товар не найден",
        )

    return product


@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    existing_product = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Товар с таким SKU уже существует",
        )

    category = db.query(Category).filter(Category.id == product_in.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Указанная категория не существует",
        )

    product = Product(
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        sku=product_in.sku,
        brand=product_in.brand,
        line=product_in.line,
        image_url=product_in.image_url,
        is_featured=product_in.is_featured,
        is_active=product_in.is_active,
        in_stock=product_in.in_stock,
        pack_quantity=product_in.pack_quantity,
        weight_grams=product_in.weight_grams,
        load_capacity=product_in.load_capacity,
        color=product_in.color,
        coating=product_in.coating,
        size_label=product_in.size_label,
        specifications=product_in.specifications,
        category_id=product_in.category_id,
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Товар не найден",
        )

    existing_product = (
        db.query(Product)
        .filter(Product.sku == product_in.sku, Product.id != product_id)
        .first()
    )
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Товар с таким SKU уже существует",
        )

    category = db.query(Category).filter(Category.id == product_in.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Указанная категория не существует",
        )

    product.name = product_in.name
    product.description = product_in.description
    product.price = product_in.price
    product.sku = product_in.sku
    product.brand = product_in.brand
    product.line = product_in.line
    product.image_url = product_in.image_url
    product.is_featured = product_in.is_featured
    product.is_active = product_in.is_active
    product.in_stock = product_in.in_stock
    product.pack_quantity = product_in.pack_quantity
    product.weight_grams = product_in.weight_grams
    product.load_capacity = product_in.load_capacity
    product.color = product_in.color
    product.coating = product_in.coating
    product.size_label = product_in.size_label
    product.specifications = product_in.specifications
    product.category_id = product_in.category_id

    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Товар не найден",
        )

    has_references = (
        db.query(OrderItem.id).filter(OrderItem.product_id == product_id).first()
        or db.query(CartItem.id).filter(CartItem.product_id == product_id).first()
    )

    if has_references:
        product.is_active = False
        db.commit()
        return

    db.delete(product)
    db.commit()
