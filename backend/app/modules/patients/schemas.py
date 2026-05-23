from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class PatientItem(BaseModel):
    id: str
    registration_id: str
    full_name: str
    age: int = Field(ge=0)
    sex: str
    primary_condition: str
    status: str
    created_at: str


class PatientsResponse(BaseModel):
    items: list[PatientItem]
    page: PageMeta


class CreatePatientRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    age: int = Field(ge=0, le=120)
    sex: str = Field(min_length=1, max_length=16)
    primary_condition: str = Field(min_length=2, max_length=240)


class UpdatePatientRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    age: int | None = Field(default=None, ge=0, le=120)
    sex: str | None = Field(default=None, min_length=1, max_length=16)
    primary_condition: str | None = Field(default=None, min_length=2, max_length=240)
    status: str | None = Field(default=None, min_length=2, max_length=32)


class VisitItem(BaseModel):
    id: str
    patient_id: str
    visit_type: str
    status: str
    scheduled_at: str
    created_at: str


class VisitsResponse(BaseModel):
    items: list[VisitItem]
    page: PageMeta


class CreateVisitRequest(BaseModel):
    visit_type: str = Field(min_length=2, max_length=80)
    status: str = Field(min_length=2, max_length=32)
    scheduled_at: str = Field(min_length=10, max_length=40)


class TimelineEventItem(BaseModel):
    id: str
    patient_id: str
    event_type: str
    description: str
    created_at: str


class TimelineResponse(BaseModel):
    items: list[TimelineEventItem]
    page: PageMeta
