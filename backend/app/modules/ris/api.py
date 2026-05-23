from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity
from app.modules.ris.schemas import (
    AssignRadiologistRequest,
    CreateImagingOrderRequest,
    ImagingOrderItem,
    ImagingOrdersResponse,
    UpdateImagingOrderStatusRequest,
)
from app.modules.ris.service import (
    assign_radiologist,
    create_imaging_order,
    list_imaging_orders,
    update_order_status,
)

router = APIRouter(prefix="/ris", tags=["ris"])


@router.get("/orders", response_model=ImagingOrdersResponse)
def get_imaging_orders(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    modality_filters: str | list[str] | None = Query(default=None, alias="modality"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> ImagingOrdersResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_imaging_orders(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
        modalities=parse_csv_values(modality_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return ImagingOrdersResponse.model_validate(payload)


@router.post("/orders", response_model=ImagingOrderItem, status_code=status.HTTP_201_CREATED)
def post_imaging_order(
    payload: CreateImagingOrderRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> ImagingOrderItem:
    return create_imaging_order(payload)


@router.patch("/orders/{order_id}/assign", response_model=ImagingOrderItem)
def patch_assign_radiologist(
    order_id: str,
    payload: AssignRadiologistRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> ImagingOrderItem:
    item = assign_radiologist(order_id, payload)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imaging order not found")
    return item


@router.patch("/orders/{order_id}/status", response_model=ImagingOrderItem)
def patch_order_status(
    order_id: str,
    payload: UpdateImagingOrderStatusRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> ImagingOrderItem:
    item = update_order_status(order_id, payload)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imaging order not found")
    return item
