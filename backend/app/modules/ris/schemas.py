from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class ImagingOrderItem(BaseModel):
    id: str
    patient_id: str
    visit_id: str
    modality: str
    body_part: str
    clinical_indication: str
    status: str
    radiologist_id: str | None = None
    created_at: str


class ImagingOrdersResponse(BaseModel):
    items: list[ImagingOrderItem]
    page: PageMeta


class CreateImagingOrderRequest(BaseModel):
    patient_id: str = Field(min_length=3, max_length=64)
    visit_id: str = Field(min_length=3, max_length=64)
    modality: str = Field(min_length=2, max_length=32)
    body_part: str = Field(min_length=2, max_length=64)
    clinical_indication: str = Field(min_length=3, max_length=240)


class AssignRadiologistRequest(BaseModel):
    radiologist_id: str = Field(min_length=3, max_length=64)


class UpdateImagingOrderStatusRequest(BaseModel):
    status: str = Field(min_length=2, max_length=64)
