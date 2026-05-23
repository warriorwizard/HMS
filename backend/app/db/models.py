"""Import SQLAlchemy models here so Alembic can discover metadata."""

from app.modules.identity import models as identity_models  # noqa: F401
from app.modules.workflow import models as workflow_models  # noqa: F401

