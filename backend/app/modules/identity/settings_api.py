from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.audit.service import write_audit_log
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.models import Tenant
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/settings", tags=["settings"])

_DEFAULT_SETTINGS: dict[str, Any] = {
    "timezone": "Asia/Kolkata",
    "clinical_review_mode": True,
    "ai_governance": {
        "human_approval_required": True,
        "source_linked_outputs_only": True,
        "audit_logging_active": True,
    },
}


class TenantSettingsResponse(BaseModel):
    tenant_id: str
    name: str
    slug: str
    settings: dict[str, Any]


class TenantSettingsPatchRequest(BaseModel):
    settings: dict[str, Any]


@router.get("/tenant", response_model=TenantSettingsResponse)
def get_tenant_settings(
    identity: AuthenticatedIdentity = Depends(get_current_identity),
    db: Session = Depends(get_db_session),
) -> TenantSettingsResponse:
    if not identity.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant selection is required",
        )
    tenant = db.execute(
        select(Tenant).where(Tenant.id == identity.tenant_id)
    ).scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    return TenantSettingsResponse(
        tenant_id=tenant.id,
        name=tenant.name,
        slug=tenant.slug,
        settings=tenant.settings_json or _DEFAULT_SETTINGS,
    )


@router.patch("/tenant", response_model=TenantSettingsResponse)
def patch_tenant_settings(
    payload: TenantSettingsPatchRequest = Body(...),
    identity: AuthenticatedIdentity = Depends(get_current_identity),
    db: Session = Depends(get_db_session),
) -> TenantSettingsResponse:
    if not identity.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant selection is required",
        )
    if not identity.has_permission("admin:write"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied",
        )
    tenant = db.execute(
        select(Tenant).where(Tenant.id == identity.tenant_id)
    ).scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    tenant.settings_json = payload.settings
    write_audit_log(
        db,
        action="settings.tenant_updated",
        resource_type="tenant",
        tenant_id=identity.tenant_id,
        actor_id=identity.user.id,
        actor_role=identity.role_key,
        resource_id=identity.tenant_id,
    )
    db.commit()
    db.refresh(tenant)
    return TenantSettingsResponse(
        tenant_id=tenant.id,
        name=tenant.name,
        slug=tenant.slug,
        settings=tenant.settings_json or _DEFAULT_SETTINGS,
    )
