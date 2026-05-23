from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.db.session import get_db_session
from app.modules.identity.admin_schemas import AdminMembershipsResponse, AdminTenantsResponse
from app.modules.identity.admin_service import list_admin_memberships, list_admin_tenants
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/tenants", response_model=AdminTenantsResponse)
def get_admin_tenants(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
    db: Session = Depends(get_db_session),
) -> AdminTenantsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_admin_tenants(
        db,
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return AdminTenantsResponse.model_validate(payload)


@router.get("/memberships", response_model=AdminMembershipsResponse)
def get_admin_memberships(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    tenant_id: str | None = Query(default=None),
    role_key: str | None = Query(default=None),
    _: AuthenticatedIdentity = Depends(get_current_identity),
    db: Session = Depends(get_db_session),
) -> AdminMembershipsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_admin_memberships(
        db,
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
        tenant_id=tenant_id,
        role_key=role_key,
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return AdminMembershipsResponse.model_validate(payload)
