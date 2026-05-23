from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class PriorityQueueItem(BaseModel):
    id: str
    patient_id: str
    report_id: str
    priority: str
    status: str
    owner: str
    recommendation: str
    due_at: str


class PriorityQueueResponse(BaseModel):
    items: list[PriorityQueueItem]
    page: PageMeta


class DoctorReviewActionRequest(BaseModel):
    action: str = Field(min_length=2, max_length=64)
    note: str | None = Field(default=None, max_length=280)


class RecommendationApprovalRequest(BaseModel):
    approved: bool
    note: str | None = Field(default=None, max_length=280)
