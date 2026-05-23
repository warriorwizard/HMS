from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class WorkflowTaskItem(BaseModel):
    id: str
    patient_id: str
    visit_id: str
    stage: str
    status: str
    assignee_role: str
    priority: str
    due_at: str
    updated_at: str


class WorkflowTasksResponse(BaseModel):
    items: list[WorkflowTaskItem]
    page: PageMeta


class TransitionTaskRequest(BaseModel):
    next_stage: str = Field(min_length=2, max_length=64)
    next_status: str = Field(min_length=2, max_length=64)
    comment: str | None = Field(default=None, max_length=240)


class WorkflowQueueItem(BaseModel):
    id: str
    patient_id: str
    visit_id: str
    stage: str
    status: str
    priority: str
    due_at: str
    risk_level: str


class WorkflowQueueResponse(BaseModel):
    items: list[WorkflowQueueItem]
    page: PageMeta
