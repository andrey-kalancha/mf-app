from pydantic import BaseModel


class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    price: float
    category_id: int

    model_config = {"from_attributes": True}