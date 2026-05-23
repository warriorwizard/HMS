# TAR-ARCH-00 - LLM Handoff Method

Status: Done
Type: Architecture Module Issue
Epic: `TAR-EPIC-00` LLM Handoff Method
Priority: P0
Source: `../../docs/tarini-v6-architecture/00_INDEX_AND_LLM_METHOD.md`

## Goal
Make every implementation packet understandable to an LLM agent without losing product intent, safety constraints, dependencies, or acceptance criteria.

## Scope
- Maintain the architecture index as the canonical entry point.
- Preserve the standard file method for module handoff.
- Keep non-negotiable product rules visible before AI or clinical work begins.
- Use small work packets with explicit data, API, UI, test, and audit expectations.

## Backing Tasks
- [x] `TAR-TRACK-001` Create local tracker folder and status board.
- [x] `TAR-TRACK-002` Break architecture into implementation tasks.
- [x] `TAR-ARCH-00-A` Create Jira-style board and issue card system.

## Implementation Notes
- This card is operational documentation, not product code.
- Any future agent should start with `JIRA_BOARD.md`, then this method, then the active issue card.
- All clinical AI work must include source traceability, uncertainty handling, and clinician review.

## Acceptance Checks
- The architecture pack has an index and implementation method.
- The tracker has a board, epics, and module issue cards.
- The handoff format tells an LLM what to read, what to change, and how to verify.

## LLM Handoff
```text
Read the active issue card, then read its source architecture file. Work only on the next backing task, preserve tenant isolation and audit rules, run focused verification, and update the tracker before stopping.
```
