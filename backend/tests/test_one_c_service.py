from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.cart import Cart, CartItem  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.integration import IntegrationSyncLog  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.price_list import PriceList, PriceListItem  # noqa: F401
from app.models.product import Product, ProductDrawing, ProductImage  # noqa: F401
from app.models.user import User  # noqa: F401
from app.services.one_c import create_one_c_sync_task, get_one_c_status


def make_session():
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    return SessionLocal()


def test_one_c_sync_task_is_queued_and_visible_in_status():
    db = make_session()

    log = create_one_c_sync_task(
        db,
        direction="import",
        entity_type="products",
        payload={"source": "demo"},
    )
    status = get_one_c_status(db)

    assert log.status == "queued"
    assert log.system == "1c"
    assert "products" in status["supported_entities"]
    assert status["last_logs"][0].id == log.id
