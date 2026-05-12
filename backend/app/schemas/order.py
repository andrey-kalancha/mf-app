from datetime import datetime

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    delivery_address: str | None = None


class OrderFromCartCreate(BaseModel):
    delivery_address: str | None = None


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: float
    delivery_address: str | None = None
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_company: str | None = None
    created_at: datetime
    items: list[OrderItemOut]

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str
