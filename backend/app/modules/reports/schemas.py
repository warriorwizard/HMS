from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class ReportItem(BaseModel):
    id: str
    patient_id: str
    visit_id: str
    file_name: str
    file_type: str
    status: str
    storage_key: str
    uploaded_by: str
    uploaded_at: str


class ReportsResponse(BaseModel):
    items: list[ReportItem]
    page: PageMeta


class UploadReportRequest(BaseModel):
    patient_id: str = Field(min_length=3, max_length=64)
    visit_id: str = Field(min_length=3, max_length=64)
    file_name: str = Field(min_length=3, max_length=180)
    file_type: str = Field(min_length=2, max_length=40)


class UploadReportResponse(BaseModel):
    report: ReportItem
    upload_url: str


class ProcessingJobItem(BaseModel):
    id: str
    report_id: str
    status: str
    stage: str
    started_at: str
    updated_at: str
    extraction_preview: str


class ProcessingJobsResponse(BaseModel):
    items: list[ProcessingJobItem]
    page: PageMeta


class ExtractTextRequest(BaseModel):
    engine: str = Field(default="placeholder", min_length=2, max_length=48)


class ExtractTextResponse(BaseModel):
    report_id: str
    engine: str
    extracted_text: str
