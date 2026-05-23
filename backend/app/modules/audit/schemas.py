from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class AuditEventItem(BaseModel):
    id: str
    tenant_id: str | None = None
    actor_id: str | None = None
    actor_role: str | None = None
    action: str
    resource_type: str
    resource_id: str | None = None
    ip_hash: str | None = None
    created_at: str


class AuditEventsResponse(BaseModel):
    items: list[AuditEventItem]
    page: PageMeta
