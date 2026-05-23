from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import ColumnElement

from app.api.pagination import PaginationParams
from app.modules.identity.admin_schemas import (
    AdminMembershipItem,
    AdminMembershipRoleSummary,
    AdminMembershipTenantSummary,
    AdminMembershipUserSummary,
    AdminTenantItem,
)
from app.modules.identity.models import (
    Department,
    Membership,
    Role,
    RolePermission,
    Tenant,
    TenantSite,
    User,
)


def _normalize_tokens(values: Sequence[str]) -> tuple[str, ...]:
    normalized: list[str] = []
    seen: set[str] = set()
    for value in values:
        token = value.strip().lower()
        if not token or token in seen:
            continue
        seen.add(token)
        normalized.append(token)
    return tuple(normalized)


def _search_pattern(search: str) -> str:
    return f"%{search.lower()}%"


def _tenant_filters(search: str | None, statuses: Sequence[str]) -> list[ColumnElement[bool]]:
    filters: list[ColumnElement[bool]] = []
    normalized_statuses = _normalize_tokens(statuses)
    if normalized_statuses:
        filters.append(func.lower(Tenant.status).in_(normalized_statuses))

    if search:
        pattern = _search_pattern(search)
        filters.append(
            or_(
                func.lower(Tenant.id).like(pattern),
                func.lower(Tenant.name).like(pattern),
                func.lower(Tenant.slug).like(pattern),
            )
        )

    return filters


def list_admin_tenants(
    session: Session,
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[AdminTenantItem], int]:
    filters = _tenant_filters(search, statuses)

    site_counts_subquery = (
        select(
            TenantSite.tenant_id.label("tenant_id"),
            func.count(TenantSite.id).label("site_count"),
        )
        .group_by(TenantSite.tenant_id)
        .subquery()
    )
    department_counts_subquery = (
        select(
            Department.tenant_id.label("tenant_id"),
            func.count(Department.id).label("department_count"),
        )
        .group_by(Department.tenant_id)
        .subquery()
    )

    total_statement = select(func.count()).select_from(Tenant).where(*filters)
    total = int(session.execute(total_statement).scalar_one())

    statement = (
        select(
            Tenant.id,
            Tenant.name,
            Tenant.slug,
            Tenant.status,
            func.coalesce(site_counts_subquery.c.site_count, 0).label("site_count"),
            func.coalesce(department_counts_subquery.c.department_count, 0).label(
                "department_count"
            ),
        )
        .outerjoin(site_counts_subquery, site_counts_subquery.c.tenant_id == Tenant.id)
        .outerjoin(
            department_counts_subquery,
            department_counts_subquery.c.tenant_id == Tenant.id,
        )
        .where(*filters)
        .order_by(Tenant.name.asc(), Tenant.id.asc())
        .limit(pagination.limit)
        .offset(pagination.offset)
    )

    rows = session.execute(statement).all()
    items = [
        AdminTenantItem(
            id=row.id,
            name=row.name,
            slug=row.slug,
            status=row.status,
            site_count=int(row.site_count),
            department_count=int(row.department_count),
        )
        for row in rows
    ]
    return items, total


def _membership_filters(
    *,
    search: str | None,
    statuses: Sequence[str],
    tenant_id: str | None,
    role_key: str | None,
) -> list[ColumnElement[bool]]:
    filters: list[ColumnElement[bool]] = []

    normalized_statuses = _normalize_tokens(statuses)
    if normalized_statuses:
        filters.append(func.lower(Membership.status).in_(normalized_statuses))

    if tenant_id:
        filters.append(Membership.tenant_id == tenant_id.strip())

    if role_key:
        filters.append(func.lower(Role.key) == role_key.strip().lower())

    if search:
        pattern = _search_pattern(search)
        filters.append(
            or_(
                func.lower(Membership.id).like(pattern),
                func.lower(User.email).like(pattern),
                func.lower(User.first_name).like(pattern),
                func.lower(User.last_name).like(pattern),
                func.lower(Tenant.name).like(pattern),
                func.lower(Tenant.slug).like(pattern),
                func.lower(Role.name).like(pattern),
                func.lower(Role.key).like(pattern),
            )
        )

    return filters


def _membership_base_statement() -> Select[tuple[Membership, User, Tenant, Role]]:
    return (
        select(Membership, User, Tenant, Role)
        .join(User, User.id == Membership.user_id)
        .join(Tenant, Tenant.id == Membership.tenant_id)
        .join(Role, Role.id == Membership.role_id)
    )


def list_admin_memberships(
    session: Session,
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
    tenant_id: str | None = None,
    role_key: str | None = None,
) -> tuple[list[AdminMembershipItem], int]:
    filters = _membership_filters(
        search=search,
        statuses=statuses,
        tenant_id=tenant_id,
        role_key=role_key,
    )

    role_permission_counts_subquery = (
        select(
            RolePermission.role_id.label("role_id"),
            func.count(RolePermission.permission_id).label("permission_count"),
        )
        .group_by(RolePermission.role_id)
        .subquery()
    )

    total_statement = (
        select(func.count())
        .select_from(Membership)
        .join(User, User.id == Membership.user_id)
        .join(Tenant, Tenant.id == Membership.tenant_id)
        .join(Role, Role.id == Membership.role_id)
        .where(*filters)
    )
    total = int(session.execute(total_statement).scalar_one())

    statement = (
        _membership_base_statement()
        .add_columns(
            func.coalesce(
                role_permission_counts_subquery.c.permission_count,
                0,
            ).label("permission_count"),
        )
        .outerjoin(
            role_permission_counts_subquery,
            role_permission_counts_subquery.c.role_id == Role.id,
        )
        .where(*filters)
        .order_by(Tenant.name.asc(), User.email.asc(), Membership.id.asc())
        .limit(pagination.limit)
        .offset(pagination.offset)
    )

    rows = session.execute(statement).all()
    items = [
        AdminMembershipItem(
            id=membership.id,
            status=membership.status,
            tenant_id=membership.tenant_id,
            role_id=membership.role_id,
            user=AdminMembershipUserSummary(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                status=user.status,
            ),
            tenant=AdminMembershipTenantSummary(
                id=tenant.id,
                name=tenant.name,
                slug=tenant.slug,
                status=tenant.status,
            ),
            role=AdminMembershipRoleSummary(
                id=role.id,
                key=role.key,
                name=role.name,
                status=role.status,
            ),
            permission_count=int(permission_count),
        )
        for membership, user, tenant, role, permission_count in rows
    ]
    return items, total
