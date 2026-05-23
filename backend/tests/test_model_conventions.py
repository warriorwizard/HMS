from datetime import timezone

from sqlalchemy import Column, ForeignKey, Integer, MetaData, String, Table, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.conventions import NAMING_CONVENTION, TimestampMixin, metadata, utc_now


def test_base_metadata_uses_shared_conventions_metadata() -> None:
    assert Base.metadata is metadata
    assert Base.metadata.naming_convention == NAMING_CONVENTION


def test_naming_convention_generates_expected_constraint_names() -> None:
    local_metadata = MetaData(naming_convention=metadata.naming_convention)

    Table("convention_parent", local_metadata, Column("id", Integer, primary_key=True))
    child = Table(
        "convention_child",
        local_metadata,
        Column("id", Integer, primary_key=True),
        Column("parent_id", Integer, ForeignKey("convention_parent.id"), nullable=False),
        Column("code", String(20), unique=True),
    )

    assert child.primary_key.name == "pk_convention_child"
    foreign_keys = [constraint for constraint in child.foreign_key_constraints]
    assert len(foreign_keys) == 1
    assert foreign_keys[0].name == "fk_convention_child_parent_id_convention_parent"
    unique_constraints = [
        constraint
        for constraint in child.constraints
        if isinstance(constraint, UniqueConstraint)
    ]
    assert len(unique_constraints) == 1
    assert unique_constraints[0].name == "uq_convention_child_code"


def test_utc_now_returns_timezone_aware_utc_datetime() -> None:
    now = utc_now()
    assert now.tzinfo is timezone.utc


def test_timestamp_mixin_columns_have_expected_defaults() -> None:
    class ConventionTimestampProbe(Base, TimestampMixin):
        __tablename__ = "convention_timestamp_probe"

        id: Mapped[int] = mapped_column(Integer, primary_key=True)

    created_at = ConventionTimestampProbe.__table__.c.created_at
    updated_at = ConventionTimestampProbe.__table__.c.updated_at

    assert created_at.nullable is False
    assert updated_at.nullable is False

    assert created_at.default is not None
    assert created_at.default.arg.__name__ == "utc_now"
    assert created_at.default.arg.__module__ == "app.db.conventions"
    assert str(created_at.server_default.arg) == "now()"

    assert updated_at.default is not None
    assert updated_at.default.arg.__name__ == "utc_now"
    assert updated_at.default.arg.__module__ == "app.db.conventions"
    assert updated_at.onupdate is not None
    assert updated_at.onupdate.arg.__name__ == "utc_now"
    assert updated_at.onupdate.arg.__module__ == "app.db.conventions"
    assert str(updated_at.server_default.arg) == "now()"
