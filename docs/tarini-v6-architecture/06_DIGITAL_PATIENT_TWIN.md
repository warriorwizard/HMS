# Digital Patient Twin Architecture

## Product Purpose
The Digital Patient Twin is a dynamic intelligence profile for each patient. It combines clinical context, progression signals, behavior patterns, interventions, follow-ups, and risk predictions into a single evolving state.

This module should help doctors understand change over time. It must not pretend to be a biological simulation or guaranteed forecast.

## Users
- Doctor: views patient progression and risk state.
- Follow-up team: sees adherence and missed follow-up risk.
- Risk Agent: updates risk factors.
- Analytics team: tracks aggregated progression patterns.

## In Scope
- Patient intelligence profile.
- Progression score.
- Behavior/adherence score.
- Intervention history.
- Risk factor tracking.
- Prediction snapshot history.
- Human-readable explanation of state changes.

## Out of Scope for MVP
- Real-time physiologic simulation.
- Autonomous diagnosis.
- Treatment optimization without clinical validation.
- Device streaming unless pilot requires it.

## Core Concepts
Digital Patient Twin should be represented as snapshots over time.

Each snapshot answers:
- What is the patient risk state right now?
- What changed since last visit?
- Which evidence supports the change?
- What follow-up or action is pending?
- How reliable is the score?

## Core Entities
`patient_twins`:
- `id`
- `tenant_id`
- `patient_id`
- `current_risk_band`
- `current_progression_score`
- `current_adherence_score`
- `current_confidence`
- `last_updated_at`

`patient_twin_snapshots`:
- `id`
- `tenant_id`
- `patient_id`
- `visit_id`
- `risk_band`
- `progression_score`
- `adherence_score`
- `confidence`
- `clinical_factors`
- `behavior_factors`
- `evidence_refs`
- `generated_by`
- `created_at`

`patient_interventions`:
- `id`
- `tenant_id`
- `patient_id`
- `visit_id`
- `intervention_type`
- `description`
- `recommended_by`
- `approved_by`
- `status`
- `created_at`

## Scores
Progression score:
- Indicates whether the patient's clinical state appears stable, improving, worsening, or uncertain.
- Should be explainable and source-linked.
- Should be calculated from structured values, reports, timeline events, and doctor notes where available.

Adherence score:
- Indicates follow-up reliability and appointment/report completion pattern.
- Should use missed follow-ups, delayed visits, response history, and communication success.

Risk band:
- `low`
- `moderate`
- `high`
- `critical`
- `unknown`

Confidence:
- `low`
- `medium`
- `high`

Confidence should decrease when:
- Data is missing.
- Reports conflict.
- Evidence is old.
- Model is out of distribution.
- Patient has sparse history.

## Update Workflow
1. Report parsed or doctor note created.
2. Clinical memory updates.
3. Risk engine generates new risk analysis.
4. Patient twin service compares new state with previous snapshot.
5. Snapshot is created.
6. Timeline event is created if meaningful change occurs.
7. Doctor command center updates risk timeline.

## API Endpoints
- `GET /patients/{patient_id}/twin`
- `GET /patients/{patient_id}/twin/snapshots`
- `POST /patients/{patient_id}/twin/recalculate`
- `GET /visits/{visit_id}/twin-snapshot`
- `POST /patients/{patient_id}/interventions`
- `PATCH /interventions/{intervention_id}`

## Events
- `patient_twin.recalculation_requested`
- `patient_twin.snapshot_created`
- `patient_twin.risk_band_changed`
- `patient_twin.progression_changed`
- `patient_intervention.created`
- `patient_intervention.completed`

## UI Requirements
Display:
- Current risk band.
- Progression trend.
- Confidence.
- Top contributing factors.
- Missing data warnings.
- Intervention history.
- Follow-up adherence state.

Avoid:
- Overly precise false certainty.
- Decorative health meters without explanation.
- Hiding source evidence.

## AI Behavior
The AI can summarize:
- Why score changed.
- Which data was used.
- Which data is missing.
- What follow-up is already scheduled.

The AI must not:
- Claim certain future outcomes.
- Recommend treatment without doctor approval.
- Present correlation as causation.

## Failure and Edge Cases
- No history: twin state is `unknown` with low confidence.
- Conflicting reports: mark conflict and route to doctor review.
- Patient merge: snapshots must be preserved and remapped.
- Recalculation error: keep previous snapshot and log failure.

## Implementation Tasks
- Create twin and snapshot tables.
- Implement snapshot creation from risk analysis.
- Implement progression comparison logic.
- Build patient twin panel in UI.
- Add events for risk band changes.
- Add audit logs for recalculation and manual override.

## Acceptance Criteria
- Every patient can have a current twin state.
- Twin snapshots show historical progression.
- Score changes show evidence references.
- Unknown and low-confidence states are displayed honestly.
- Doctor can see what changed since last visit.

## LLM Implementation Notes
Instruct LLM agents to build the twin as explainable snapshots, not as a mysterious live object. The value is the change history plus evidence references.

