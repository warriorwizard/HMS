from pydantic import BaseModel, Field


class PageMeta(BaseModel):
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    total: int = Field(ge=0)


class AdminTenantItem(BaseModel):
    id: str
    name: str
    slug: str
    status: str
    site_count: int = Field(ge=0)
    department_count: int = Field(ge=0)


class AdminTenantsResponse(BaseModel):
    items: list[AdminTenantItem]
    page: PageMeta


class AdminMembershipUserSummary(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    status: str


class AdminMembershipTenantSummary(BaseModel):
    id: str
    name: str
    slug: str
    status: str


class AdminMembershipRoleSummary(BaseModel):
    id: str
    key: str
    name: str
    status: str


class AdminMembershipItem(BaseModel):
    id: str
    status: str
    tenant_id: str
    role_id: str
    user: AdminMembershipUserSummary
    tenant: AdminMembershipTenantSummary
    role: AdminMembershipRoleSummary
    permission_count: int = Field(ge=0)


class AdminMembershipsResponse(BaseModel):
    items: list[AdminMembershipItem]
    page: PageMeta
