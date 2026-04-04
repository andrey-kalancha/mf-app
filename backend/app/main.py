from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, categories, products, auth, profile, users
from app.core.config import settings
from app.core.database import Base, engine
from app.models.cart import Cart, CartItem

from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.api.routes import orders
from app.api.routes import cart




Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

# 👇 ВОТ ЭТО ДОБАВЬ СРАЗУ ПОСЛЕ СОЗДАНИЯ app
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
app.include_router(orders.router, prefix=settings.api_prefix)
app.include_router(cart.router, prefix=settings.api_prefix)
app.include_router(profile.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)