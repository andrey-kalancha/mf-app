from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin, require_authenticated
from app.core.database import get_db
from app.models.price_list import PriceList, PriceListItem
from app.models.product import Product
from app.models.user import User
from app.schemas.price_list import (
    PriceListCreate,
    PriceListItemCreate,
    PriceListItemOut,
    PriceListItemUpdate,
    PriceListOut,
    PriceListUpdate,
)

router = APIRouter(tags=["price lists"])


def get_price_list_or_404(price_list_id: int, db: Session) -> PriceList:
    price_list = db.query(PriceList).filter(PriceList.id == price_list_id).first()
    if not price_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Прайс-лист не найден",
        )
    return price_list


def validate_client(db: Session, client_id: int | None) -> None:
    if client_id is None:
        return

    user = db.query(User).filter(User.id == client_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Клиент для прайс-листа не найден",
        )


def validate_product(db: Session, product_id: int) -> None:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Товар для прайс-листа не найден",
        )


@router.get("/price-lists", response_model=list[PriceListOut])
def get_price_lists(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return db.query(PriceList).order_by(PriceList.id.desc()).all()


@router.get("/price-lists/me", response_model=list[PriceListOut])
def get_my_price_lists(
    db: Session = Depends(get_db),
    current_user=Depends(require_authenticated),
):
    return (
        db.query(PriceList)
        .filter(
            PriceList.client_id == current_user.id,
            PriceList.is_active.is_(True),
        )
        .order_by(PriceList.id.desc())
        .all()
    )


@router.get("/price-lists/{price_list_id}", response_model=PriceListOut)
def get_price_list(
    price_list_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return get_price_list_or_404(price_list_id, db)


@router.post("/price-lists", response_model=PriceListOut, status_code=status.HTTP_201_CREATED)
def create_price_list(
    price_list_in: PriceListCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    validate_client(db, price_list_in.client_id)

    price_list = PriceList(**price_list_in.model_dump())
    db.add(price_list)
    db.commit()
    db.refresh(price_list)
    return price_list


@router.put("/price-lists/{price_list_id}", response_model=PriceListOut)
def update_price_list(
    price_list_id: int,
    price_list_in: PriceListUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    price_list = get_price_list_or_404(price_list_id, db)
    validate_client(db, price_list_in.client_id)

    for field, value in price_list_in.model_dump().items():
        setattr(price_list, field, value)

    db.commit()
    db.refresh(price_list)
    return price_list


@router.delete("/price-lists/{price_list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_price_list(
    price_list_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    price_list = get_price_list_or_404(price_list_id, db)
    db.delete(price_list)
    db.commit()


@router.post(
    "/price-lists/{price_list_id}/items",
    response_model=PriceListItemOut,
    status_code=status.HTTP_201_CREATED,
)
def create_price_list_item(
    price_list_id: int,
    item_in: PriceListItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    get_price_list_or_404(price_list_id, db)
    validate_product(db, item_in.product_id)

    item = PriceListItem(price_list_id=price_list_id, **item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/price-lists/items/{item_id}", response_model=PriceListItemOut)
def update_price_list_item(
    item_id: int,
    item_in: PriceListItemUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    item = db.query(PriceListItem).filter(PriceListItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Позиция прайс-листа не найдена",
        )

    validate_product(db, item_in.product_id)

    for field, value in item_in.model_dump().items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/price-lists/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_price_list_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    item = db.query(PriceListItem).filter(PriceListItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Позиция прайс-листа не найдена",
        )

    db.delete(item)
    db.commit()
