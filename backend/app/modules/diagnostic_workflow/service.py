from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.diagnostic_workflow.schemas import (
    TransitionTaskRequest,
    WorkflowQueueItem,
    WorkflowTaskItem,
)

T = TypeVar("T")

_TASKS: list[WorkflowTaskItem] = [
    WorkflowTaskItem(
        id="wft_001",
        patient_id="pat_001",
        visit_id="vis_001",
        stage="sample_collection",
        status="pending",
        assignee_role="technician",
        priority="high",
        due_at="2026-05-23T12:45:00Z",
        updated_at="2026-05-23T09:10:00Z",
    ),
    WorkflowTaskItem(
        id="wft_002",
        patient_id="pat_002",
        visit_id="vis_002",
        stage="report_upload",
        status="in_progress",
        assignee_role="technician",
        priority="critical",
        due_at="2026-05-23T12:30:00Z",
        updated_at="2026-05-23T09:20:00Z",
    ),
    WorkflowTaskItem(
        id="wft_003",
        patient_id="pat_003",
        visit_id="vis_003",
        stage="doctor_review",
        status="ready",
        assignee_role="doctor",
        priority="critical",
        due_at="2026-05-23T12:25:00Z",
        updated_at="2026-05-23T09:35:00Z",
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


def list_workflow_tasks(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    stages: Sequence[str] = (),
    statuses: Sequence[str] = (),
) -> tuple[list[WorkflowTaskItem], int]:
    normalized_stages = _normalize_tokens(stages)
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        item
        for item in _TASKS
        if (
            _matches_exact_token(normalized_stages, item.stage)
            and _matches_exact_token(normalized_statuses, item.status)
            and _matches_query(
                search,
                item.id,
                item.patient_id,
                item.visit_id,
                item.stage,
                item.status,
                item.assignee_role,
                item.priority,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_technician_queue(
    *,
    pagination: PaginationParams,
    priorities: Sequence[str] = (),
) -> tuple[list[WorkflowQueueItem], int]:
    normalized_priorities = _normalize_tokens(priorities)
    queue = [
        WorkflowQueueItem(
            id=item.id,
            patient_id=item.patient_id,
            visit_id=item.visit_id,
            stage=item.stage,
            status=item.status,
            priority=item.priority,
            due_at=item.due_at,
            risk_level="high" if item.priority in {"high", "critical"} else "moderate",
        )
        for item in _TASKS
        if (
            item.assignee_role == "technician"
            and _matches_exact_token(normalized_priorities, item.priority)
        )
    ]
    total = len(queue)
    return _apply_pagination(queue, pagination), total


def list_doctor_review_queue(
    *,
    pagination: PaginationParams,
    priorities: Sequence[str] = (),
) -> tuple[list[WorkflowQueueItem], int]:
    normalized_priorities = _normalize_tokens(priorities)
    queue = [
        WorkflowQueueItem(
            id=item.id,
            patient_id=item.patient_id,
            visit_id=item.visit_id,
            stage=item.stage,
            status=item.status,
            priority=item.priority,
            due_at=item.due_at,
            risk_level="critical" if item.priority == "critical" else "high",
        )
        for item in _TASKS
        if (
            item.assignee_role == "doctor" or item.stage == "doctor_review"
        ) and _matches_exact_token(normalized_priorities, item.priority)
    ]
    total = len(queue)
    return _apply_pagination(queue, pagination), total


def transition_task(task_id: str, payload: TransitionTaskRequest) -> WorkflowTaskItem | None:
    with _lock:
        for index, item in enumerate(_TASKS):
            if item.id != task_id:
                continue
            updated = item.model_copy(
                update={
                    "stage": payload.next_stage.strip().lower().replace(" ", "_"),
                    "status": payload.next_status.strip().lower().replace(" ", "_"),
                    "updated_at": "2026-05-23T12:00:00Z",
                }
            )
            _TASKS[index] = updated
            return updated
    return None
