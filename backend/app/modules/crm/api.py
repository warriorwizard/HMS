from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.crm.schemas import (
    CRMCampaignsResponse,
    CRMLeadsResponse,
    CRMRemindersResponse,
)
from app.modules.crm.service import list_crm_campaigns, list_crm_leads, list_crm_reminders
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/crm", tags=["crm"])


@router.get("/leads", response_model=CRMLeadsResponse)
def get_crm_leads(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> CRMLeadsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_crm_leads(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return CRMLeadsResponse.model_validate(payload)


@router.get("/reminders", response_model=CRMRemindersResponse)
def get_crm_reminders(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    priority_filters: str | list[str] | None = Query(default=None, alias="priority"),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> CRMRemindersResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_crm_reminders(
        pagination=pagination,
        priorities=parse_csv_values(priority_filters),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return CRMRemindersResponse.model_validate(payload)


@router.get("/campaigns", response_model=CRMCampaignsResponse)
def get_crm_campaigns(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    channel_filters: str | list[str] | None = Query(default=None, alias="channel"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> CRMCampaignsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_crm_campaigns(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
        channels=parse_csv_values(channel_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return CRMCampaignsResponse.model_validate(payload)
