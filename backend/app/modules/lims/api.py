from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity
from app.modules.lims.schemas import (
    CreateSampleRequest,
    SampleItem,
    SamplesResponse,
    UpdateSampleStatusRequest,
)
from app.modules.lims.service import create_sample, list_samples, update_sample_status

router = APIRouter(prefix="/lims", tags=["lims"])


@router.get("/samples", response_model=SamplesResponse)
def get_samples(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> SamplesResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_samples(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return SamplesResponse.model_validate(payload)


@router.post("/samples", response_model=SampleItem, status_code=status.HTTP_201_CREATED)
def post_sample(
    payload: CreateSampleRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> SampleItem:
    return create_sample(payload)


@router.patch("/samples/{sample_id}/status", response_model=SampleItem)
def patch_sample_status(
    sample_id: str,
    payload: UpdateSampleStatusRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> SampleItem:
    item = update_sample_status(sample_id, payload)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample not found")
    return item
