from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity
from app.modules.notifications.schemas import (
    CreateNotificationRequest,
    NotificationItem,
    NotificationsResponse,
)
from app.modules.notifications.service import (
    create_notification,
    list_notifications,
    mark_notification_read,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationsResponse)
def get_notifications(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    channel_filters: str | list[str] | None = Query(default=None, alias="channel"),
    is_read: bool | None = Query(default=None),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> NotificationsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_notifications(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
        channels=parse_csv_values(channel_filters),
        is_read=is_read,
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return NotificationsResponse.model_validate(payload)


@router.post("", response_model=NotificationItem, status_code=status.HTTP_201_CREATED)
def post_notification(
    payload: CreateNotificationRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> NotificationItem:
    return create_notification(payload)


@router.patch("/{notification_id}/read", response_model=NotificationItem)
def patch_notification_read(
    notification_id: str,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> NotificationItem:
    notification = mark_notification_read(notification_id)
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return notification
