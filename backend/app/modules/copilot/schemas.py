from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class CopilotConversationItem(BaseModel):
    id: str
    patient_id: str
    report_id: str | None = None
    title: str
    created_at: str


class CopilotConversationsResponse(BaseModel):
    items: list[CopilotConversationItem]
    page: PageMeta


class CopilotMessageItem(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str


class CopilotMessagesResponse(BaseModel):
    items: list[CopilotMessageItem]
    page: PageMeta


class CreateConversationRequest(BaseModel):
    patient_id: str = Field(min_length=3, max_length=64)
    report_id: str | None = Field(default=None, max_length=64)
    title: str = Field(min_length=3, max_length=120)


class CreateMessageRequest(BaseModel):
    role: str = Field(min_length=2, max_length=32)
    content: str = Field(min_length=2, max_length=2000)


class CopilotContextResponse(BaseModel):
    patient_id: str
    report_id: str | None = None
    context_summary: str


class ProgressionSummaryRequest(BaseModel):
    patient_id: str = Field(min_length=3, max_length=64)
    report_id: str | None = Field(default=None, max_length=64)


class ProgressionSummaryResponse(BaseModel):
    patient_id: str
    summary: str


class NoteDraftRequest(BaseModel):
    patient_id: str = Field(min_length=3, max_length=64)
    report_id: str | None = Field(default=None, max_length=64)
    tone: str = Field(default="clinical", min_length=2, max_length=64)


class NoteDraftResponse(BaseModel):
    patient_id: str
    note_draft: str
