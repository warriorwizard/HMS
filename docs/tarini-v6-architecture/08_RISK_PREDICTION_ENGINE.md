# Risk and Prediction Engine Architecture

## Product Purpose
The Risk and Prediction Engine prioritizes cases, identifies deterioration signals, estimates missed follow-up risk, and forecasts operational workload. It must combine rules, validated models, and explainability.

The first version should be conservative and transparent. Clinical trust is more important than aggressive automation.

## Users
- Doctor: sees case risk and reasoning.
- Staff: sees follow-up risk and overdue tasks.
- Hospital Admin: monitors risk distribution and SLA.
- AI Coordinator: requests risk assessment.
- Analytics Engine: consumes risk events.

## In Scope
- Risk score calculation.
- Priority queue signal.
- Risk explanation.
- Risk history over time.
- Missed follow-up risk.
- Operational bottleneck prediction.
- Workload forecast.

## Out of Scope for MVP
- Regulatory-grade diagnostic claims.
- Fully automated triage without doctor review.
- Treatment recommendation models.
- Production retraining without approval.

## Risk Types
Clinical:
- Deterioration risk.
- Critical report risk.
- Progression risk.
- Missing data risk.

Operational:
- SLA breach risk.
- Review delay risk.
- Follow-up miss risk.
- Workload spike risk.

## Core Entities
`risk_assessments`:
- `id`
- `tenant_id`
- `patient_id`
- `visit_id`
- `risk_type`
- `risk_score`
- `risk_band`
- `confidence`
- `model_version`
- `rule_version`
- `explanation`
- `evidence_refs`
- `missing_data`
- `created_at`

`risk_factors`:
- `id`
- `tenant_id`
- `risk_assessment_id`
- `factor_name`
- `factor_type`
- `factor_value`
- `weight`
- `direction`
- `source_ref`

`priority_queue_items`:
- `id`
- `tenant_id`
- `visit_id`
- `patient_id`
- `assigned_doctor_id`
- `priority_score`
- `priority_band`
- `reason`
- `status`
- `created_at`
- `updated_at`

## Scoring Strategy
MVP should use a hybrid approach:
- Deterministic rules for obvious high-risk indicators.
- Configurable thresholds per report type and specialty.
- ML scoring only where data and validation support it.
- Human override with reason capture.

Risk score scale:
- 0 to 100.

Risk bands:
- `low`: 0-24
- `moderate`: 25-49
- `high`: 50-79
- `critical`: 80-100
- `unknown`: insufficient data

These thresholds should be tenant-configurable after validation.

## Risk Assessment Workflow
1. Report parsing completes or visit context changes.
2. AI coordinator requests risk assessment.
3. Risk service loads patient, visit, report, memory, and prior risk context.
4. Data quality checks run.
5. Rule engine computes baseline flags.
6. ML model computes score if enabled and valid for context.
7. Scores are blended using configured policy.
8. Explanation is generated from factors.
9. Risk assessment is stored.
10. Priority queue is updated.
11. Doctor command center receives update.

## Explanation Requirements
Risk explanation must include:
- Top positive risk factors.
- Top reassuring factors if relevant.
- Missing or stale data.
- Source references.
- Confidence.
- Whether score came from rule, model, or hybrid.

Example:
```json
{
  "risk_band": "high",
  "risk_score": 72,
  "confidence": "medium",
  "factors": [
    {
      "name": "Marked increase from previous value",
      "source_ref": "rep_123",
      "direction": "increases_risk"
    }
  ],
  "missing_data": ["No prior report in last 90 days."],
  "method": "hybrid_rules_model"
}
```

## API Endpoints
- `POST /risk/assessments`
- `GET /risk/assessments/{assessment_id}`
- `GET /visits/{visit_id}/risk`
- `GET /patients/{patient_id}/risk-history`
- `POST /risk/recalculate`
- `PATCH /priority-queue/{item_id}`
- `GET /priority-queue`
- `POST /priority-queue/{item_id}/override`

## Events
- `risk.assessment_requested`
- `risk.assessment_completed`
- `risk.score_updated`
- `risk.band_changed`
- `priority_queue.item_created`
- `priority_queue.item_updated`
- `priority_queue.override_created`

## Human Override
Doctors must be able to override:
- Priority band.
- Review urgency.
- Follow-up requirement.

Override requires:
- Reason.
- Actor.
- Timestamp.
- Previous value.
- New value.

Overrides should feed analytics and model evaluation.

## Validation Requirements
Before claiming predictive performance:
- Use historical labeled data.
- Measure sensitivity, specificity, PPV, NPV where appropriate.
- Measure calibration.
- Evaluate across demographics and sites.
- Review false positives and false negatives with clinicians.
- Run shadow mode before activating recommendations.

## Failure and Edge Cases
- Insufficient data: return `unknown`, not low risk.
- Model unavailable: use rules and mark method.
- Out-of-distribution input: reduce confidence or block model score.
- Conflicting data: include conflict warning.
- Doctor override: queue should reflect doctor decision with audit trail.

## Implementation Tasks
- Create risk assessment schema.
- Implement rule engine.
- Implement configurable thresholds.
- Implement priority queue update logic.
- Implement risk history API.
- Build UI risk explanation panel.
- Add tests for unknown data, threshold rules, and overrides.

## Acceptance Criteria
- Risk assessments are source-linked and auditable.
- Priority queue updates after risk calculation.
- Unknown data is handled honestly.
- Doctor can override priority with reason.
- Risk history is visible in patient timeline.

## LLM Implementation Notes
Implementation agents should start with rule-based risk scoring and clean interfaces for future ML models. Avoid pretending to have validated prediction before data exists.

