from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class ExplainabilitySource(BaseModel):
    source_type: str
    source_id: str
    excerpt: str


class AiResultItem(BaseModel):
    id: str
    report_id: str
    patient_id: str
    status: str
    risk_score: float = Field(ge=0, le=1)
    summary: str
    findings: list[str]
    explainability: list[ExplainabilitySource]
    created_at: str


class AiResultsResponse(BaseModel):
    items: list[AiResultItem]
    page: PageMeta


class SubmitAiTaskRequest(BaseModel):
    report_id: str = Field(min_length=3, max_length=64)
    patient_id: str = Field(min_length=3, max_length=64)
    task_type: str = Field(min_length=2, max_length=64)


class SubmitAiTaskResponse(BaseModel):
    task_id: str
    status: str


class ReportSummaryResponse(BaseModel):
    report_id: str
    summary: str


class FindingsExtractionResponse(BaseModel):
    report_id: str
    findings: list[str]


class RiskScoreResponse(BaseModel):
    report_id: str
    risk_score: float = Field(ge=0, le=1)
    risk_level: str
    rationale: str
