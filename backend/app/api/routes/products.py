from fastapi import APIRouter

router = APIRouter()

@router.get("/products")
def get_products():
    return {"products": []}

@router.get("/products/{product_id}")
def get_product(product_id: int):
    return {"product_id": product_id}