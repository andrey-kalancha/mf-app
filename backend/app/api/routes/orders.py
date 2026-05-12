from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import require_admin, require_authenticated
from app.core.database import get_db
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderFromCartCreate, OrderOut, OrderStatusUpdate
from app.services.pricing import resolve_product_price

router = APIRouter(tags=["orders"])

ALLOWED_ORDER_STATUSES = {"new", "processing", "shipped", "canceled"}


def get_customer_name(user: User) -> str:
    return " ".join(
        part for part in [user.first_name, user.last_name] if part
    ).strip() or user.email


@router.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Заказ не может быть пустым",
        )

    product_ids = [item.product_id for item in order_in.items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    products_map = {product.id: product for product in products}

    for item in order_in.items:
        if item.product_id not in products_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Товар с id={item.product_id} не найден",
            )

    order = Order(
        user_id=current_user.id,
        status="new",
        total_amount=Decimal("0.00"),
        delivery_address=(order_in.delivery_address or current_user.delivery_address or "").strip() or None,
        customer_name=get_customer_name(current_user),
        customer_phone=current_user.phone,
        customer_company=current_user.company,
    )
    db.add(order)
    db.flush()

    total_amount = Decimal("0.00")

    for item in order_in.items:
        product = products_map[item.product_id]
        pricing = resolve_product_price(
            db,
            user_id=current_user.id,
            product=product,
            quantity=item.quantity,
        )

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=pricing["unit_price"],
        )
        db.add(order_item)

        total_amount += pricing["unit_price"] * item.quantity

    order.total_amount = total_amount

    db.commit()

    created_order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order.id)
        .first()
    )
    return created_order


@router.post("/orders/from-cart", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order_from_cart(
    order_in: OrderFromCartCreate | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items))
        .filter(Cart.user_id == current_user.id)
        .first()
    )

    if cart is None or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Корзина пуста",
        )

    product_ids = [item.product_id for item in cart.items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    products_map = {product.id: product for product in products}

    for item in cart.items:
        if item.product_id not in products_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Товар с id={item.product_id} не найден",
            )

    order = Order(
        user_id=current_user.id,
        status="new",
        total_amount=Decimal("0.00"),
        delivery_address=((order_in.delivery_address if order_in else None) or current_user.delivery_address or "").strip() or None,
        customer_name=get_customer_name(current_user),
        customer_phone=current_user.phone,
        customer_company=current_user.company,
    )
    db.add(order)
    db.flush()

    total_amount = Decimal("0.00")

    for cart_item in cart.items:
        product = products_map[cart_item.product_id]
        pricing = resolve_product_price(
            db,
            user_id=current_user.id,
            product=product,
            quantity=cart_item.quantity,
        )

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=cart_item.quantity,
            price=pricing["unit_price"],
        )
        db.add(order_item)

        total_amount += pricing["unit_price"] * cart_item.quantity

    order.total_amount = total_amount

    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()

    created_order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order.id)
        .first()
    )
    return created_order


@router.get("/orders/my", response_model=list[OrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == current_user.id)
        .order_by(Order.id.desc())
        .all()
    )
    
@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )

    if order is None:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этому заказу",
        )

    return order

@router.get("/orders", response_model=list[OrderOut])
def get_all_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .order_by(Order.id.desc())
        .all()
    )


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    status_in: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )

    if order is None:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if status_in.status not in ALLOWED_ORDER_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недопустимый статус заказа",
        )

    order.status = status_in.status
    db.commit()
    db.refresh(order)
    return order
