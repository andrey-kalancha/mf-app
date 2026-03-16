from fastapi import FastAPI

from app.api.routes import health, categories, products
from app.core.config import settings
from app.core.database import Base, engine

from app.models.user import User
from app.models.category import Category
from app.models.product import Product


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.include_router(health.router)
app.include_router(categories.router, prefix=settings.api_prefix)
app.include_router(products.router, prefix=settings.api_prefix)