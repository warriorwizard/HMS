from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.copilot.schemas import (
    CopilotContextResponse,
    CopilotConversationItem,
    CopilotConversationsResponse,
    CopilotMessageItem,
    CopilotMessagesResponse,
    CreateConversationRequest,
    CreateMessageRequest,
    NoteDraftRequest,
    NoteDraftResponse,
    ProgressionSummaryRequest,
    ProgressionSummaryResponse,
)
from app.modules.copilot.service import (
    context_for_patient,
    create_conversation,
    create_message,
    generate_note_draft,
    generate_progression_summary,
    list_conversations,
    list_messages,
)
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/copilot", tags=["copilot"])


@router.get("/conversations", response_model=CopilotConversationsResponse)
def get_conversations(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    patient_filters: str | list[str] | None = Query(default=None, alias="patient_id"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> CopilotConversationsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_conversations(
        pagination=pagination,
        patient_ids=parse_csv_values(patient_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return CopilotConversationsResponse.model_validate(payload)


@router.post("/conversations", response_model=CopilotConversationItem, status_code=status.HTTP_201_CREATED)
def post_conversation(
    payload: CreateConversationRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> CopilotConversationItem:
    return create_conversation(payload)


@router.get("/conversations/{conversation_id}/messages", response_model=CopilotMessagesResponse)
def get_conversation_messages(
    conversation_id: str,
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> CopilotMessagesResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_messages(conversation_id=conversation_id, pagination=pagination)
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return CopilotMessagesResponse.model_validate(payload)


@router.post("/conversations/{conversation_id}/messages", response_model=CopilotMessageItem, status_code=status.HTTP_201_CREATED)
def post_conversation_message(
    conversation_id: str,
    payload: CreateMessageRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> CopilotMessageItem:
    item = create_message(conversation_id, payload)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return item


@router.get("/context", response_model=CopilotContextResponse)
def get_context(
    patient_id: str = Query(...),
    report_id: str | None = Query(default=None),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> CopilotContextResponse:
    return context_for_patient(patient_id=patient_id, report_id=report_id)


@router.post("/progression-summary", response_model=ProgressionSummaryResponse)
def post_progression_summary(
    payload: ProgressionSummaryRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> ProgressionSummaryResponse:
    return generate_progression_summary(payload)


@router.post("/note-draft", response_model=NoteDraftResponse)
def post_note_draft(
    payload: NoteDraftRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> NoteDraftResponse:
    return generate_note_draft(payload)
