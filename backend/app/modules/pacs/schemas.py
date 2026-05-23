from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class DicomImageItem(BaseModel):
    id: str
    instance_number: int = Field(ge=1)
    sop_instance_uid: str


class DicomSeriesItem(BaseModel):
    id: str
    series_uid: str
    modality: str
    images: list[DicomImageItem]


class DicomStudyItem(BaseModel):
    id: str
    patient_id: str
    order_id: str
    study_uid: str
    status: str
    series: list[DicomSeriesItem]


class DicomStudiesResponse(BaseModel):
    items: list[DicomStudyItem]
    page: PageMeta


class DicomUploadRequest(BaseModel):
    patient_id: str = Field(min_length=3, max_length=64)
    order_id: str = Field(min_length=3, max_length=64)
    study_uid: str = Field(min_length=6, max_length=120)
    file_name: str = Field(min_length=4, max_length=180)


class DicomUploadResponse(BaseModel):
    file_id: str
    study_id: str
    upload_url: str


class SignedDicomAccessResponse(BaseModel):
    file_id: str
    access_url: str
    expires_at: str
