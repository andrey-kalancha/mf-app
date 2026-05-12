from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.cart import Cart, CartItem  # noqa: F401
from app.models.category import Category
from app.models.integration import IntegrationSyncLog  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.price_list import PriceList, PriceListItem
from app.models.product import Product, ProductDrawing, ProductImage  # noqa: F401
from app.models.user import User  # noqa: F401
from app.services.pricing import resolve_product_price


def make_session():
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    return SessionLocal()


def test_personal_price_list_item_wins_over_base_price():
    db = make_session()
    category = Category(name="Системы выдвижения", slug="drawer-systems")
    product = Product(
        name="Направляющая скрытого монтажа",
        sku="TEST-001",
        price=1000,
        category=category,
    )
    price_list = PriceList(name="Персональный прайс", client_id=7, is_active=True)
    db.add_all([category, product, price_list])
    db.commit()

    item = PriceListItem(price_list_id=price_list.id, product_id=product.id, price=850, min_quantity=1)
    db.add(item)
    db.commit()

    pricing = resolve_product_price(db, user_id=7, product=product, quantity=1)

    assert pricing["unit_price"] == pricing["unit_price"].__class__("850.00")
    assert pricing["base_price"] == pricing["base_price"].__class__("1000.00")
    assert pricing["price_source"] == "price_list_item"
    assert pricing["applied_price_list_id"] == price_list.id


def test_general_discount_applies_when_item_price_is_missing():
    db = make_session()
    category = Category(name="Системы открывания", slug="opening-systems")
    product = Product(
        name="Навес регулируемый",
        sku="TEST-002",
        price=2000,
        category=category,
    )
    price_list = PriceList(name="Общий прайс", client_id=None, discount_percent=10, is_active=True)
    db.add_all([category, product, price_list])
    db.commit()

    pricing = resolve_product_price(db, user_id=12, product=product, quantity=1)

    assert pricing["unit_price"] == pricing["unit_price"].__class__("1800.00")
    assert pricing["price_source"] == "price_list_discount"
