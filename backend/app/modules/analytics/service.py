from __future__ import annotations

from collections.abc import Sequence
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.analytics.schemas import (
    AnalyticsAiUsageItem,
    AnalyticsEventItem,
    AnalyticsRevenueSummaryItem,
    AnalyticsTatMetricItem,
    AnalyticsWorkflowBottleneckItem,
)

T = TypeVar("T")

_EVENTS: tuple[AnalyticsEventItem, ...] = (
    AnalyticsEventItem(
        id="evt_001",
        event_type="report_submitted",
        status="processed",
        department="radiology",
        source="ris",
        created_at="2026-05-21T10:00:00Z",
    ),
    AnalyticsEventItem(
        id="evt_002",
        event_type="ai_summary_generated",
        status="processed",
        department="radiology",
        source="ai-engine",
        created_at="2026-05-21T10:05:00Z",
    ),
    AnalyticsEventItem(
        id="evt_003",
        event_type="doctor_review_completed",
        status="processed",
        department="radiology",
        source="doctor-console",
        created_at="2026-05-21T10:12:00Z",
    ),
    AnalyticsEventItem(
        id="evt_004",
        event_type="report_submitted",
        status="queued",
        department="pathology",
        source="lis",
        created_at="2026-05-22T08:40:00Z",
    ),
    AnalyticsEventItem(
        id="evt_005",
        event_type="ai_summary_generated",
        status="failed",
        department="pathology",
        source="ai-engine",
        created_at="2026-05-22T08:50:00Z",
    ),
)

_TAT_METRICS: tuple[AnalyticsTatMetricItem, ...] = (
    AnalyticsTatMetricItem(
        id="tat_001",
        department="radiology",
        status="stable",
        avg_turnaround_minutes=26,
        p90_turnaround_minutes=48,
        case_count=128,
    ),
    AnalyticsTatMetricItem(
        id="tat_002",
        department="pathology",
        status="watch",
        avg_turnaround_minutes=34,
        p90_turnaround_minutes=67,
        case_count=96,
    ),
    AnalyticsTatMetricItem(
        id="tat_003",
        department="cardiology",
        status="stable",
        avg_turnaround_minutes=30,
        p90_turnaround_minutes=55,
        case_count=71,
    ),
    AnalyticsTatMetricItem(
        id="tat_004",
        department="emergency",
        status="critical",
        avg_turnaround_minutes=41,
        p90_turnaround_minutes=84,
        case_count=54,
    ),
)

_WORKFLOW_BOTTLENECKS: tuple[AnalyticsWorkflowBottleneckItem, ...] = (
    AnalyticsWorkflowBottleneckItem(
        id="wb_001",
        stage="uploads",
        department="radiology",
        status="watch",
        pending_cases=22,
        sla_breach_percent=12.5,
    ),
    AnalyticsWorkflowBottleneckItem(
        id="wb_002",
        stage="doctor_review",
        department="radiology",
        status="critical",
        pending_cases=15,
        sla_breach_percent=19.0,
    ),
    AnalyticsWorkflowBottleneckItem(
        id="wb_003",
        stage="quality_check",
        department="pathology",
        status="stable",
        pending_cases=8,
        sla_breach_percent=4.2,
    ),
)

_REVENUE_SUMMARY: tuple[AnalyticsRevenueSummaryItem, ...] = (
    AnalyticsRevenueSummaryItem(
        id="rev_001",
        period="2026-05",
        department="radiology",
        status="on_track",
        revenue_collected=145_220.0,
        revenue_outstanding=21_400.0,
        currency="USD",
    ),
    AnalyticsRevenueSummaryItem(
        id="rev_002",
        period="2026-05",
        department="pathology",
        status="watch",
        revenue_collected=96_510.0,
        revenue_outstanding=18_900.0,
        currency="USD",
    ),
    AnalyticsRevenueSummaryItem(
        id="rev_003",
        period="2026-05",
        department="cardiology",
        status="on_track",
        revenue_collected=88_040.0,
        revenue_outstanding=10_200.0,
        currency="USD",
    ),
)

_AI_USAGE: tuple[AnalyticsAiUsageItem, ...] = (
    AnalyticsAiUsageItem(
        id="ai_001",
        period="2026-W20",
        status="on_track",
        total_reports=642,
        ai_assisted_reports=472,
        doctor_only_reports=170,
        doctor_override_count=28,
        ai_assist_rate=73.5,
    ),
    AnalyticsAiUsageItem(
        id="ai_002",
        period="2026-W21",
        status="on_track",
        total_reports=688,
        ai_assisted_reports=519,
        doctor_only_reports=169,
        doctor_override_count=26,
        ai_assist_rate=75.4,
    ),
    AnalyticsAiUsageItem(
        id="ai_003",
        period="2026-W22",
        status="watch",
        total_reports=701,
        ai_assisted_reports=506,
        doctor_only_reports=195,
        doctor_override_count=33,
        ai_assist_rate=72.2,
    ),
)


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


def _matches_query(query: str | None, *values: str) -> bool:
    if not query:
        return True
    query_lower = query.lower()
    return any(query_lower in value.lower() for value in values)


def _apply_pagination(items: Sequence[T], pagination: PaginationParams) -> list[T]:
    start = pagination.offset
    end = start + pagination.limit
    return list(items[start:end])


def _matches_exact_token(filters: tuple[str, ...], value: str) -> bool:
    if not filters:
        return True
    return value.lower() in filters


def list_analytics_events(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    event_types: Sequence[str] = (),
    statuses: Sequence[str] = (),
    departments: Sequence[str] = (),
) -> tuple[list[AnalyticsEventItem], int]:
    normalized_event_types = _normalize_tokens(event_types)
    normalized_statuses = _normalize_tokens(statuses)
    normalized_departments = _normalize_tokens(departments)
    filtered = [
        item
        for item in _EVENTS
        if (
            _matches_exact_token(normalized_event_types, item.event_type)
            and _matches_exact_token(normalized_statuses, item.status)
            and _matches_exact_token(normalized_departments, item.department)
            and _matches_query(
                search,
                item.id,
                item.event_type,
                item.status,
                item.department,
                item.source,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_tat_metrics(
    *,
    pagination: PaginationParams,
    statuses: Sequence[str] = (),
    departments: Sequence[str] = (),
) -> tuple[list[AnalyticsTatMetricItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    normalized_departments = _normalize_tokens(departments)
    filtered = [
        item
        for item in _TAT_METRICS
        if (
            _matches_exact_token(normalized_statuses, item.status)
            and _matches_exact_token(normalized_departments, item.department)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_workflow_bottlenecks(
    *,
    pagination: PaginationParams,
    statuses: Sequence[str] = (),
    departments: Sequence[str] = (),
) -> tuple[list[AnalyticsWorkflowBottleneckItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    normalized_departments = _normalize_tokens(departments)
    filtered = [
        item
        for item in _WORKFLOW_BOTTLENECKS
        if (
            _matches_exact_token(normalized_statuses, item.status)
            and _matches_exact_token(normalized_departments, item.department)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_revenue_summary(
    *,
    pagination: PaginationParams,
    statuses: Sequence[str] = (),
    departments: Sequence[str] = (),
) -> tuple[list[AnalyticsRevenueSummaryItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    normalized_departments = _normalize_tokens(departments)
    filtered = [
        item
        for item in _REVENUE_SUMMARY
        if (
            _matches_exact_token(normalized_statuses, item.status)
            and _matches_exact_token(normalized_departments, item.department)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def list_ai_usage(
    *,
    pagination: PaginationParams,
    statuses: Sequence[str] = (),
) -> tuple[list[AnalyticsAiUsageItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        item
        for item in _AI_USAGE
        if _matches_exact_token(normalized_statuses, item.status)
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total
