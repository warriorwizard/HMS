"""workflow task, transition, and notification tables

Revision ID: 0003_workflow_tables
Revises: 0002_seed_roles_permissions
Create Date: 2026-05-23

State-transition constraints (enforced at the service layer):
  pending       -> in_progress | cancelled
  in_progress   -> on_hold | completed | cancelled
  on_hold       -> in_progress | cancelled
  completed     -> (terminal)
  cancelled     -> (terminal)
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0003_workflow_tables"
down_revision: str | None = "0002_seed_roles_permissions"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "workflow_tasks",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("tenant_id", sa.String(length=40), nullable=True),
        sa.Column("site_id", sa.String(length=40), nullable=True),
        sa.Column("department_id", sa.String(length=40), nullable=True),
        sa.Column("assigned_to", sa.String(length=40), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="pending"),
        sa.Column("priority", sa.String(length=40), nullable=False, server_default="medium"),
        sa.Column("resource_type", sa.String(length=80), nullable=False),
        sa.Column("resource_id", sa.String(length=80), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"]),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"]),
        sa.ForeignKeyConstraint(["site_id"], ["tenant_sites.id"]),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_workflow_tasks_assigned_to", "workflow_tasks", ["assigned_to"])
    op.create_index("ix_workflow_tasks_due_at", "workflow_tasks", ["due_at"])
    op.create_index("ix_workflow_tasks_resource", "workflow_tasks", ["resource_type", "resource_id"])
    op.create_index("ix_workflow_tasks_tenant_status", "workflow_tasks", ["tenant_id", "status"])

    op.create_table(
        "workflow_transitions",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("task_id", sa.String(length=40), nullable=False),
        sa.Column("from_status", sa.String(length=40), nullable=True),
        sa.Column("to_status", sa.String(length=40), nullable=False),
        sa.Column("transitioned_by", sa.String(length=40), nullable=True),
        sa.Column("transitioned_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["task_id"], ["workflow_tasks.id"]),
        sa.ForeignKeyConstraint(["transitioned_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_workflow_transitions_task", "workflow_transitions", ["task_id", "transitioned_at"]
    )

    op.create_table(
        "workflow_notifications",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("task_id", sa.String(length=40), nullable=False),
        sa.Column("recipient_id", sa.String(length=40), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("channel", sa.String(length=40), nullable=False, server_default="in_app"),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="pending"),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["task_id"], ["workflow_tasks.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_workflow_notifications_task", "workflow_notifications", ["task_id"])
    op.create_index(
        "ix_workflow_notifications_recipient_status",
        "workflow_notifications",
        ["recipient_id", "status"],
    )


def downgrade() -> None:
    op.drop_index("ix_workflow_notifications_recipient_status", table_name="workflow_notifications")
    op.drop_index("ix_workflow_notifications_task", table_name="workflow_notifications")
    op.drop_table("workflow_notifications")

    op.drop_index("ix_workflow_transitions_task", table_name="workflow_transitions")
    op.drop_table("workflow_transitions")

    op.drop_index("ix_workflow_tasks_tenant_status", table_name="workflow_tasks")
    op.drop_index("ix_workflow_tasks_resource", table_name="workflow_tasks")
    op.drop_index("ix_workflow_tasks_due_at", table_name="workflow_tasks")
    op.drop_index("ix_workflow_tasks_assigned_to", table_name="workflow_tasks")
    op.drop_table("workflow_tasks")
