# LLM Work Packet Template

Use this template when assigning a Tarini V6 task to an LLM or engineer.

```text
Task ID:
Task Title:
Component:
Priority:
Status:

Architecture Sources:
- docs/tarini-v6-architecture/[file].md
- project-tracker/issues/[issue].md
- project-tracker/ARCHITECTURE_GAP_QUEUE.md

Implementation Scope:
- Allowed files/directories:
- Files/directories not allowed:

Requirements:
- Preserve tenant isolation.
- Add or update tests.
- Add audit logging for sensitive actions.
- Do not implement autonomous clinical decisions.
- AI outputs must be advisory, explainable, and source-linked.
- Do not expose PHI in logs.

Acceptance Criteria:
- 

Verification Commands:
- 

Return:
- Files changed.
- Behavior implemented.
- Tests run.
- Risks or assumptions.
```

## Example
```text
Task ID: TAR-P1-004
Task Title: Implement tenant selection flow
Component: Auth, RBAC, Tenancy
Priority: P0
Status: Todo

Architecture Sources:
- docs/tarini-v6-architecture/02_AUTH_RBAC_TENANCY.md
- project-tracker/issues/TAR-ARCH-02-auth-rbac-tenancy.md

Implementation Scope:
- Allowed files/directories: backend/app/modules/identity, backend/tests
- Files/directories not allowed: frontend, project-tracker

Acceptance Criteria:
- Active user can select only an active tenant membership.
- API returns tenant-scoped access token.
- Invalid tenant selection returns 403.
- Tests cover valid and invalid tenant selection.
```

