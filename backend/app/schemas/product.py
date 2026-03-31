from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    category_id: int


class ProductUpdate(BaseModel):
    name: str
    sku: str
    price: float
    category_id: int


class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    category_id: int

    model_config = {"from_attributes": True}