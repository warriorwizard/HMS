from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class TenantSelectionRequest(BaseModel):
    refresh_token: str
    tenant_id: str = Field(min_length=1, max_length=40)


class TenantMembershipResponse(BaseModel):
    tenant_id: str
    role_id: str
    role_key: str
    site_id: str | None = None
    department_id: str | None = None


class SelectedTenantResponse(TenantMembershipResponse):
    permissions: list[str]


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    status: str
    memberships: list[TenantMembershipResponse]
    selected_tenant: SelectedTenantResponse | None = None
    permissions: list[str] = Field(default_factory=list)


class AuthTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TenantSelectionResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    selected_tenant: SelectedTenantResponse


class LogoutResponse(BaseModel):
    status: str
