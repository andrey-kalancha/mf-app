from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import require_authenticated
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartOut

router = APIRouter(tags=["cart"])


def get_or_create_cart(db: Session, user_id: int) -> Cart:
    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items))
        .filter(Cart.user_id == user_id)
        .first()
    )

    if cart is None:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    return cart


@router.get("/cart", response_model=CartOut)
def get_my_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    cart = get_or_create_cart(db, current_user.id)

    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items))
        .filter(Cart.id == cart.id)
        .first()
    )
    return cart


@router.post("/cart/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item_in: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Товар не найден",
        )

    cart = get_or_create_cart(db, current_user.id)

    existing_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.product_id == item_in.product_id)
        .first()
    )

    if existing_item:
        existing_item.quantity += item_in.quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity,
        )
        db.add(cart_item)

    db.commit()

    updated_cart = (
        db.query(Cart)
        .options(joinedload(Cart.items))
        .filter(Cart.id == cart.id)
        .first()
    )
    return updated_cart


@router.put("/cart/items/{item_id}", response_model=CartOut)
def update_cart_item(
    item_id: int,
    item_in: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    cart = get_or_create_cart(db, current_user.id)

    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart.id)
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Элемент корзины не найден",
        )

    cart_item.quantity = item_in.quantity
    db.commit()

    updated_cart = (
        db.query(Cart)
        .options(joinedload(Cart.items))
        .filter(Cart.id == cart.id)
        .first()
    )
    return updated_cart


@router.delete("/cart/items/{item_id}", response_model=CartOut)
def delete_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    cart = get_or_create_cart(db, current_user.id)

    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart.id)
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Элемент корзины не найден",
        )

    db.delete(cart_item)
    db.commit()

    updated_cart = (
        db.query(Cart)
        .options(joinedload(Cart.items))
        .filter(Cart.id == cart.id)
        .first()
    )
    return updated_cart