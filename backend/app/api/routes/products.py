from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import ProductOut, ProductCreate

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

@router.post("/products", response_model=ProductOut)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product