from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: int
    name: str
    parent_id: int | None = None

    model_config = {"from_attributes": True}