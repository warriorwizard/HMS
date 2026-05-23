from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class CRMLeadItem(BaseModel):
    id: str
    full_name: str
    company: str
    email: str
    status: str
    source: str


class CRMLeadsResponse(BaseModel):
    items: list[CRMLeadItem]
    page: PageMeta


class CRMReminderItem(BaseModel):
    id: str
    lead_id: str
    title: str
    due_date: str
    priority: str
    status: str


class CRMRemindersResponse(BaseModel):
    items: list[CRMReminderItem]
    page: PageMeta


class CRMCampaignItem(BaseModel):
    id: str
    name: str
    channel: str
    status: str
    audience: str


class CRMCampaignsResponse(BaseModel):
    items: list[CRMCampaignItem]
    page: PageMeta
