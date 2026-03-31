from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryOut, CategoryCreate, CategoryUpdate

router = APIRouter(tags=["categories"])


@router.get("/categories", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.id).all()


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    if category_in.parent_id is not None:
        parent_category = db.query(Category).filter(Category.id == category_in.parent_id).first()
        if parent_category is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Родительская категория не существует",
            )

    category = Category(**category_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    category = db.query(Category).filter(Category.id == category_id).first()

    if category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")

    if category_in.parent_id == category_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Категория не может быть родителем сама себе",
        )

    if category_in.parent_id is not None:
        parent_category = db.query(Category).filter(Category.id == category_in.parent_id).first()
        if parent_category is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Родительская категория не существует",
            )

    category.name = category_in.name
    category.parent_id = category_in.parent_id

    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    category = db.query(Category).filter(Category.id == category_id).first()

    if category is None:
        raise HTTPException(status_code=404, detail="Категория не найдена")

    has_products = db.query(Product).filter(Product.category_id == category_id).first()
    if has_products:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Нельзя удалить категорию, в которой есть товары",
        )

    has_children = db.query(Category).filter(Category.parent_id == category_id).first()
    if has_children:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Нельзя удалить категорию, у которой есть дочерние категории",
        )

    db.delete(category)
    db.commit()