from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryOut, CategoryTreeOut, CategoryUpdate

router = APIRouter(tags=["categories"])


def validate_parent_category(
    db: Session,
    parent_id: int | None,
    category_id: int | None = None,
) -> None:
    if parent_id is None:
        return

    if category_id is not None and parent_id == category_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Категория не может быть родителем самой себя",
        )

    parent = db.query(Category).filter(Category.id == parent_id).first()
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Родительская категория не найдена",
        )

    if category_id is None:
        return

    current_parent = parent
    while current_parent:
        if current_parent.parent_id == category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Нельзя выбрать дочернюю категорию как родительскую",
            )
        current_parent = current_parent.parent


@router.get("/categories", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.sort_order.asc(), Category.id.asc()).all()


@router.get("/categories/tree", response_model=list[CategoryTreeOut])
def get_categories_tree(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.sort_order.asc(), Category.id.asc()).all()

    nodes = {
        category.id: {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "parent_id": category.parent_id,
            "sort_order": category.sort_order,
            "is_active": category.is_active,
            "children": [],
        }
        for category in categories
    }

    roots = []
    for category in categories:
        node = nodes[category.id]
        if category.parent_id and category.parent_id in nodes:
            nodes[category.parent_id]["children"].append(node)
        else:
            roots.append(node)

    return roots


@router.get("/categories/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Категория не найдена")
    return category


@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    existing_by_name = db.query(Category).filter(Category.name == category_in.name).first()
    if existing_by_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Категория с таким названием уже существует")

    existing_by_slug = db.query(Category).filter(Category.slug == category_in.slug).first()
    if existing_by_slug:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Категория с таким slug уже существует")

    validate_parent_category(db, category_in.parent_id)

    category = Category(
        name=category_in.name,
        slug=category_in.slug,
        description=category_in.description,
        parent_id=category_in.parent_id,
        sort_order=category_in.sort_order,
        is_active=category_in.is_active,
    )

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
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Категория не найдена")

    existing_by_name = (
        db.query(Category)
        .filter(Category.name == category_in.name, Category.id != category_id)
        .first()
    )
    if existing_by_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Категория с таким названием уже существует")

    existing_by_slug = (
        db.query(Category)
        .filter(Category.slug == category_in.slug, Category.id != category_id)
        .first()
    )
    if existing_by_slug:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Категория с таким slug уже существует")

    validate_parent_category(db, category_in.parent_id, category_id)

    category.name = category_in.name
    category.slug = category_in.slug
    category.description = category_in.description
    category.parent_id = category_in.parent_id
    category.sort_order = category_in.sort_order
    category.is_active = category_in.is_active

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
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Категория не найдена")

    if category.children or category.products:
        category.is_active = False
        db.commit()
        return

    db.delete(category)
    db.commit()
