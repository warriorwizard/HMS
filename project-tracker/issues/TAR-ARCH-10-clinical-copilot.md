# TAR-ARCH-10 - Clinical Copilot

Status: Ready
Type: Architecture Module Issue
Epic: `TAR-EPIC-10` Clinical Copilot
Priority: P1
Source: `../../docs/tarini-v6-architecture/10_CLINICAL_COPILOT.md`

## Goal
Assist doctors with grounded summaries, progression explanations, similar case retrieval, note drafts, workflow answers, and suggested next actions.

## Functional Scope
- Conversation, message, artifact, and feedback tables.
- Copilot mode classifier.
- Retrieval-grounded answer service.
- Report summary endpoint.
- Risk explanation endpoint.
- Note draft artifact flow.
- Safety and citation validation.
- Copilot panel UI.

## Backing Tasks
- [ ] `TAR-P8-001` Create copilot conversation, message, artifact tables.
- [ ] `TAR-P8-002` Implement copilot mode classifier.
- [ ] `TAR-P8-003` Implement retrieval-grounded answer service.
- [ ] `TAR-P8-004` Implement report summary endpoint.
- [ ] `TAR-P8-005` Implement risk explanation endpoint.
- [ ] `TAR-P8-006` Implement note draft artifact flow.
- [ ] `TAR-P8-007` Implement copilot safety and citation validation.
- [ ] `TAR-P8-008` Build copilot panel UI.
- [ ] `TAR-P8-009` Add copilot feedback capture.
- [ ] `TAR-P8-010` Add prompt injection and missing-context tests.

## Implementation Notes
- Copilot responses must cite retrieved clinical sources.
- If evidence is missing, the answer should say that clearly.
- Note drafts are drafts only and require clinician acceptance.
- Prompt injection tests are mandatory before production pilot.

## Acceptance Checks
- Copilot can summarize report progression with citations.
- Copilot can explain risk using stored risk factors.
- Unsafe requests or missing context produce safe fallback responses.
- Feedback is captured for future learning loop analysis.
- Conversation access is tenant and permission scoped.

## LLM Handoff
```text
Read 10_CLINICAL_COPILOT.md and BACKLOG.md Phase 8. Build data contracts and retrieval grounding before model polish. Do not allow uncited clinical claims.
```
