from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.product import Product, ProductDrawing, ProductImage
from app.schemas.product import (
    ProductDrawingCreate,
    ProductDrawingOut,
    ProductDrawingUpdate,
    ProductImageCreate,
    ProductImageOut,
    ProductImageUpdate,
)

router = APIRouter(tags=["product media"])


def get_product_or_404(product_id: int, db: Session) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Товар не найден",
        )
    return product


def unset_other_primary_images(
    db: Session,
    product_id: int,
    image_id: int | None = None,
) -> None:
    query = db.query(ProductImage).filter(ProductImage.product_id == product_id)
    if image_id is not None:
        query = query.filter(ProductImage.id != image_id)
    query.update({ProductImage.is_primary: False}, synchronize_session=False)


@router.get("/products/{product_id}/images", response_model=list[ProductImageOut])
def get_product_images(product_id: int, db: Session = Depends(get_db)):
    get_product_or_404(product_id, db)
    return (
        db.query(ProductImage)
        .filter(ProductImage.product_id == product_id)
        .order_by(ProductImage.sort_order.asc(), ProductImage.id.asc())
        .all()
    )


@router.post(
    "/products/{product_id}/images",
    response_model=ProductImageOut,
    status_code=status.HTTP_201_CREATED,
)
def create_product_image(
    product_id: int,
    image_in: ProductImageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    get_product_or_404(product_id, db)

    if image_in.is_primary:
        unset_other_primary_images(db, product_id)

    image = ProductImage(product_id=product_id, **image_in.model_dump())
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.put("/products/images/{image_id}", response_model=ProductImageOut)
def update_product_image(
    image_id: int,
    image_in: ProductImageUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Изображение товара не найдено",
        )

    if image_in.is_primary:
        unset_other_primary_images(db, image.product_id, image_id)

    for field, value in image_in.model_dump().items():
        setattr(image, field, value)

    db.commit()
    db.refresh(image)
    return image


@router.delete("/products/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Изображение товара не найдено",
        )

    db.delete(image)
    db.commit()


@router.get("/products/{product_id}/drawings", response_model=list[ProductDrawingOut])
def get_product_drawings(product_id: int, db: Session = Depends(get_db)):
    get_product_or_404(product_id, db)
    return (
        db.query(ProductDrawing)
        .filter(ProductDrawing.product_id == product_id)
        .order_by(ProductDrawing.sort_order.asc(), ProductDrawing.id.asc())
        .all()
    )


@router.post(
    "/products/{product_id}/drawings",
    response_model=ProductDrawingOut,
    status_code=status.HTTP_201_CREATED,
)
def create_product_drawing(
    product_id: int,
    drawing_in: ProductDrawingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    get_product_or_404(product_id, db)
    drawing = ProductDrawing(product_id=product_id, **drawing_in.model_dump())
    db.add(drawing)
    db.commit()
    db.refresh(drawing)
    return drawing


@router.put("/products/drawings/{drawing_id}", response_model=ProductDrawingOut)
def update_product_drawing(
    drawing_id: int,
    drawing_in: ProductDrawingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    drawing = db.query(ProductDrawing).filter(ProductDrawing.id == drawing_id).first()
    if not drawing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Чертеж товара не найден",
        )

    for field, value in drawing_in.model_dump().items():
        setattr(drawing, field, value)

    db.commit()
    db.refresh(drawing)
    return drawing


@router.delete("/products/drawings/{drawing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_drawing(
    drawing_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    drawing = db.query(ProductDrawing).filter(ProductDrawing.id == drawing_id).first()
    if not drawing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Чертеж товара не найден",
        )

    db.delete(drawing)
    db.commit()
