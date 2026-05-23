# MLOps and Learning Loop Architecture

## Product Purpose
The Learning Loop captures outcomes, doctor feedback, model performance, drift, and data quality signals so Tarini V6 can improve safely over time.

This module must be governed. Models should not silently self-update in production.

## Users
- AI/ML Engineer.
- Clinical Governance Lead.
- Hospital Admin.
- Doctor Lead.
- Product Team.

## In Scope
- Model registry.
- Prompt registry.
- Evaluation datasets.
- Outcome capture.
- Feedback capture.
- Drift monitoring.
- Shadow evaluation.
- Controlled rollout.
- Model performance dashboard.

## Out of Scope for MVP
- Fully automated retraining to production.
- Unreviewed model promotion.
- Black-box model changes without versioning.
- Clinical claims without validation.

## Core Entities
`model_registry`:
- `id`
- `model_name`
- `model_type`
- `version`
- `status`
- `training_data_ref`
- `evaluation_summary`
- `approved_by`
- `created_at`

`prompt_registry`:
- `id`
- `prompt_name`
- `version`
- `content_hash`
- `status`
- `approved_by`
- `created_at`

`model_evaluations`:
- `id`
- `model_id`
- `evaluation_dataset_id`
- `metrics`
- `safety_results`
- `bias_results`
- `created_at`

`feedback_records`:
- `id`
- `tenant_id`
- `source_type`
- `source_id`
- `feedback_type`
- `feedback_value`
- `submitted_by`
- `created_at`

`outcome_records`:
- `id`
- `tenant_id`
- `patient_id`
- `visit_id`
- `outcome_type`
- `outcome_value`
- `recorded_by`
- `recorded_at`

## Feedback Sources
Capture feedback from:
- Doctor priority override.
- Copilot helpfulness feedback.
- Unsafe/incorrect AI flag.
- Follow-up completion.
- Outcome recorded.
- Escalation result.
- Manual correction to report metadata.

## Model Lifecycle
1. Candidate model or prompt is created.
2. Offline evaluation runs.
3. Safety evaluation runs.
4. Bias/fairness review runs where applicable.
5. Clinical review approves or rejects.
6. Model enters shadow mode.
7. Shadow performance is compared with production.
8. Limited rollout begins.
9. Monitoring checks performance and safety.
10. Full rollout or rollback decision is made.

## Model Statuses
- `draft`
- `offline_evaluating`
- `clinical_review`
- `shadow`
- `limited_rollout`
- `active`
- `paused`
- `retired`
- `rejected`

## Drift Monitoring
Monitor:
- Input distribution drift.
- Risk score distribution drift.
- Missing data rate.
- Doctor override rate.
- False alert proxy.
- Follow-up outcome changes.
- Site-level performance differences.

## Evaluation Metrics
For risk models:
- Sensitivity.
- Specificity.
- Precision.
- Recall.
- Calibration.
- AUROC where appropriate.
- False negative review.
- False positive review.

For retrieval:
- Top-k relevance.
- Citation correctness.
- Source coverage.
- Missing context rate.

For copilot:
- Groundedness.
- Citation accuracy.
- Unsafe suggestion rate.
- Doctor acceptance.
- User feedback.

## API Endpoints
- `GET /mlops/models`
- `POST /mlops/models`
- `PATCH /mlops/models/{model_id}`
- `GET /mlops/evaluations`
- `POST /mlops/evaluations`
- `GET /mlops/prompts`
- `POST /mlops/prompts`
- `POST /mlops/feedback`
- `POST /mlops/outcomes`
- `GET /mlops/drift`

## Events
- `mlops.feedback_recorded`
- `mlops.outcome_recorded`
- `mlops.model_evaluation_started`
- `mlops.model_evaluation_completed`
- `mlops.model_promoted`
- `mlops.model_rolled_back`
- `mlops.drift_detected`

## Governance Rules
- Production model changes require approval.
- Evaluation results must be retained.
- Prompt changes must be versioned.
- Model output logs must be accessible for audit.
- Safety incidents can pause model.
- Tenant-specific validation may be required before enabling advanced prediction.

## Failure and Edge Cases
- Outcome labels sparse: do not overtrain or overclaim.
- Data drift detected: alert and consider fallback.
- Model performance varies by site: require site-specific review.
- Prompt regression: rollback to previous prompt version.
- Feedback biased by user behavior: include caution in evaluation.

## Implementation Tasks
- Create model and prompt registry tables.
- Capture feedback from copilot and command center.
- Capture outcome records.
- Build offline evaluation harness later.
- Build drift dashboard.
- Implement model version selection policy.
- Add shadow-mode support.

## Acceptance Criteria
- Every AI output stores model and prompt version.
- Doctor feedback is captured.
- Outcomes can be linked to visits.
- Model/prompt versions can be paused or retired.
- Production promotion requires approval record.

## LLM Implementation Notes
Tell implementation agents that the learning loop is controlled improvement, not automatic self-learning. The first implementation should focus on versioning, feedback, outcomes, and auditability.

