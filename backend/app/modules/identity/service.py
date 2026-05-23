from datetime import datetime, timedelta, timezone
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.modules.identity.models import (
    Membership,
    Permission,
    Role,
    RolePermission,
    Tenant,
    User,
    UserSession,
)
from app.modules.identity.schemas import (
    SelectedTenantResponse,
    TenantMembershipResponse,
    UserResponse,
)
from app.modules.identity.security import (
    create_signed_token,
    decode_signed_token,
    hash_token,
    verify_password,
)

ACCESS_TOKEN_MINUTES = settings.access_token_minutes
REFRESH_TOKEN_DAYS = settings.refresh_token_days


class AuthenticationError(ValueError):
    pass


class TenantAccessDeniedError(ValueError):
    pass


@dataclass(frozen=True)
class AuthenticatedIdentity:
    user: User
    session: UserSession
    tenant_id: str | None = None
    role_key: str | None = None
    site_id: str | None = None
    department_id: str | None = None
    permissions: tuple[str, ...] = ()

    def has_permission(self, permission_key: str) -> bool:
        return permission_key in self.permissions


def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email.lower(), User.status == "active")
    return session.execute(statement).scalar_one_or_none()


def get_user_by_id(session: Session, user_id: str) -> User | None:
    statement = select(User).where(User.id == user_id, User.status == "active")
    return session.execute(statement).scalar_one_or_none()


def get_active_memberships(session: Session, user_id: str) -> list[Membership]:
    statement = (
        select(Membership)
        .join(Tenant, Tenant.id == Membership.tenant_id)
        .join(Role, Role.id == Membership.role_id)
        .options(joinedload(Membership.role))
        .where(
            Membership.user_id == user_id,
            Membership.status == "active",
            Tenant.status == "active",
            Role.status == "active",
        )
    )
    return list(session.execute(statement).scalars().unique())


def get_active_membership(session: Session, user_id: str, tenant_id: str) -> Membership | None:
    statement = (
        select(Membership)
        .join(Tenant, Tenant.id == Membership.tenant_id)
        .join(Role, Role.id == Membership.role_id)
        .options(joinedload(Membership.role))
        .where(
            Membership.user_id == user_id,
            Membership.tenant_id == tenant_id,
            Membership.status == "active",
            Tenant.status == "active",
            Role.status == "active",
        )
    )
    return session.execute(statement).scalars().unique().one_or_none()


def get_role_permissions(session: Session, role_id: str) -> tuple[str, ...]:
    statement = (
        select(Permission.key)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == role_id)
        .order_by(Permission.key)
    )
    return tuple(session.execute(statement).scalars().all())


def to_tenant_membership_response(membership: Membership) -> TenantMembershipResponse:
    return TenantMembershipResponse(
        tenant_id=membership.tenant_id,
        role_id=membership.role_id,
        role_key=membership.role.key,
        site_id=membership.site_id,
        department_id=membership.department_id,
    )


def to_selected_tenant_response(
    session: Session,
    membership: Membership,
) -> SelectedTenantResponse:
    return SelectedTenantResponse(
        **to_tenant_membership_response(membership).model_dump(),
        permissions=list(get_role_permissions(session, membership.role_id)),
    )


def to_user_response(
    session: Session,
    user: User,
    selected_tenant_id: str | None = None,
) -> UserResponse:
    memberships = [
        to_tenant_membership_response(membership)
        for membership in get_active_memberships(session, user.id)
    ]
    selected_membership = (
        get_active_membership(session, user.id, selected_tenant_id)
        if selected_tenant_id
        else None
    )
    selected_tenant = (
        to_selected_tenant_response(session, selected_membership)
        if selected_membership
        else None
    )
    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        status=user.status,
        memberships=memberships,
        selected_tenant=selected_tenant,
        permissions=selected_tenant.permissions if selected_tenant else [],
    )


def authenticate_user(session: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(session, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def create_access_token(user: User, session_id: str, tenant_id: str | None = None) -> str:
    return create_signed_token(
        {
            "typ": "access",
            "sub": user.id,
            "sid": session_id,
            "tenant_id": tenant_id,
        },
        timedelta(minutes=ACCESS_TOKEN_MINUTES),
    )


def create_refresh_token(user: User, session_id: str) -> str:
    return create_signed_token(
        {
            "typ": "refresh",
            "sub": user.id,
            "sid": session_id,
        },
        timedelta(days=REFRESH_TOKEN_DAYS),
    )


def create_user_session(session: Session, user: User) -> tuple[UserSession, str, str]:
    user_session = UserSession(
        user_id=user.id,
        refresh_token_hash="pending",
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS),
    )
    session.add(user_session)
    session.flush()

    refresh_token = create_refresh_token(user, user_session.id)
    user_session.refresh_token_hash = hash_token(refresh_token)
    access_token = create_access_token(user, user_session.id)
    return user_session, access_token, refresh_token


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _valid_user_session(
    session: Session,
    session_id: str,
    *,
    user_id: str | None = None,
    refresh_token_hash: str | None = None,
) -> UserSession:
    statement = select(UserSession).where(
        UserSession.id == session_id,
        UserSession.revoked_at.is_(None),
    )
    if user_id:
        statement = statement.where(UserSession.user_id == user_id)
    if refresh_token_hash:
        statement = statement.where(UserSession.refresh_token_hash == refresh_token_hash)

    user_session = session.execute(statement).scalar_one_or_none()
    if not user_session:
        raise AuthenticationError("Session not found")

    if _as_utc(user_session.expires_at) < datetime.now(timezone.utc):
        raise AuthenticationError("Session expired")

    return user_session


def refresh_access_token(session: Session, refresh_token: str) -> tuple[User, str]:
    try:
        claims = decode_signed_token(refresh_token, expected_type="refresh")
    except ValueError as exc:
        raise AuthenticationError("Invalid refresh token") from exc

    session_id = claims["sid"]
    user_session = _valid_user_session(
        session,
        session_id,
        refresh_token_hash=hash_token(refresh_token),
    )

    user = get_user_by_id(session, user_session.user_id)
    if not user:
        raise AuthenticationError("User not found")

    return user, create_access_token(user, user_session.id, user_session.tenant_id)


def select_tenant_for_session(
    session: Session,
    refresh_token: str,
    tenant_id: str,
) -> tuple[User, str, Membership]:
    try:
        claims = decode_signed_token(refresh_token, expected_type="refresh")
    except ValueError as exc:
        raise AuthenticationError("Invalid refresh token") from exc

    user_session = _valid_user_session(
        session,
        claims["sid"],
        refresh_token_hash=hash_token(refresh_token),
    )
    user = get_user_by_id(session, user_session.user_id)
    if not user:
        raise AuthenticationError("User not found")

    membership = get_active_membership(session, user.id, tenant_id)
    if not membership:
        raise TenantAccessDeniedError("Active tenant membership not found")

    user_session.tenant_id = tenant_id
    access_token = create_access_token(user, user_session.id, tenant_id)
    return user, access_token, membership


def revoke_refresh_token(session: Session, refresh_token: str) -> None:
    try:
        claims = decode_signed_token(refresh_token, expected_type="refresh")
    except ValueError as exc:
        raise AuthenticationError("Invalid refresh token") from exc

    statement = select(UserSession).where(
        UserSession.id == claims["sid"],
        UserSession.refresh_token_hash == hash_token(refresh_token),
        UserSession.revoked_at.is_(None),
    )
    user_session = session.execute(statement).scalar_one_or_none()
    if user_session:
        user_session.revoked_at = datetime.now(timezone.utc)


def identity_from_access_token(session: Session, access_token: str) -> AuthenticatedIdentity:
    try:
        claims = decode_signed_token(access_token, expected_type="access")
    except ValueError as exc:
        raise AuthenticationError("Invalid access token") from exc

    user_session = _valid_user_session(
        session,
        claims["sid"],
        user_id=claims["sub"],
    )
    user = get_user_by_id(session, claims["sub"])
    if not user:
        raise AuthenticationError("User not found")

    token_tenant_id = claims.get("tenant_id")
    if token_tenant_id != user_session.tenant_id:
        raise AuthenticationError("Access token tenant context is stale")

    if not token_tenant_id:
        return AuthenticatedIdentity(user=user, session=user_session)

    membership = get_active_membership(session, user.id, token_tenant_id)
    if not membership:
        raise TenantAccessDeniedError("Active tenant membership not found")

    permissions = get_role_permissions(session, membership.role_id)
    return AuthenticatedIdentity(
        user=user,
        session=user_session,
        tenant_id=membership.tenant_id,
        role_key=membership.role.key,
        site_id=membership.site_id,
        department_id=membership.department_id,
        permissions=permissions,
    )


def user_from_access_token(session: Session, access_token: str) -> User:
    return identity_from_access_token(session, access_token).user
