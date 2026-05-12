from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import require_authenticated
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartOut
from app.services.pricing import resolve_product_price

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


def build_cart_response(db: Session, cart: Cart, user_id: int) -> dict:
    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items))
        .filter(Cart.id == cart.id)
        .first()
    )

    items = list(cart.items or [])
    product_ids = [item.product_id for item in items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all() if product_ids else []
    products_map = {product.id: product for product in products}

    response_items = []
    total_amount = Decimal("0.00")

    for item in items:
        product = products_map.get(item.product_id)
        if not product:
            continue

        pricing = resolve_product_price(
            db,
            user_id=user_id,
            product=product,
            quantity=item.quantity,
        )
        total_price = pricing["unit_price"] * item.quantity
        total_amount += total_price

        response_items.append(
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": float(pricing["unit_price"]),
                "base_price": float(pricing["base_price"]),
                "total_price": float(total_price),
                "price_source": pricing["price_source"],
                "applied_price_list_id": pricing["applied_price_list_id"],
            }
        )

    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": response_items,
        "total_amount": float(total_amount),
    }


@router.get("/cart", response_model=CartOut)
def get_my_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    cart = get_or_create_cart(db, current_user.id)
    return build_cart_response(db, cart, current_user.id)


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

    return build_cart_response(db, cart, current_user.id)


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

    return build_cart_response(db, cart, current_user.id)


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

    return build_cart_response(db, cart, current_user.id)
