from __future__ import annotations

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    parent_id: int | None = None
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int

    model_config = {"from_attributes": True}


class CategoryTreeOut(CategoryOut):
    children: list[CategoryTreeOut] = Field(default_factory=list)
