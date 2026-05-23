from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.filtering import parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.db.session import get_db_session
from app.modules.audit.schemas import AuditEventsResponse
from app.modules.audit.service import list_audit_events
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/events", response_model=AuditEventsResponse)
def get_audit_events(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    tenant_id: str | None = Query(default=None),
    actor_id: str | None = Query(default=None),
    action_filters: str | list[str] | None = Query(default=None, alias="action"),
    resource_type_filters: str | list[str] | None = Query(default=None, alias="resource_type"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
    db: Session = Depends(get_db_session),
) -> AuditEventsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_audit_events(
        db,
        pagination=pagination,
        tenant_id=tenant_id,
        actor_id=actor_id,
        actions=parse_csv_values(action_filters),
        resource_types=parse_csv_values(resource_type_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return AuditEventsResponse.model_validate(payload)
