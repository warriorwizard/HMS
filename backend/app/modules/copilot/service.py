from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.copilot.schemas import (
    CopilotContextResponse,
    CopilotConversationItem,
    CopilotMessageItem,
    CreateConversationRequest,
    CreateMessageRequest,
    NoteDraftRequest,
    NoteDraftResponse,
    ProgressionSummaryRequest,
    ProgressionSummaryResponse,
)

T = TypeVar("T")

_CONVERSATIONS: list[CopilotConversationItem] = [
    CopilotConversationItem(
        id="cvn_001",
        patient_id="pat_001",
        report_id="rpt_001",
        title="Pulmonary follow-up briefing",
        created_at="2026-05-23T09:40:00Z",
    )
]

_MESSAGES: list[CopilotMessageItem] = [
    CopilotMessageItem(
        id="msg_001",
        conversation_id="cvn_001",
        role="doctor",
        content="Summarize the latest progression and high-risk findings.",
        created_at="2026-05-23T09:41:00Z",
    ),
    CopilotMessageItem(
        id="msg_002",
        conversation_id="cvn_001",
        role="copilot",
        content="Progression shows worsening opacity trend. Recommend urgent same-day review.",
        created_at="2026-05-23T09:41:05Z",
    ),
]

_next_conversation_id = 2
_next_message_id = 3
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


def _apply_pagination(items: Sequence[T], pagination: PaginationParams) -> list[T]:
    start = pagination.offset
    end = start + pagination.limit
    return list(items[start:end])


def list_conversations(
    *,
    pagination: PaginationParams,
    patient_ids: Sequence[str] = (),
) -> tuple[list[CopilotConversationItem], int]:
    normalized_patients = _normalize_tokens(patient_ids)
    filtered = [
        item
        for item in _CONVERSATIONS
        if not normalized_patients or item.patient_id.lower() in normalized_patients
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def create_conversation(payload: CreateConversationRequest) -> CopilotConversationItem:
    global _next_conversation_id

    with _lock:
        item = CopilotConversationItem(
            id=f"cvn_{_next_conversation_id:03d}",
            patient_id=payload.patient_id,
            report_id=payload.report_id,
            title=payload.title,
            created_at="2026-05-23T12:00:00Z",
        )
        _CONVERSATIONS.append(item)
        _next_conversation_id += 1

    return item


def list_messages(
    *,
    conversation_id: str,
    pagination: PaginationParams,
) -> tuple[list[CopilotMessageItem], int]:
    filtered = [item for item in _MESSAGES if item.conversation_id == conversation_id]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def create_message(conversation_id: str, payload: CreateMessageRequest) -> CopilotMessageItem | None:
    global _next_message_id

    if not any(item.id == conversation_id for item in _CONVERSATIONS):
        return None

    with _lock:
        message = CopilotMessageItem(
            id=f"msg_{_next_message_id:03d}",
            conversation_id=conversation_id,
            role=payload.role.strip().lower(),
            content=payload.content.strip(),
            created_at="2026-05-23T12:00:00Z",
        )
        _MESSAGES.append(message)
        _next_message_id += 1

    return message


def context_for_patient(*, patient_id: str, report_id: str | None = None) -> CopilotContextResponse:
    context = (
        "Patient has active imaging follow-up, AI risk signal above threshold, and pending doctor queue item."
    )
    if report_id:
        context += f" Report {report_id} includes respiratory findings needing rapid interpretation."
    return CopilotContextResponse(patient_id=patient_id, report_id=report_id, context_summary=context)


def generate_progression_summary(payload: ProgressionSummaryRequest) -> ProgressionSummaryResponse:
    summary = (
        "Symptoms and imaging findings show progression over the last two encounters. "
        "Escalation priority remains high until repeat imaging confirms stability."
    )
    return ProgressionSummaryResponse(patient_id=payload.patient_id, summary=summary)


def generate_note_draft(payload: NoteDraftRequest) -> NoteDraftResponse:
    draft = (
        f"[{payload.tone}] Patient {payload.patient_id} reviewed with current report context. "
        "Recommend urgent clinical correlation, repeat vitals, and same-day physician assessment."
    )
    return NoteDraftResponse(patient_id=payload.patient_id, note_draft=draft)
