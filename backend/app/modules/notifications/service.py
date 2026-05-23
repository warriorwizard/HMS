from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.notifications.schemas import CreateNotificationRequest, NotificationItem

T = TypeVar("T")

_BASE_NOTIFICATIONS: tuple[NotificationItem, ...] = (
    NotificationItem(
        id="ntf_001",
        user_id="usr_ops",
        title="Escalation queue warning",
        message="3 studies exceeded review SLA threshold.",
        channel="in_app",
        status="sent",
        is_read=False,
        created_at="2026-05-22T08:30:00Z",
        read_at=None,
    ),
    NotificationItem(
        id="ntf_002",
        user_id="usr_ops",
        title="Revenue summary ready",
        message="Weekly payer settlement report is available.",
        channel="email",
        status="sent",
        is_read=True,
        created_at="2026-05-21T16:10:00Z",
        read_at="2026-05-21T16:18:00Z",
    ),
    NotificationItem(
        id="ntf_003",
        user_id="usr_ops",
        title="Follow-up reminder overdue",
        message="9 high-priority follow-ups are pending outreach.",
        channel="in_app",
        status="queued",
        is_read=False,
        created_at="2026-05-22T10:05:00Z",
        read_at=None,
    ),
    NotificationItem(
        id="ntf_004",
        user_id="usr_ops",
        title="B2B order sync failed",
        message="Partner order feed from Beacon Bio retried twice.",
        channel="sms",
        status="failed",
        is_read=False,
        created_at="2026-05-22T11:20:00Z",
        read_at=None,
    ),
)

_notifications_lock = Lock()
_notifications_store: list[NotificationItem] = list(_BASE_NOTIFICATIONS)


def _normalize_tokens(values: Sequence[str]) -> tuple[str, ...]:
    normalized: list[str] = []
    seen: set[str] = set()
    for value in values:
        token = value.strip().lower()
        if not token or token in seen:
            continue
        normalized.append(token)
        seen.add(token)
    return tuple(normalized)


def _matches_query(query: str | None, *values: str) -> bool:
    if not query:
        return True
    query_lower = query.lower()
    return any(query_lower in value.lower() for value in values)


def _apply_pagination(items: Sequence[T], pagination: PaginationParams) -> list[T]:
    start = pagination.offset
    end = start + pagination.limit
    return list(items[start:end])


def _next_notification_id(items: Sequence[NotificationItem]) -> str:
    max_identifier = 0
    for item in items:
        if not item.id.startswith("ntf_"):
            continue
        suffix = item.id.split("_", 1)[1]
        if suffix.isdigit():
            max_identifier = max(max_identifier, int(suffix))
    return f"ntf_{max_identifier + 1:03d}"


def reset_notifications_store() -> None:
    global _notifications_store
    with _notifications_lock:
        _notifications_store = list(_BASE_NOTIFICATIONS)


def list_notifications(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
    channels: Sequence[str] = (),
    is_read: bool | None = None,
) -> tuple[list[NotificationItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    normalized_channels = _normalize_tokens(channels)
    with _notifications_lock:
        items = tuple(_notifications_store)

    filtered = [
        item
        for item in items
        if (
            (not normalized_statuses or item.status.lower() in normalized_statuses)
            and (not normalized_channels or item.channel.lower() in normalized_channels)
            and (is_read is None or item.is_read == is_read)
            and _matches_query(search, item.id, item.title, item.message, item.user_id)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def create_notification(payload: CreateNotificationRequest) -> NotificationItem:
    with _notifications_lock:
        notification = NotificationItem(
            id=_next_notification_id(_notifications_store),
            user_id=payload.user_id,
            title=payload.title,
            message=payload.message,
            channel=payload.channel,
            status=payload.status,
            is_read=False,
            created_at="2026-05-23T00:00:00Z",
            read_at=None,
        )
        _notifications_store.append(notification)
    return notification


def mark_notification_read(notification_id: str) -> NotificationItem | None:
    with _notifications_lock:
        for index, item in enumerate(_notifications_store):
            if item.id != notification_id:
                continue
            read_at = item.read_at if item.is_read else "2026-05-23T00:10:00Z"
            updated = item.model_copy(update={"is_read": True, "read_at": read_at})
            _notifications_store[index] = updated
            return updated
    return None
