from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.command_center.schemas import (
    DoctorReviewActionRequest,
    PriorityQueueItem,
    RecommendationApprovalRequest,
)

T = TypeVar("T")

_QUEUE: list[PriorityQueueItem] = [
    PriorityQueueItem(
        id="ccq_001",
        patient_id="pat_001",
        report_id="rpt_001",
        priority="critical",
        status="ready_for_review",
        owner="dr_mehra",
        recommendation="Escalate for immediate clinical review",
        due_at="2026-05-23T12:20:00Z",
    ),
    PriorityQueueItem(
        id="ccq_002",
        patient_id="pat_002",
        report_id="rpt_002",
        priority="high",
        status="summary_ready",
        owner="dr_iyer",
        recommendation="Compare inflammatory trend with baseline",
        due_at="2026-05-23T12:45:00Z",
    ),
]

_lock = Lock()


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


def _matches_exact_token(filters: tuple[str, ...], value: str) -> bool:
    if not filters:
        return True
    return value.lower() in filters


def _matches_query(query: str | None, *values: str) -> bool:
    if not query:
        return True
    token = query.lower()
    return any(token in value.lower() for value in values)


def _apply_pagination(items: Sequence[T], pagination: PaginationParams) -> list[T]:
    start = pagination.offset
    end = start + pagination.limit
    return list(items[start:end])


def list_priority_queue(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    priorities: Sequence[str] = (),
    statuses: Sequence[str] = (),
) -> tuple[list[PriorityQueueItem], int]:
    normalized_priorities = _normalize_tokens(priorities)
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        item
        for item in _QUEUE
        if (
            _matches_exact_token(normalized_priorities, item.priority)
            and _matches_exact_token(normalized_statuses, item.status)
            and _matches_query(
                search,
                item.id,
                item.patient_id,
                item.report_id,
                item.priority,
                item.status,
                item.owner,
                item.recommendation,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def apply_review_action(queue_id: str, payload: DoctorReviewActionRequest) -> PriorityQueueItem | None:
    with _lock:
        for index, item in enumerate(_QUEUE):
            if item.id != queue_id:
                continue
            next_status = payload.action.strip().lower().replace(" ", "_")
            updated = item.model_copy(update={"status": next_status})
            _QUEUE[index] = updated
            return updated
    return None


def approve_recommendation(
    queue_id: str,
    payload: RecommendationApprovalRequest,
) -> PriorityQueueItem | None:
    with _lock:
        for index, item in enumerate(_QUEUE):
            if item.id != queue_id:
                continue
            next_status = "approved" if payload.approved else "rejected"
            updated = item.model_copy(update={"status": next_status})
            _QUEUE[index] = updated
            return updated
    return None
