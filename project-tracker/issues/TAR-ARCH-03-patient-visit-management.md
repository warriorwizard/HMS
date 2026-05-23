# TAR-ARCH-03 - Patient and Visit Management

Status: Ready
Type: Architecture Module Issue
Epic: `TAR-EPIC-03` Patient and Visit Management
Priority: P0
Source: `../../docs/tarini-v6-architecture/03_PATIENT_VISIT_MANAGEMENT.md`

## Goal
Create the patient and visit foundation that anchors reports, workflow, billing, clinical memory, risk, and doctor review.

## Functional Scope
- Patient demographic profile and identifiers.
- Consent capture and data quality flags.
- Visit creation, lifecycle, and status transitions.
- Patient search with duplicate detection.
- Longitudinal patient timeline.
- Tenant-scoped patient and visit APIs.

## Backing Tasks
- [ ] `TAR-P2-001` Create patient, identifiers, consent, visit, timeline tables.
- [ ] `TAR-P2-002` Implement patient create/read/update APIs.
- [ ] `TAR-P2-003` Implement patient search API.
- [ ] `TAR-P2-004` Implement duplicate detection service.
- [ ] `TAR-P2-005` Implement visit creation API.
- [ ] `TAR-P2-006` Implement visit state machine.
- [ ] `TAR-P2-007` Implement consent capture API.
- [ ] `TAR-P2-008` Implement patient timeline writer.
- [ ] `TAR-P2-009` Build patient search UI.
- [ ] `TAR-P2-010` Build patient registration UI.
- [ ] `TAR-P2-011` Build patient profile and timeline UI.
- [ ] `TAR-P2-012` Add patient/visit tenant isolation tests.

## Implementation Notes
- Patient data must be tenant scoped and audit logged on sensitive access.
- Duplicate matching should warn first; it should not auto-merge records in MVP.
- Visit state transitions should be explicit and testable.
- Timeline events should be append-only for clinical traceability.

## Acceptance Checks
- Staff can register a patient and create a visit.
- Search returns only tenant-visible patients.
- Duplicate warnings appear without destructive merging.
- Visit status changes are validated by state machine rules.
- Timeline records registration, visit creation, report upload, AI output, review, follow-up, and outcome events.

## LLM Handoff
```text
Read 03_PATIENT_VISIT_MANAGEMENT.md and BACKLOG.md Phase 2. Start at TAR-P2-001 after identity foundations are ready. Preserve tenant scoping, audit behavior, and append-only timeline semantics.
```
