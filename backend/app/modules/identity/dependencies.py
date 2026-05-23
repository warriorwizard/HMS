from collections.abc import Callable

from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.request_context import get_request_context
from app.db.session import get_db_session
from app.modules.identity.service import (
    AuthenticatedIdentity,
    AuthenticationError,
    TenantAccessDeniedError,
    identity_from_access_token,
)


def bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    return authorization.split(" ", 1)[1]


def get_current_identity(
    request: Request,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db_session),
) -> AuthenticatedIdentity:
    token = bearer_token(authorization)
    try:
        identity = identity_from_access_token(db, token)
    except TenantAccessDeniedError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant access is no longer available",
        ) from exc
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        ) from exc

    context = get_request_context(request)
    request.state.request_context = context.with_identity(
        actor_id=identity.user.id,
        tenant_id=identity.tenant_id,
        site_id=identity.site_id,
        actor_role=identity.role_key,
        permissions=identity.permissions,
    )
    return identity


def require_permission(
    permission_key: str,
) -> Callable[[AuthenticatedIdentity], AuthenticatedIdentity]:
    def dependency(
        identity: AuthenticatedIdentity = Depends(get_current_identity),
    ) -> AuthenticatedIdentity:
        if not identity.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tenant selection is required",
            )
        if not identity.has_permission(permission_key):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied",
            )
        return identity

    return dependency
