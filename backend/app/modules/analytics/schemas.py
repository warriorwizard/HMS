from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class AnalyticsEventItem(BaseModel):
    id: str
    event_type: str
    status: str
    department: str
    source: str
    created_at: str


class AnalyticsEventsResponse(BaseModel):
    items: list[AnalyticsEventItem]
    page: PageMeta


class AnalyticsTatMetricItem(BaseModel):
    id: str
    department: str
    status: str
    avg_turnaround_minutes: int = Field(ge=0)
    p90_turnaround_minutes: int = Field(ge=0)
    case_count: int = Field(ge=0)


class AnalyticsTatMetricsResponse(BaseModel):
    items: list[AnalyticsTatMetricItem]
    page: PageMeta


class AnalyticsWorkflowBottleneckItem(BaseModel):
    id: str
    stage: str
    department: str
    status: str
    pending_cases: int = Field(ge=0)
    sla_breach_percent: float = Field(ge=0)


class AnalyticsWorkflowBottlenecksResponse(BaseModel):
    items: list[AnalyticsWorkflowBottleneckItem]
    page: PageMeta


class AnalyticsRevenueSummaryItem(BaseModel):
    id: str
    period: str
    department: str
    status: str
    revenue_collected: float = Field(ge=0)
    revenue_outstanding: float = Field(ge=0)
    currency: str


class AnalyticsRevenueSummaryResponse(BaseModel):
    items: list[AnalyticsRevenueSummaryItem]
    page: PageMeta


class AnalyticsAiUsageItem(BaseModel):
    id: str
    period: str
    status: str
    total_reports: int = Field(ge=0)
    ai_assisted_reports: int = Field(ge=0)
    doctor_only_reports: int = Field(ge=0)
    doctor_override_count: int = Field(ge=0)
    ai_assist_rate: float = Field(ge=0)


class AnalyticsAiUsageResponse(BaseModel):
    items: list[AnalyticsAiUsageItem]
    page: PageMeta
