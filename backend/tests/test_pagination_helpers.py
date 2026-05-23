import pytest

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import (
    DEFAULT_PAGE_LIMIT,
    DEFAULT_PAGE_OFFSET,
    MAX_PAGE_LIMIT,
    PaginationBoundsError,
    build_paginated_response,
    validate_pagination,
)


def test_validate_pagination_uses_safe_defaults() -> None:
    page = validate_pagination()
    assert page.limit == DEFAULT_PAGE_LIMIT
    assert page.offset == DEFAULT_PAGE_OFFSET


def test_validate_pagination_caps_limit_at_max() -> None:
    page = validate_pagination(limit=MAX_PAGE_LIMIT + 25, offset=3)
    assert page.limit == MAX_PAGE_LIMIT
    assert page.offset == 3


def test_validate_pagination_accepts_numeric_strings() -> None:
    page = validate_pagination(limit=" 20 ", offset=" 5 ")
    assert page.limit == 20
    assert page.offset == 5


@pytest.mark.parametrize("value", [0, -1, "0", "-1"])
def test_validate_pagination_rejects_non_positive_limit(value: int | str) -> None:
    with pytest.raises(
        PaginationBoundsError, match="limit must be greater than or equal to 1"
    ):
        validate_pagination(limit=value)


@pytest.mark.parametrize("value", ["abc", "", True])
def test_validate_pagination_rejects_non_integer_limit(value: object) -> None:
    with pytest.raises(PaginationBoundsError, match="limit must be an integer"):
        validate_pagination(limit=value)  # type: ignore[arg-type]


@pytest.mark.parametrize("value", [-1, "-1"])
def test_validate_pagination_rejects_negative_offset(value: int | str) -> None:
    with pytest.raises(
        PaginationBoundsError, match="offset must be greater than or equal to 0"
    ):
        validate_pagination(offset=value)


def test_validate_pagination_rejects_invalid_config() -> None:
    with pytest.raises(
        PaginationBoundsError, match="default_limit must be less than or equal to max_limit"
    ):
        validate_pagination(default_limit=50, max_limit=10)


def test_build_paginated_response_matches_contract_shape() -> None:
    page = validate_pagination(limit=25, offset=0)

    payload = build_paginated_response(
        ("one", "two"),
        pagination=page,
        total=100,
    )

    assert payload == {
        "items": ["one", "two"],
        "page": {
            "limit": 25,
            "offset": 0,
            "total": 100,
        },
    }


def test_build_paginated_response_rejects_negative_total() -> None:
    page = validate_pagination(limit=10, offset=0)

    with pytest.raises(PaginationBoundsError, match="total must be greater than or equal to 0"):
        build_paginated_response([], pagination=page, total=-1)


def test_parse_csv_values_handles_single_and_multi_values() -> None:
    assert parse_csv_values(None) == []
    assert parse_csv_values("alpha, beta,, gamma ") == ["alpha", "beta", "gamma"]
    assert parse_csv_values(["red,blue", " green ", "", "yellow"]) == [
        "red",
        "blue",
        "green",
        "yellow",
    ]


def test_normalize_search_query_collapses_whitespace() -> None:
    assert normalize_search_query(None) is None
    assert normalize_search_query("   ") is None
    assert normalize_search_query("  john   doe   ") == "john doe"
