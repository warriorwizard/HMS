from sqlalchemy.orm import DeclarativeBase

from app.db.conventions import metadata as conventions_metadata


class Base(DeclarativeBase):
    metadata = conventions_metadata
