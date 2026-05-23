"""seed system roles and permissions

Revision ID: 0002_seed_roles_permissions
Revises: 0001_identity_foundation
Create Date: 2026-05-23
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0002_seed_roles_permissions"
down_revision: str | None = "0001_identity_foundation"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_SYSTEM_ROLES = [
    ("role_sys_admin", "System Administrator", "admin", True),
    ("role_sys_doctor", "Doctor", "doctor", True),
    ("role_sys_technician", "Technician", "technician", True),
    ("role_sys_staff", "Staff", "staff", True),
    ("role_sys_billing", "Billing Coordinator", "billing", True),
]

_PERMISSIONS = [
    ("perm_patients_read",   "patients:read",   "patients",   "read"),
    ("perm_patients_write",  "patients:write",  "patients",   "write"),
    ("perm_reports_read",    "reports:read",    "reports",    "read"),
    ("perm_reports_write",   "reports:write",   "reports",    "write"),
    ("perm_billing_read",    "billing:read",    "billing",    "read"),
    ("perm_billing_write",   "billing:write",   "billing",    "write"),
    ("perm_admin_read",      "admin:read",      "admin",      "read"),
    ("perm_admin_write",     "admin:write",     "admin",      "write"),
    ("perm_audit_read",      "audit:read",      "audit",      "read"),
    ("perm_workflow_read",   "workflow:read",   "workflow",   "read"),
    ("perm_workflow_write",  "workflow:write",  "workflow",   "write"),
    ("perm_analytics_read",  "analytics:read",  "analytics",  "read"),
]

# role_id -> list of permission_ids
_ROLE_PERMISSIONS: dict[str, list[str]] = {
    "role_sys_admin": [
        "perm_patients_read", "perm_patients_write",
        "perm_reports_read", "perm_reports_write",
        "perm_billing_read", "perm_billing_write",
        "perm_admin_read", "perm_admin_write",
        "perm_audit_read",
        "perm_workflow_read", "perm_workflow_write",
        "perm_analytics_read",
    ],
    "role_sys_doctor": [
        "perm_patients_read",
        "perm_reports_read", "perm_reports_write",
        "perm_workflow_read", "perm_workflow_write",
        "perm_analytics_read",
    ],
    "role_sys_technician": [
        "perm_patients_read",
        "perm_reports_read", "perm_reports_write",
        "perm_workflow_read", "perm_workflow_write",
    ],
    "role_sys_staff": [
        "perm_patients_read",
        "perm_reports_read",
        "perm_workflow_read",
    ],
    "role_sys_billing": [
        "perm_billing_read", "perm_billing_write",
        "perm_patients_read",
        "perm_analytics_read",
    ],
}


def upgrade() -> None:
    roles_table = sa.table(
        "roles",
        sa.column("id", sa.String),
        sa.column("tenant_id", sa.String),
        sa.column("name", sa.String),
        sa.column("key", sa.String),
        sa.column("description", sa.String),
        sa.column("is_system", sa.Boolean),
        sa.column("status", sa.String),
    )
    op.bulk_insert(
        roles_table,
        [
            {"id": rid, "tenant_id": None, "name": name, "key": key,
             "description": None, "is_system": is_sys, "status": "active"}
            for rid, name, key, is_sys in _SYSTEM_ROLES
        ],
    )

    permissions_table = sa.table(
        "permissions",
        sa.column("id", sa.String),
        sa.column("key", sa.String),
        sa.column("resource", sa.String),
        sa.column("action", sa.String),
        sa.column("description", sa.String),
    )
    op.bulk_insert(
        permissions_table,
        [
            {"id": pid, "key": key, "resource": resource, "action": action, "description": None}
            for pid, key, resource, action in _PERMISSIONS
        ],
    )

    role_permissions_table = sa.table(
        "role_permissions",
        sa.column("role_id", sa.String),
        sa.column("permission_id", sa.String),
    )
    rows = [
        {"role_id": role_id, "permission_id": perm_id}
        for role_id, perm_ids in _ROLE_PERMISSIONS.items()
        for perm_id in perm_ids
    ]
    op.bulk_insert(role_permissions_table, rows)


def downgrade() -> None:
    bind = op.get_bind()
    for role_id, _name, _key, _is_sys in _SYSTEM_ROLES:
        bind.execute(sa.text("DELETE FROM role_permissions WHERE role_id = :rid"), {"rid": role_id})
    for perm_id, _key, _resource, _action in _PERMISSIONS:
        bind.execute(sa.text("DELETE FROM permissions WHERE id = :pid"), {"pid": perm_id})
    for role_id, _name, _key, _is_sys in _SYSTEM_ROLES:
        bind.execute(sa.text("DELETE FROM roles WHERE id = :rid"), {"rid": role_id})
