# TAR-ARCH-17 - Frontend UI Architecture

Status: Later
Type: Architecture Module Issue
Epic: `TAR-EPIC-17` Frontend UI Architecture
Priority: P1
Source: `../../docs/tarini-v6-architecture/17_FRONTEND_UI_ARCHITECTURE.md`

## Goal
Build a clinical SaaS interface that supports dense worklists, patient timelines, upload flows, risk panels, copilot assistance, and executive analytics without feeling like a marketing page.

## Functional Scope
- Role-aware app shells.
- Route map for dashboard, patients, visits, reports, command center, copilot, analytics, billing, and admin.
- API client contract.
- Core components for tables, filters, panels, status badges, timelines, and alerts.
- Doctor command center, upload, and copilot UI patterns.
- Responsive and accessible behavior.

## Backing Tasks
- [x] `TAR-P0-003` Create frontend Next.js skeleton.
- [ ] `TAR-P1-008` Build frontend login page.
- [ ] `TAR-P1-009` Build tenant selection page.
- [ ] `TAR-P1-010` Build role-aware app shell navigation.
- [ ] `TAR-P2-009` Build patient search UI.
- [ ] `TAR-P2-010` Build patient registration UI.
- [ ] `TAR-P2-011` Build patient profile and timeline UI.
- [ ] `TAR-P3-009` Build technician upload UI.
- [ ] `TAR-P3-010` Build report viewer UI.
- [ ] `TAR-P7-008` Build command center queue UI.
- [ ] `TAR-P7-009` Build case workspace UI.
- [ ] `TAR-P8-008` Build copilot panel UI.

## Implementation Notes
- The UI should be work-focused, dense, and calm.
- Use module API contracts before building full screens.
- Avoid patient PHI in logs, URLs, and browser-visible diagnostic output.
- Every clinical state needs loading, empty, error, and permission-denied behavior.

## Acceptance Checks
- App shell changes by role and tenant context.
- Core workflows are accessible on desktop and usable on mobile where needed.
- Screens handle loading, empty, error, and forbidden states.
- Clinical panels show source, timestamp, and status information.
- UI tests or browser verification cover high-risk workflows.

## LLM Handoff
```text
Read 17_FRONTEND_UI_ARCHITECTURE.md. Build UI only when backing APIs or mock contracts are clear. Keep screens operational and role-aware, not marketing-style.
```
