from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class SampleItem(BaseModel):
    id: str
    accession_number: str
    patient_id: str
    visit_id: str
    sample_type: str
    status: str
    collected_at: str
    verified_by: str | None = None


class SamplesResponse(BaseModel):
    items: list[SampleItem]
    page: PageMeta


class CreateSampleRequest(BaseModel):
    patient_id: str = Field(min_length=3, max_length=64)
    visit_id: str = Field(min_length=3, max_length=64)
    sample_type: str = Field(min_length=2, max_length=64)


class UpdateSampleStatusRequest(BaseModel):
    status: str = Field(min_length=2, max_length=64)
    verified_by: str | None = Field(default=None, max_length=64)
