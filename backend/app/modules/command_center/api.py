from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.command_center.schemas import (
    DoctorReviewActionRequest,
    PriorityQueueItem,
    PriorityQueueResponse,
    RecommendationApprovalRequest,
)
from app.modules.command_center.service import (
    apply_review_action,
    approve_recommendation,
    list_priority_queue,
)
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/command-center", tags=["command-center"])


@router.get("/queue", response_model=PriorityQueueResponse)
def get_priority_queue(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    priority_filters: str | list[str] | None = Query(default=None, alias="priority"),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> PriorityQueueResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_priority_queue(
        pagination=pagination,
        search=normalize_search_query(q),
        priorities=parse_csv_values(priority_filters),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return PriorityQueueResponse.model_validate(payload)


@router.post("/reviews/{queue_id}/action", response_model=PriorityQueueItem)
def post_review_action(
    queue_id: str,
    payload: DoctorReviewActionRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> PriorityQueueItem:
    item = apply_review_action(queue_id, payload)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Queue item not found")
    return item


@router.post("/recommendations/{queue_id}/approval", response_model=PriorityQueueItem)
def post_recommendation_approval(
    queue_id: str,
    payload: RecommendationApprovalRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> PriorityQueueItem:
    item = approve_recommendation(queue_id, payload)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Queue item not found")
    return item
