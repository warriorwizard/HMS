from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.b2b.schemas import (
    B2BBillingSummaryResponse,
    B2BCreateOrderRequest,
    B2BOrderItem,
    B2BOrdersResponse,
    B2BPartnersResponse,
    B2BPricingRulesResponse,
)
from app.modules.b2b.service import (
    create_b2b_order,
    list_b2b_billing_summary,
    list_b2b_orders,
    list_b2b_partners,
    list_b2b_pricing_rules,
)
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/b2b", tags=["b2b"])


@router.get("/partners", response_model=B2BPartnersResponse)
def get_b2b_partners(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> B2BPartnersResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_b2b_partners(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return B2BPartnersResponse.model_validate(payload)


@router.get("/pricing-rules", response_model=B2BPricingRulesResponse)
def get_b2b_pricing_rules(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    partner_id: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> B2BPricingRulesResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_b2b_pricing_rules(
        pagination=pagination,
        partner_id=partner_id,
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return B2BPricingRulesResponse.model_validate(payload)


@router.get("/orders", response_model=B2BOrdersResponse)
def get_b2b_orders(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    partner_id: str | None = Query(default=None),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> B2BOrdersResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_b2b_orders(
        pagination=pagination,
        search=normalize_search_query(q),
        partner_id=partner_id,
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return B2BOrdersResponse.model_validate(payload)


@router.post("/orders", response_model=B2BOrderItem, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: B2BCreateOrderRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> B2BOrderItem:
    return create_b2b_order(payload)


@router.get("/billing-summary", response_model=B2BBillingSummaryResponse)
def get_b2b_billing_summary(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    partner_id: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> B2BBillingSummaryResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_b2b_billing_summary(
        pagination=pagination,
        partner_id=partner_id,
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return B2BBillingSummaryResponse.model_validate(payload)
