from __future__ import annotations

from collections.abc import Iterable


def parse_csv_values(values: str | Iterable[str] | None) -> list[str]:
    if values is None:
        return []

    chunks = [values] if isinstance(values, str) else list(values)
    parsed: list[str] = []
    for chunk in chunks:
        for token in chunk.split(","):
            normalized = token.strip()
            if normalized:
                parsed.append(normalized)

    return parsed


def normalize_search_query(search: str | None) -> str | None:
    if search is None:
        return None

    collapsed = " ".join(search.split())
    return collapsed or None
