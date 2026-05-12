from typing import Any

from pydantic import BaseModel, Field


class ProductImageBase(BaseModel):
    image_url: str = Field(..., min_length=1, max_length=500)
    alt_text: str | None = None
    sort_order: int = 0
    is_primary: bool = False


class ProductImageCreate(ProductImageBase):
    pass


class ProductImageUpdate(ProductImageBase):
    pass


class ProductImageOut(ProductImageBase):
    id: int
    product_id: int

    model_config = {"from_attributes": True}


class ProductDrawingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    file_url: str = Field(..., min_length=1, max_length=500)
    preview_url: str | None = None
    description: str | None = None
    sort_order: int = 0


class ProductDrawingCreate(ProductDrawingBase):
    pass


class ProductDrawingUpdate(ProductDrawingBase):
    pass


class ProductDrawingOut(ProductDrawingBase):
    id: int
    product_id: int

    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    price: float = Field(..., ge=0)
    sku: str = Field(..., min_length=1, max_length=100)

    brand: str | None = "Lanttich"
    line: str | None = None
    image_url: str | None = None

    is_featured: bool = False
    is_active: bool = True
    in_stock: bool = True

    pack_quantity: int | None = Field(default=None, ge=0)
    weight_grams: int | None = Field(default=None, ge=0)

    load_capacity: str | None = None
    color: str | None = None
    coating: str | None = None
    size_label: str | None = None

    specifications: dict[str, Any] | None = None

    category_id: int


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductOut(ProductBase):
    id: int
    images: list[ProductImageOut] = Field(default_factory=list)
    drawings: list[ProductDrawingOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}
