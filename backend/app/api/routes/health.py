from fastapi import APIRouter
import os

router = APIRouter()

@router.get("/health")
def health():
    return {
        "status": "ok",
        "database_url": os.getenv("DATABASE_URL"),
        "redis_url": os.getenv("REDIS_URL")
    }