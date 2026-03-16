from fastapi import FastAPI

from app.api.routes.categories import router as categories_router
from app.api.routes.health import router as health_router
from app.api.routes.products import router as products_router
from app.core.config import settings
from app.core.database import Base, engine
import app.models  # noqa: F401

app = FastAPI(title=settings.app_name, version=settings.app_version)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


app.include_router(health_router)
app.include_router(categories_router, prefix=settings.api_prefix)
app.include_router(products_router, prefix=settings.api_prefix)
