from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.api.pagination import PaginationParams
from app.modules.identity.models import AuditLog
from app.modules.audit.schemas import AuditEventItem


def write_audit_log(
    db: Session,
    *,
    action: str,
    resource_type: str,
    tenant_id: str | None = None,
    actor_id: str | None = None,
    actor_role: str | None = None,
    resource_id: str | None = None,
    metadata: dict | None = None,
    ip_hash: str | None = None,
) -> AuditLog:
    entry = AuditLog(
        tenant_id=tenant_id,
        actor_id=actor_id,
        actor_role=actor_role,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata_json=metadata,
        ip_hash=ip_hash,
    )
    db.add(entry)
    return entry


def _normalize_tokens(values: Sequence[str]) -> tuple[str, ...]:
    normalized: list[str] = []
    seen: set[str] = set()
    for value in values:
        token = value.strip().lower()
        if not token or token in seen:
            continue
        normalized.append(token)
        seen.add(token)
    return tuple(normalized)


def list_audit_events(
    db: Session,
    *,
    pagination: PaginationParams,
    tenant_id: str | None = None,
    actor_id: str | None = None,
    actions: Sequence[str] = (),
    resource_types: Sequence[str] = (),
) -> tuple[list[AuditEventItem], int]:
    normalized_actions = _normalize_tokens(actions)
    normalized_resource_types = _normalize_tokens(resource_types)

    filters = []
    if tenant_id:
        filters.append(AuditLog.tenant_id == tenant_id)
    if actor_id:
        filters.append(AuditLog.actor_id == actor_id)
    if normalized_actions:
        filters.append(func.lower(AuditLog.action).in_(normalized_actions))
    if normalized_resource_types:
        filters.append(func.lower(AuditLog.resource_type).in_(normalized_resource_types))

    total_stmt = select(func.count()).select_from(AuditLog).where(*filters)
    total = int(db.execute(total_stmt).scalar_one())

    stmt = (
        select(AuditLog)
        .where(*filters)
        .order_by(AuditLog.created_at.desc())
        .limit(pagination.limit)
        .offset(pagination.offset)
    )
    rows = db.execute(stmt).scalars().all()
    items = [
        AuditEventItem(
            id=row.id,
            tenant_id=row.tenant_id,
            actor_id=row.actor_id,
            actor_role=row.actor_role,
            action=row.action,
            resource_type=row.resource_type,
            resource_id=row.resource_id,
            ip_hash=row.ip_hash,
            created_at=row.created_at.isoformat(),
        )
        for row in rows
    ]
    return items, total
