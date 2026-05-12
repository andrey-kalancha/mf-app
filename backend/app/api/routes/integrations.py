from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.schemas.integration import (
    IntegrationSyncLogOut,
    OneCStatusOut,
    OneCSyncRequest,
)
from app.services.one_c import create_one_c_sync_task as queue_one_c_sync_task
from app.services.one_c import get_one_c_status as load_one_c_status

router = APIRouter(tags=["integrations"])


@router.get("/integrations/1c/status", response_model=OneCStatusOut)
def get_one_c_status(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return load_one_c_status(db)


@router.post(
    "/integrations/1c/sync",
    response_model=IntegrationSyncLogOut,
    status_code=status.HTTP_202_ACCEPTED,
)
def create_one_c_sync_task(
    sync_in: OneCSyncRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return queue_one_c_sync_task(
        db,
        direction=sync_in.direction,
        entity_type=sync_in.entity_type,
        entity_id=sync_in.entity_id,
        payload=sync_in.payload,
    )
