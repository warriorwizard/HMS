from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any, TypeVar

DEFAULT_PAGE_LIMIT = 25
DEFAULT_PAGE_OFFSET = 0
MAX_PAGE_LIMIT = 100

T = TypeVar("T")


class PaginationBoundsError(ValueError):
    """Raised when pagination inputs are invalid."""


@dataclass(frozen=True)
class PaginationParams:
    limit: int = DEFAULT_PAGE_LIMIT
    offset: int = DEFAULT_PAGE_OFFSET


def _coerce_int(value: int | str, *, field_name: str) -> int:
    if isinstance(value, bool):
        raise PaginationBoundsError(f"{field_name} must be an integer")

    if isinstance(value, int):
        return value

    if isinstance(value, str):
        normalized = value.strip()
        if not normalized:
            raise PaginationBoundsError(f"{field_name} must be an integer")
        try:
            return int(normalized)
        except ValueError as exc:
            raise PaginationBoundsError(f"{field_name} must be an integer") from exc

    raise PaginationBoundsError(f"{field_name} must be an integer")


def validate_pagination(
    limit: int | str | None = None,
    offset: int | str | None = None,
    *,
    default_limit: int = DEFAULT_PAGE_LIMIT,
    max_limit: int = MAX_PAGE_LIMIT,
) -> PaginationParams:
    default_limit_value = _coerce_int(default_limit, field_name="default_limit")
    max_limit_value = _coerce_int(max_limit, field_name="max_limit")

    if default_limit_value < 1:
        raise PaginationBoundsError("default_limit must be greater than or equal to 1")
    if max_limit_value < 1:
        raise PaginationBoundsError("max_limit must be greater than or equal to 1")
    if default_limit_value > max_limit_value:
        raise PaginationBoundsError("default_limit must be less than or equal to max_limit")

    limit_value = default_limit_value if limit is None else _coerce_int(limit, field_name="limit")
    offset_value = DEFAULT_PAGE_OFFSET if offset is None else _coerce_int(offset, field_name="offset")

    if limit_value < 1:
        raise PaginationBoundsError("limit must be greater than or equal to 1")
    if offset_value < 0:
        raise PaginationBoundsError("offset must be greater than or equal to 0")

    if limit_value > max_limit_value:
        limit_value = max_limit_value

    return PaginationParams(limit=limit_value, offset=offset_value)


def build_paginated_response(
    items: Sequence[T],
    *,
    pagination: PaginationParams,
    total: int | str,
) -> dict[str, Any]:
    total_value = _coerce_int(total, field_name="total")
    if total_value < 0:
        raise PaginationBoundsError("total must be greater than or equal to 0")

    return {
        "items": list(items),
        "page": {
            "limit": pagination.limit,
            "offset": pagination.offset,
            "total": total_value,
        },
    }
