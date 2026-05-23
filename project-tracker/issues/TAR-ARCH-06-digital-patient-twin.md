# TAR-ARCH-06 - Digital Patient Twin

Status: Later
Type: Architecture Module Issue
Epic: `TAR-EPIC-06` Digital Patient Twin
Priority: P2
Source: `../../docs/tarini-v6-architecture/06_DIGITAL_PATIENT_TWIN.md`

## Goal
Build a dynamic patient intelligence profile that summarizes progression, behavior, interventions, risk evolution, and predictive health context.

## Functional Scope
- Patient twin and snapshot tables.
- Progression, behavior, intervention, and predictive profile fields.
- Snapshot creation from risk assessments and timeline events.
- Progression comparison logic.
- Patient twin API and UI panel.

## Backing Tasks
- [ ] `TAR-P9-001` Create patient twin, snapshot, intervention tables.
- [ ] `TAR-P9-002` Implement twin snapshot creation from risk assessment.
- [ ] `TAR-P9-003` Implement progression comparison logic.
- [ ] `TAR-P9-004` Implement patient twin API.
- [ ] `TAR-P9-005` Implement intervention history API.
- [ ] `TAR-P9-006` Build digital twin UI panel.
- [ ] `TAR-P9-007` Add low-confidence and missing-data tests.

## Implementation Notes
- The twin should summarize evidence; it should not invent diagnosis.
- Low-data and stale-data states must be explicit.
- Interventions should be linked to doctor decisions and outcomes where possible.
- Predictive profile fields must carry confidence and model/rule version.

## Acceptance Checks
- A patient twin snapshot can be generated from existing risk and memory data.
- Progression comparisons explain what changed and cite underlying events.
- Missing data does not produce false certainty.
- UI distinguishes observed facts from predictions.

## LLM Handoff
```text
Read 06_DIGITAL_PATIENT_TWIN.md and BACKLOG.md Phase 9. Do not start until patient, memory, risk, and intervention data exist. Keep all predictions explainable and versioned.
```
