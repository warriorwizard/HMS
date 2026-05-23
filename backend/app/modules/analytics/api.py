from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.analytics.schemas import (
    AnalyticsAiUsageResponse,
    AnalyticsEventsResponse,
    AnalyticsRevenueSummaryResponse,
    AnalyticsTatMetricsResponse,
    AnalyticsWorkflowBottlenecksResponse,
)
from app.modules.analytics.service import (
    list_ai_usage,
    list_analytics_events,
    list_revenue_summary,
    list_tat_metrics,
    list_workflow_bottlenecks,
)
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/events", response_model=AnalyticsEventsResponse)
def get_analytics_events(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    event_type_filters: str | list[str] | None = Query(default=None, alias="event_type"),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    department_filters: str | list[str] | None = Query(default=None, alias="department"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> AnalyticsEventsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_analytics_events(
        pagination=pagination,
        search=normalize_search_query(q),
        event_types=parse_csv_values(event_type_filters),
        statuses=parse_csv_values(status_filters),
        departments=parse_csv_values(department_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return AnalyticsEventsResponse.model_validate(payload)


@router.get("/tat-metrics", response_model=AnalyticsTatMetricsResponse)
def get_tat_metrics(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    department_filters: str | list[str] | None = Query(default=None, alias="department"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> AnalyticsTatMetricsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_tat_metrics(
        pagination=pagination,
        statuses=parse_csv_values(status_filters),
        departments=parse_csv_values(department_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return AnalyticsTatMetricsResponse.model_validate(payload)


@router.get("/workflow-bottlenecks", response_model=AnalyticsWorkflowBottlenecksResponse)
def get_workflow_bottlenecks(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    department_filters: str | list[str] | None = Query(default=None, alias="department"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> AnalyticsWorkflowBottlenecksResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_workflow_bottlenecks(
        pagination=pagination,
        statuses=parse_csv_values(status_filters),
        departments=parse_csv_values(department_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return AnalyticsWorkflowBottlenecksResponse.model_validate(payload)


@router.get("/revenue-summary", response_model=AnalyticsRevenueSummaryResponse)
def get_revenue_summary(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    department_filters: str | list[str] | None = Query(default=None, alias="department"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> AnalyticsRevenueSummaryResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_revenue_summary(
        pagination=pagination,
        statuses=parse_csv_values(status_filters),
        departments=parse_csv_values(department_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return AnalyticsRevenueSummaryResponse.model_validate(payload)


@router.get("/ai-usage", response_model=AnalyticsAiUsageResponse)
def get_ai_usage(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> AnalyticsAiUsageResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_ai_usage(
        pagination=pagination,
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return AnalyticsAiUsageResponse.model_validate(payload)
