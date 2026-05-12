from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.integration import IntegrationSyncLog


SUPPORTED_ONE_C_ENTITIES = [
    "categories",
    "products",
    "stock",
    "prices",
    "orders",
]


def get_one_c_status(db: Session) -> dict[str, Any]:
    last_logs = (
        db.query(IntegrationSyncLog)
        .filter(IntegrationSyncLog.system == "1c")
        .order_by(IntegrationSyncLog.id.desc())
        .limit(10)
        .all()
    )

    return {
        "system": "1c",
        "is_configured": False,
        "supported_entities": SUPPORTED_ONE_C_ENTITIES,
        "last_logs": last_logs,
    }


def create_one_c_sync_task(
    db: Session,
    *,
    direction: str,
    entity_type: str,
    entity_id: str | None = None,
    payload: dict[str, Any] | None = None,
) -> IntegrationSyncLog:
    log = IntegrationSyncLog(
        system="1c",
        direction=direction,
        entity_type=entity_type,
        entity_id=entity_id,
        status="queued",
        message="Задача синхронизации 1C создана. Реальный обработчик подключается отдельным адаптером.",
        payload=payload,
    )

    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def mark_one_c_task_finished(
    db: Session,
    log: IntegrationSyncLog,
    *,
    status: str,
    message: str,
    payload: dict[str, Any] | None = None,
) -> IntegrationSyncLog:
    log.status = status
    log.message = message
    log.finished_at = datetime.utcnow()
    if payload is not None:
        log.payload = payload

    db.commit()
    db.refresh(log)
    return log
