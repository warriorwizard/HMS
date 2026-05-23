from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.ai_intelligence.schemas import (
    AiResultsResponse,
    FindingsExtractionResponse,
    ReportSummaryResponse,
    RiskScoreResponse,
    SubmitAiTaskRequest,
    SubmitAiTaskResponse,
)
from app.modules.ai_intelligence.service import (
    extract_findings,
    list_ai_results,
    rule_based_risk_score,
    submit_ai_task,
    summarize_report,
)
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/results", response_model=AiResultsResponse)
def get_ai_results(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> AiResultsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    items, total = list_ai_results(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return AiResultsResponse.model_validate(payload)


@router.post("/tasks", response_model=SubmitAiTaskResponse)
def post_ai_task(
    payload: SubmitAiTaskRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> SubmitAiTaskResponse:
    return submit_ai_task(payload)


@router.post("/reports/{report_id}/summarize", response_model=ReportSummaryResponse)
def post_report_summary(
    report_id: str,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> ReportSummaryResponse:
    return summarize_report(report_id)


@router.post("/reports/{report_id}/extract-findings", response_model=FindingsExtractionResponse)
def post_extract_findings(
    report_id: str,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> FindingsExtractionResponse:
    return extract_findings(report_id)


@router.get("/reports/{report_id}/risk-score", response_model=RiskScoreResponse)
def get_risk_score(
    report_id: str,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> RiskScoreResponse:
    return rule_based_risk_score(report_id)
