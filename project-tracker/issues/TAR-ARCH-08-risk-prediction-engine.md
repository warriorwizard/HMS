# TAR-ARCH-08 - Risk and Prediction Engine

Status: Ready
Type: Architecture Module Issue
Epic: `TAR-EPIC-08` Risk and Prediction Engine
Priority: P1
Source: `../../docs/tarini-v6-architecture/08_RISK_PREDICTION_ENGINE.md`

## Goal
Provide explainable risk scoring, deterioration/follow-up risk signals, priority queue updates, and human override support.

## Functional Scope
- Risk assessment, factor, and priority queue tables.
- Rule-based risk scoring MVP.
- Configurable thresholds.
- Priority queue update logic.
- Risk history API.
- Doctor override API.
- Risk explanation UI.

## Backing Tasks
- [ ] `TAR-P6-001` Create risk assessment, factor, priority queue tables.
- [ ] `TAR-P6-002` Implement rule-based risk scoring service.
- [ ] `TAR-P6-003` Implement configurable risk thresholds.
- [ ] `TAR-P6-004` Implement priority queue update logic.
- [ ] `TAR-P6-005` Implement risk history API.
- [ ] `TAR-P6-006` Implement doctor override API.
- [ ] `TAR-P6-007` Build risk explanation UI.
- [ ] `TAR-P6-008` Add unknown-data and override tests.

## Implementation Notes
- Start with deterministic rules before predictive ML.
- Every risk score needs contributing factors and missing-data notes.
- Doctors must be able to override or annotate risk.
- Prediction outputs should include version, confidence, and non-diagnostic language.

## Acceptance Checks
- A patient or visit can receive a risk assessment.
- Priority queue rank updates from risk output.
- Risk explanations show factors, missing data, and version.
- Doctor override is persisted and audited.
- Tests cover unknown data, stale data, and override behavior.

## LLM Handoff
```text
Read 08_RISK_PREDICTION_ENGINE.md and BACKLOG.md Phase 6. Implement rule-based scoring first. Avoid diagnostic claims and persist explainability with every score.
```
