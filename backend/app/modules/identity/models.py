from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    JSON,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.conventions import TimestampMixin as ConventionTimestampMixin
from app.db.ids import new_id


class TimestampMixin(ConventionTimestampMixin):
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("ten"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="active")
    settings_json: Mapped[dict[str, Any] | None] = mapped_column("settings", JSON, nullable=True)

    sites: Mapped[list["TenantSite"]] = relationship(back_populates="tenant")
    departments: Mapped[list["Department"]] = relationship(back_populates="tenant")
    memberships: Mapped[list["Membership"]] = relationship(back_populates="tenant")


class TenantSite(Base, TimestampMixin):
    __tablename__ = "tenant_sites"
    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_tenant_sites_tenant_code"),
        Index("ix_tenant_sites_tenant_status", "tenant_id", "status"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("site"))
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(80), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    timezone: Mapped[str] = mapped_column(String(80), nullable=False, default="Asia/Kolkata")
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="active")

    tenant: Mapped[Tenant] = relationship(back_populates="sites")
    departments: Mapped[list["Department"]] = relationship(back_populates="site")


class Department(Base, TimestampMixin):
    __tablename__ = "departments"
    __table_args__ = (
        UniqueConstraint("tenant_id", "site_id", "code", name="uq_departments_tenant_site_code"),
        Index("ix_departments_tenant_status", "tenant_id", "status"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("dept"))
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    site_id: Mapped[str | None] = mapped_column(ForeignKey("tenant_sites.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="active")

    tenant: Mapped[Tenant] = relationship(back_populates="departments")
    site: Mapped[TenantSite | None] = relationship(back_populates="departments")


class User(Base, TimestampMixin):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_email_status", "email", "status"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("usr"))
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    first_name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="active")
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    memberships: Mapped[list["Membership"]] = relationship(back_populates="user")


class Role(Base, TimestampMixin):
    __tablename__ = "roles"
    __table_args__ = (
        UniqueConstraint("tenant_id", "key", name="uq_roles_tenant_key"),
        Index("ix_roles_tenant_status", "tenant_id", "status"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("role"))
    tenant_id: Mapped[str | None] = mapped_column(ForeignKey("tenants.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    key: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="active")

    permissions: Mapped[list["RolePermission"]] = relationship(back_populates="role")
    memberships: Mapped[list["Membership"]] = relationship(back_populates="role")


class Permission(Base, TimestampMixin):
    __tablename__ = "permissions"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("perm"))
    key: Mapped[str] = mapped_column(String(160), nullable=False, unique=True)
    resource: Mapped[str] = mapped_column(String(80), nullable=False)
    action: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    roles: Mapped[list["RolePermission"]] = relationship(back_populates="permission")


class RolePermission(Base):
    __tablename__ = "role_permissions"
    __table_args__ = (
        Index("ix_role_permissions_permission", "permission_id"),
    )

    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id"), primary_key=True)
    permission_id: Mapped[str] = mapped_column(ForeignKey("permissions.id"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    role: Mapped[Role] = relationship(back_populates="permissions")
    permission: Mapped[Permission] = relationship(back_populates="roles")


class Membership(Base, TimestampMixin):
    __tablename__ = "memberships"
    __table_args__ = (
        UniqueConstraint("tenant_id", "user_id", name="uq_memberships_tenant_user"),
        Index("ix_memberships_tenant_status", "tenant_id", "status"),
        Index("ix_memberships_user_status", "user_id", "status"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("mem"))
    tenant_id: Mapped[str] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id"), nullable=False)
    site_id: Mapped[str | None] = mapped_column(ForeignKey("tenant_sites.id"), nullable=True)
    department_id: Mapped[str | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="active")

    tenant: Mapped[Tenant] = relationship(back_populates="memberships")
    user: Mapped[User] = relationship(back_populates="memberships")
    role: Mapped[Role] = relationship(back_populates="memberships")


class UserSession(Base, TimestampMixin):
    __tablename__ = "user_sessions"
    __table_args__ = (
        Index("ix_user_sessions_user_tenant", "user_id", "tenant_id"),
        Index("ix_user_sessions_expires", "expires_at"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("sess"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    tenant_id: Mapped[str | None] = mapped_column(ForeignKey("tenants.id"), nullable=True)
    refresh_token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    user_agent_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_tenant_created", "tenant_id", "created_at"),
        Index("ix_audit_logs_resource", "tenant_id", "resource_type", "resource_id"),
        Index("ix_audit_logs_actor", "tenant_id", "actor_id"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("audit"))
    tenant_id: Mapped[str | None] = mapped_column(ForeignKey("tenants.id"), nullable=True)
    actor_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    actor_role: Mapped[str | None] = mapped_column(String(120), nullable=True)
    action: Mapped[str] = mapped_column(String(160), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(120), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    before_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    after_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSON, nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
