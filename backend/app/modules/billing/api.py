from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.billing.schemas import (
    BillingOrderItem,
    BillingOrdersResponse,
    CreateBillingOrderRequest,
    InvoicesResponse,
    PaymentItem,
    PaymentsResponse,
    RecordPaymentRequest,
    ServiceCatalogResponse,
)
from app.modules.billing.service import (
    create_order,
    list_invoices,
    list_orders,
    list_payments,
    list_service_catalog,
    record_payment,
)
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/services", response_model=ServiceCatalogResponse)
def get_service_catalog(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    department_filters: str | list[str] | None = Query(default=None, alias="department"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> ServiceCatalogResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_service_catalog(
        pagination=pagination,
        statuses=parse_csv_values(status_filters),
        departments=parse_csv_values(department_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return ServiceCatalogResponse.model_validate(payload)


@router.get("/orders", response_model=BillingOrdersResponse)
def get_billing_orders(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> BillingOrdersResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_orders(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return BillingOrdersResponse.model_validate(payload)


@router.post("/orders", response_model=BillingOrderItem, status_code=status.HTTP_201_CREATED)
def post_billing_order(
    payload: CreateBillingOrderRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> BillingOrderItem:
    try:
        return create_order(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/invoices", response_model=InvoicesResponse)
def get_invoices(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> InvoicesResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_invoices(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return InvoicesResponse.model_validate(payload)


@router.get("/payments", response_model=PaymentsResponse)
def get_payments(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    method_filters: str | list[str] | None = Query(default=None, alias="method"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> PaymentsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_payments(
        pagination=pagination,
        statuses=parse_csv_values(status_filters),
        methods=parse_csv_values(method_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return PaymentsResponse.model_validate(payload)


@router.post("/payments", response_model=PaymentItem, status_code=status.HTTP_201_CREATED)
def post_payment(
    payload: RecordPaymentRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> PaymentItem:
    try:
        return record_payment(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
