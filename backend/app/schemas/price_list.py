from datetime import datetime

from pydantic import BaseModel, Field


class PriceListItemBase(BaseModel):
    product_id: int
    price: float = Field(..., ge=0)
    min_quantity: int = Field(default=1, ge=1)
    note: str | None = None


class PriceListItemCreate(PriceListItemBase):
    pass


class PriceListItemUpdate(PriceListItemBase):
    pass


class PriceListItemOut(PriceListItemBase):
    id: int
    price_list_id: int

    model_config = {"from_attributes": True}


class PriceListBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    client_id: int | None = None
    description: str | None = None
    discount_percent: float | None = Field(default=None, ge=0, le=100)
    currency: str = Field(default="KZT", min_length=1, max_length=10)
    is_active: bool = True


class PriceListCreate(PriceListBase):
    pass


class PriceListUpdate(PriceListBase):
    pass


class PriceListOut(PriceListBase):
    id: int
    created_at: datetime
    updated_at: datetime
    items: list[PriceListItemOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}
