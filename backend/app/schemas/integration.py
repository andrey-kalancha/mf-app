from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class OneCSyncRequest(BaseModel):
    direction: str = Field(default="import", max_length=50)
    entity_type: str = Field(default="catalog", max_length=100)
    entity_id: str | None = Field(default=None, max_length=100)
    payload: dict[str, Any] | None = None


class IntegrationSyncLogOut(BaseModel):
    id: int
    system: str
    direction: str
    entity_type: str
    entity_id: str | None = None
    status: str
    message: str | None = None
    payload: dict[str, Any] | None = None
    created_at: datetime
    finished_at: datetime | None = None

    model_config = {"from_attributes": True}


class OneCStatusOut(BaseModel):
    system: str = "1c"
    is_configured: bool
    supported_entities: list[str]
    last_logs: list[IntegrationSyncLogOut]
