# TAR-ARCH-05 - Clinical Memory Engine

Status: Ready
Type: Architecture Module Issue
Epic: `TAR-EPIC-05` Clinical Memory Engine
Priority: P1
Source: `../../docs/tarini-v6-architecture/05_CLINICAL_MEMORY_ENGINE.md`

## Goal
Create source-backed longitudinal clinical memory so AI and doctors can retrieve patient context, prior findings, actions, follow-ups, and outcomes.

## Functional Scope
- Memory item schema with source references.
- Embedding and retrieval log tables.
- Report-to-memory ingestion.
- Chunking and embedding interfaces.
- Patient context retrieval API.
- Similar case retrieval API.
- Memory panel UI.

## Backing Tasks
- [ ] `TAR-P5-001` Create memory item, embedding, retrieval log tables.
- [ ] `TAR-P5-002` Implement report-to-memory ingestion service.
- [ ] `TAR-P5-003` Implement text chunking strategy.
- [ ] `TAR-P5-004` Implement embedding generation interface.
- [ ] `TAR-P5-005` Implement patient context retrieval API.
- [ ] `TAR-P5-006` Implement similar case retrieval API.
- [ ] `TAR-P5-007` Add source reference formatting.
- [ ] `TAR-P5-008` Build memory/context UI panel.
- [ ] `TAR-P5-009` Add retrieval audit tests.

## Implementation Notes
- Memory retrieval must return sources, confidence, timestamps, and missing-context warnings.
- Similar case retrieval must avoid leaking other tenants or identifying unrelated patients.
- Retrieval logs should record purpose, user, tenant, patient, query, and selected sources.
- Memory items should be immutable enough to support clinical audit.

## Acceptance Checks
- A report can produce memory items with source references.
- Patient context retrieval returns relevant, tenant-scoped context.
- Copilot-ready context packages include citations.
- Missing or low-confidence context is surfaced clearly.
- Retrieval access is audited.

## LLM Handoff
```text
Read 05_CLINICAL_MEMORY_ENGINE.md and BACKLOG.md Phase 5. Build schema and ingestion after report metadata exists. Never return uncited clinical claims from memory APIs.
```
