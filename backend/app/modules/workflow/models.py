from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.conventions import TimestampMixin
from app.db.ids import new_id

_VALID_TASK_STATUSES = ("pending", "in_progress", "on_hold", "completed", "cancelled")
_VALID_PRIORITIES = ("low", "medium", "high", "critical")
_VALID_CHANNELS = ("in_app", "email", "sms")
_VALID_NOTIFICATION_STATUSES = ("pending", "sent", "failed")


class WorkflowTask(Base, TimestampMixin):
    """A discrete unit of work that moves through a status lifecycle."""

    __tablename__ = "workflow_tasks"
    __table_args__ = (
        Index("ix_workflow_tasks_tenant_status", "tenant_id", "status"),
        Index("ix_workflow_tasks_assigned_to", "assigned_to"),
        Index("ix_workflow_tasks_resource", "resource_type", "resource_id"),
        Index("ix_workflow_tasks_due_at", "due_at"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("wtask"))
    tenant_id: Mapped[str | None] = mapped_column(ForeignKey("tenants.id"), nullable=True)
    site_id: Mapped[str | None] = mapped_column(ForeignKey("tenant_sites.id"), nullable=True)
    department_id: Mapped[str | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    assigned_to: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    # status: pending | in_progress | on_hold | completed | cancelled
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="pending")
    # priority: low | medium | high | critical
    priority: Mapped[str] = mapped_column(String(40), nullable=False, default="medium")
    resource_type: Mapped[str] = mapped_column(String(80), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class WorkflowTransition(Base):
    """Immutable record of each status change on a WorkflowTask."""

    __tablename__ = "workflow_transitions"
    __table_args__ = (
        Index("ix_workflow_transitions_task", "task_id", "transitioned_at"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("wtr"))
    task_id: Mapped[str] = mapped_column(ForeignKey("workflow_tasks.id"), nullable=False)
    # from_status is NULL on initial task creation
    from_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    to_status: Mapped[str] = mapped_column(String(40), nullable=False)
    transitioned_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    transitioned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)


class WorkflowNotification(Base, TimestampMixin):
    """Notification record tied to a workflow task event."""

    __tablename__ = "workflow_notifications"
    __table_args__ = (
        Index("ix_workflow_notifications_task", "task_id"),
        Index("ix_workflow_notifications_recipient_status", "recipient_id", "status"),
    )

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("wntf"))
    task_id: Mapped[str] = mapped_column(ForeignKey("workflow_tasks.id"), nullable=False)
    recipient_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    # channel: in_app | email | sms
    channel: Mapped[str] = mapped_column(String(40), nullable=False, default="in_app")
    # status: pending | sent | failed
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="pending")
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
