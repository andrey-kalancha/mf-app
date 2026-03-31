from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import ProductOut, ProductCreate, ProductUpdate

router = APIRouter(tags=["products"])


@router.get("/products", response_model=list[ProductOut])
def get_products(
    category_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    return query.order_by(Product.id).all()


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")

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
            status_code=status.HTTP_409_CONFLICT,
            detail="Товар с таким SKU уже существует",
        )

    category = db.query(Category).filter(Category.id == product_in.category_id).first()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Указанная категория не существует",
        )

    product = Product(**product_in.model_dump())
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

    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")

    existing_product = (
        db.query(Product)
        .filter(Product.sku == product_in.sku, Product.id != product_id)
        .first()
    )
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Товар с таким SKU уже существует",
        )

    category = db.query(Category).filter(Category.id == product_in.category_id).first()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Указанная категория не существует",
        )

    product.name = product_in.name
    product.sku = product_in.sku
    product.price = product_in.price
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

    if product is None:
        raise HTTPException(status_code=404, detail="Товар не найден")

    db.delete(product)
    db.commit()