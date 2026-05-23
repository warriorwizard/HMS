# TAR-ARCH-19 - MLOps and Learning Loop

Status: Later
Type: Architecture Module Issue
Epic: `TAR-EPIC-19` MLOps and Learning Loop
Priority: P3
Source: `../../docs/tarini-v6-architecture/19_MLOPS_LEARNING_LOOP.md`

## Goal
Create governed learning infrastructure for model versions, prompt versions, feedback, outcomes, drift monitoring, evaluations, and shadow-mode model selection.

## Functional Scope
- Model registry and prompt registry.
- Store model and prompt version on AI outputs.
- Feedback and outcome tables.
- Feedback capture and outcome capture APIs.
- Drift monitoring baseline.
- Shadow-mode model selection.
- MLOps governance UI.

## Backing Tasks
- [ ] `TAR-P13-001` Create model registry and prompt registry tables.
- [ ] `TAR-P13-002` Store model and prompt version on AI outputs.
- [ ] `TAR-P13-003` Create feedback and outcome tables.
- [ ] `TAR-P13-004` Implement feedback capture API.
- [ ] `TAR-P13-005` Implement outcome capture API.
- [ ] `TAR-P13-006` Implement drift monitoring baseline.
- [ ] `TAR-P13-007` Implement shadow-mode model selection.
- [ ] `TAR-P13-008` Build MLOps governance UI.

## Implementation Notes
- No production self-learning without governance and review.
- Shadow mode should compare outputs without changing clinical workflow.
- Feedback should connect to source output, user, tenant, model version, and outcome.
- Drift metrics should be understandable to clinical and operational reviewers.

## Acceptance Checks
- Every AI output records model and prompt version.
- Clinician feedback can be captured and linked to AI output.
- Outcomes can be captured without rewriting historical AI outputs.
- Shadow-mode evaluation does not affect patient care.
- Drift and evaluation data are permission gated.

## LLM Handoff
```text
Read 19_MLOPS_LEARNING_LOOP.md and BACKLOG.md Phase 13. Do not implement autonomous production learning. Build versioning and feedback capture before evaluation automation.
```
