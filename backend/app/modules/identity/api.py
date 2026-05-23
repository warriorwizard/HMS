from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.audit.service import write_audit_log
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.schemas import (
    AuthTokenResponse,
    LoginRequest,
    LogoutRequest,
    LogoutResponse,
    RefreshRequest,
    RefreshResponse,
    TenantSelectionRequest,
    TenantSelectionResponse,
    UserResponse,
)
from app.modules.identity.service import (
    ACCESS_TOKEN_MINUTES,
    AuthenticatedIdentity,
    AuthenticationError,
    TenantAccessDeniedError,
    authenticate_user,
    create_user_session,
    refresh_access_token,
    revoke_refresh_token,
    select_tenant_for_session,
    to_selected_tenant_response,
    to_user_response,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=AuthTokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db_session)) -> AuthTokenResponse:
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_session, access_token, refresh_token = create_user_session(db, user)
    write_audit_log(
        db,
        action="auth.login",
        resource_type="auth",
        actor_id=user.id,
        resource_id=user_session.id,
    )
    db.commit()

    return AuthTokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_MINUTES * 60,
        user=to_user_response(db, user),
    )


@router.post("/refresh", response_model=RefreshResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db_session)) -> RefreshResponse:
    try:
        _, access_token = refresh_access_token(db, payload.refresh_token)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from exc

    return RefreshResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_MINUTES * 60,
    )


@router.post("/select-tenant", response_model=TenantSelectionResponse)
def select_tenant(
    payload: TenantSelectionRequest,
    db: Session = Depends(get_db_session),
) -> TenantSelectionResponse:
    try:
        _, access_token, membership = select_tenant_for_session(
            db,
            payload.refresh_token,
            payload.tenant_id,
        )
    except TenantAccessDeniedError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active tenant membership not found",
        ) from exc
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from exc

    write_audit_log(
        db,
        action="auth.tenant_selected",
        resource_type="tenant",
        tenant_id=membership.tenant_id,
        actor_id=membership.user_id,
        actor_role=membership.role.key,
        resource_id=membership.tenant_id,
    )
    db.commit()
    return TenantSelectionResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_MINUTES * 60,
        selected_tenant=to_selected_tenant_response(db, membership),
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(payload: LogoutRequest, db: Session = Depends(get_db_session)) -> LogoutResponse:
    try:
        revoke_refresh_token(db, payload.refresh_token)
    except AuthenticationError:
        pass
    db.commit()
    return LogoutResponse(status="ok")


@router.get("/me", response_model=UserResponse)
def me(
    identity: AuthenticatedIdentity = Depends(get_current_identity),
    db: Session = Depends(get_db_session),
) -> UserResponse:
    return to_user_response(db, identity.user, selected_tenant_id=identity.tenant_id)
