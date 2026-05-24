from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.notifications.schemas import (
    CreateNotificationRequest,
    NotificationItem,
    PatientShareDispatchRequest,
    PatientShareDispatchResponse,
    PatientShareOtpRequest,
    PatientShareOtpResponse,
)

T = TypeVar("T")

_BASE_NOTIFICATIONS: tuple[NotificationItem, ...] = (
    NotificationItem(
        id="ntf_001",
        user_id="usr_ops",
        title="Escalation SLA warning",
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


@dataclass(frozen=True)
class PendingPatientShare:
    share_id: str
    patient_id: str
    recipient: str
    channel: str
    otp_code: str
    expires_at: str
    consumed: bool = False


_share_lock = Lock()
_patient_share_store: dict[str, PendingPatientShare] = {}


class NotificationProviderAdapter:
    provider_name = "mock-provider"

    def send(self, *, channel: str, recipient: str, message: str) -> dict[str, str]:
        if channel not in {"sms", "email"}:
            raise ValueError("Unsupported notification channel")
        if not recipient:
            raise ValueError("Recipient is required")
        if not message:
            raise ValueError("Message is required")
        return {
            "provider": self.provider_name,
            "status": "sent",
            "sent_at": "2026-05-23T00:20:00Z",
        }


_provider_adapter = NotificationProviderAdapter()


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


def _next_share_id() -> str:
    with _share_lock:
        max_identifier = 0
        for share_id in _patient_share_store:
            if not share_id.startswith("shr_"):
                continue
            suffix = share_id.split("_", 1)[1]
            if suffix.isdigit():
                max_identifier = max(max_identifier, int(suffix))
        return f"shr_{max_identifier + 1:03d}"


def reset_notifications_store() -> None:
    global _notifications_store
    with _notifications_lock:
        _notifications_store = list(_BASE_NOTIFICATIONS)
    with _share_lock:
        _patient_share_store.clear()


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
            and _matches_query(search, item.id, item.title, item.message, item.user_id, item.status)
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


def create_patient_share_otp(payload: PatientShareOtpRequest) -> PatientShareOtpResponse:
    if payload.channel not in {"sms", "email"}:
        raise ValueError("Channel must be sms or email")
    share_id = _next_share_id()
    share = PendingPatientShare(
        share_id=share_id,
        patient_id=payload.patient_id,
        recipient=payload.recipient,
        channel=payload.channel,
        otp_code="730194",
        expires_at="2026-05-23T01:00:00Z",
        consumed=False,
    )
    with _share_lock:
        _patient_share_store[share_id] = share
    return PatientShareOtpResponse(
        share_id=share.share_id,
        otp_code=share.otp_code,
        expires_at=share.expires_at,
    )


def dispatch_patient_share(
    payload: PatientShareDispatchRequest,
) -> PatientShareDispatchResponse:
    with _share_lock:
        share = _patient_share_store.get(payload.share_id)
        if share is None:
            raise ValueError("Share request was not found")
        if share.consumed:
            raise ValueError("Share request has already been used")
        if share.otp_code != payload.otp_code:
            raise ValueError("Invalid OTP code")

        provider_result = _provider_adapter.send(
            channel=share.channel,
            recipient=share.recipient,
            message=payload.message,
        )
        _patient_share_store[share.share_id] = PendingPatientShare(
            share_id=share.share_id,
            patient_id=share.patient_id,
            recipient=share.recipient,
            channel=share.channel,
            otp_code=share.otp_code,
            expires_at=share.expires_at,
            consumed=True,
        )

    return PatientShareDispatchResponse(
        share_id=share.share_id,
        channel=share.channel,
        recipient=share.recipient,
        provider=provider_result["provider"],
        status=provider_result["status"],
        sent_at=provider_result["sent_at"],
    )
