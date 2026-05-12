from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, cart, categories, health, integrations, orders
from app.api.routes import price_lists, product_media, products, profile, users
from app.core.config import settings
from app.core.database import Base, engine
from app.core.schema_sync import sync_dev_schema

# Imported so SQLAlchemy registers all tables before create_all.
from app.models.cart import Cart, CartItem
from app.models.category import Category
from app.models.integration import IntegrationSyncLog
from app.models.order import Order, OrderItem
from app.models.price_list import PriceList, PriceListItem
from app.models.product import Product, ProductDrawing, ProductImage
from app.models.user import User


Base.metadata.create_all(bind=engine)
sync_dev_schema()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://172.18.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(categories.router, prefix=settings.api_prefix)
app.include_router(products.router, prefix=settings.api_prefix)
app.include_router(product_media.router, prefix=settings.api_prefix)
app.include_router(price_lists.router, prefix=settings.api_prefix)
app.include_router(integrations.router, prefix=settings.api_prefix)
app.include_router(orders.router, prefix=settings.api_prefix)
app.include_router(cart.router, prefix=settings.api_prefix)
app.include_router(profile.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
