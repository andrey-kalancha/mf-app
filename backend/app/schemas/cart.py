from pydantic import BaseModel, Field


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)


class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    base_price: float
    total_price: float
    price_source: str
    applied_price_list_id: int | None = None



class CartOut(BaseModel):
    id: int
    user_id: int
    items: list[CartItemOut]
    total_amount: float
