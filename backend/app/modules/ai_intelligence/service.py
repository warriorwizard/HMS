from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.ai_intelligence.schemas import (
    AiResultItem,
    ExplainabilitySource,
    FindingsExtractionResponse,
    ReportSummaryResponse,
    RiskScoreResponse,
    SubmitAiTaskRequest,
    SubmitAiTaskResponse,
)

T = TypeVar("T")

_RESULTS: list[AiResultItem] = [
    AiResultItem(
        id="air_001",
        report_id="rpt_001",
        patient_id="pat_001",
        status="completed",
        risk_score=0.84,
        summary="Chest radiograph indicates mild bilateral patchy opacities with urgent review advised.",
        findings=["Patchy bilateral opacity", "No pleural effusion", "Heart size within normal limits"],
        explainability=[
            ExplainabilitySource(
                source_type="report_text",
                source_id="rpt_001",
                excerpt="Patchy bilateral opacities are seen in lower lung fields.",
            ),
            ExplainabilitySource(
                source_type="historical_trend",
                source_id="pat_001",
                excerpt="Recent cough and oxygen desaturation trend increased risk score.",
            ),
        ],
        created_at="2026-05-23T09:30:00Z",
    )
]

_next_task_id = 2
_lock = Lock()


def _normalize_tokens(values: Sequence[str]) -> tuple[str, ...]:
    normalized: list[str] = []
    seen: set[str] = set()
    for value in values:
        token = value.strip().lower()
        if not token or token in seen:
            continue
        normalized.append(token)
        seen.add(token)
    return tuple(normalized)


def _matches_exact_token(filters: tuple[str, ...], value: str) -> bool:
    if not filters:
        return True
    return value.lower() in filters


def _matches_query(query: str | None, *values: str) -> bool:
    if not query:
        return True
    token = query.lower()
    return any(token in value.lower() for value in values)


def _apply_pagination(items: Sequence[T], pagination: PaginationParams) -> list[T]:
    start = pagination.offset
    end = start + pagination.limit
    return list(items[start:end])


def list_ai_results(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[AiResultItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        result
        for result in _RESULTS
        if (
            _matches_exact_token(normalized_statuses, result.status)
            and _matches_query(
                search,
                result.id,
                result.report_id,
                result.patient_id,
                result.status,
                result.summary,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def submit_ai_task(payload: SubmitAiTaskRequest) -> SubmitAiTaskResponse:
    global _next_task_id

    with _lock:
        task_id = f"ait_{_next_task_id:03d}"
        _next_task_id += 1

    return SubmitAiTaskResponse(task_id=task_id, status="queued")


def summarize_report(report_id: str) -> ReportSummaryResponse:
    result = next((item for item in _RESULTS if item.report_id == report_id), None)
    if result is None:
        return ReportSummaryResponse(
            report_id=report_id,
            summary="No prior AI result found. Summary will be generated when analysis completes.",
        )
    return ReportSummaryResponse(report_id=report_id, summary=result.summary)


def extract_findings(report_id: str) -> FindingsExtractionResponse:
    result = next((item for item in _RESULTS if item.report_id == report_id), None)
    if result is None:
        return FindingsExtractionResponse(
            report_id=report_id,
            findings=["No extraction available for this report yet."],
        )
    return FindingsExtractionResponse(report_id=report_id, findings=result.findings)


def rule_based_risk_score(report_id: str) -> RiskScoreResponse:
    result = next((item for item in _RESULTS if item.report_id == report_id), None)
    if result is None:
        return RiskScoreResponse(
            report_id=report_id,
            risk_score=0.32,
            risk_level="moderate",
            rationale="Default moderate risk due to insufficient clinical context.",
        )

    score = result.risk_score
    if score >= 0.8:
        level = "critical"
    elif score >= 0.6:
        level = "high"
    elif score >= 0.3:
        level = "moderate"
    else:
        level = "low"

    return RiskScoreResponse(
        report_id=report_id,
        risk_score=score,
        risk_level=level,
        rationale="Risk derived from AI findings, historical trend, and urgency signals.",
    )
