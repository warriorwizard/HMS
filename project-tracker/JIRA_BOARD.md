# Tarini V6 Jira-Style Board

Last updated: 2026-05-23

## How To Use This Board
Use this file as the quick operating view. Use `EPICS.md` for product-area planning and `issues/` for the individual architecture module cards.
Use `ARCHITECTURE_GAP_QUEUE.md` for the expanded granular issues extracted from the architecture review.

Status in this file is derived from `BACKLOG.md` without changing the original task statuses.

## Current Focus
| Field | Value |
| --- | --- |
| Active work note | `CURRENT_WORK.md` is at a clean checkpoint after `TAR-P1-004`, `TAR-P1-005`, and `TAR-FE-001`. |
| Source task status | `TAR-P1-004`, `TAR-P1-005`, and `TAR-FE-001` are done in the tracker. |
| Execution constraint | Docker runtime validation is pending because Docker is unavailable locally. |
| Next engineering task after tracker | Implement audit log service and database table in `TAR-P1-006`. |

## Board Columns
### In Progress
| Issue | Epic | Reason |
| --- | --- | --- |
| `TAR-ARCH-01` | Platform Foundation | Foundation tasks are mostly complete, with Docker runtime validation still in review. |
| `TAR-ARCH-02` | Auth, RBAC, Tenancy | Identity schema, request context, auth APIs, tenant selection, and permission helpers are done; audit logging is next. |
| `TAR-ARCH-16` | Database and Data Contracts | Migration tooling and identity schema exist; shared data contracts still need broad module coverage. |
| `TAR-ARCH-17` | Frontend UI Architecture | Initial module routes now work; typed API client and role guards are next. |
| `TAR-ARCH-18` | Infrastructure, Security, Compliance | CI and local infra docs exist; Docker validation and compliance hardening remain. |
| `TAR-ARCH-20` | Implementation Backlog and Acceptance | Backlog exists and is now being expanded into Jira-style issue cards. |

### Review
| Issue | Epic | Reason |
| --- | --- | --- |
| `TAR-P0-006` | Platform Foundation | Docker Compose exists, but runtime validation is pending because Docker is unavailable locally. |

### Ready / Next Up
| Issue | Epic | First Backing Task |
| --- | --- | --- |
| `TAR-ARCH-03` | Patient and Visit Management | `TAR-P2-001` |
| `TAR-ARCH-04` | Reports and Imaging Pipeline | `TAR-P3-001` |
| `TAR-ARCH-11` | Workflow, Escalation, Notifications | `TAR-P4-001` |
| `TAR-ARCH-05` | Clinical Memory Engine | `TAR-P5-001` |
| `TAR-ARCH-08` | Risk and Prediction Engine | `TAR-P6-001` |
| `TAR-ARCH-09` | Doctor Command Center | `TAR-P7-001` |
| `TAR-ARCH-10` | Clinical Copilot | `TAR-P8-001` |

### Later
| Issue | Epic | Why Later |
| --- | --- | --- |
| `TAR-ARCH-06` | Digital Patient Twin | Depends on risk, patient memory, and intervention history. |
| `TAR-ARCH-07` | AI Agent Orchestration | Needs memory, risk, workflow, and copilot foundations. |
| `TAR-ARCH-12` | Billing Layer | Important for operations, but clinical workflow foundation comes first. |
| `TAR-ARCH-13` | Analytics Engine | Needs event-producing modules before metrics become meaningful. |
| `TAR-ARCH-14` | Executive Dashboard | Depends on analytics snapshots and governance filters. |
| `TAR-ARCH-15` | Population Intelligence | Depends on de-identified analytics and sufficient cohort size. |
| `TAR-ARCH-19` | MLOps and Learning Loop | Needs AI outputs, clinician feedback, and outcomes first. |

### Done
| Issue | Epic | Evidence |
| --- | --- | --- |
| `TAR-ARCH-00` | LLM Handoff Method | Architecture pack and local tracker method exist. |
| `TAR-TRACK-001` | Tracker Operations | Local tracker folder created. |
| `TAR-TRACK-002` | Tracker Operations | Initial implementation backlog created. |
| `TAR-FE-000` | Frontend UI Architecture | Sidebar navigation and initial module routes work in browser. |
| `TAR-FE-001` | Frontend UI Architecture | Typed API client exists with auth-aware request and error handling. |

## Epic Health Snapshot
| Epic | Status | Risk | Immediate Next Move |
| --- | --- | --- | --- |
| `TAR-EPIC-00` LLM Handoff Method | Done | Low | Keep issue templates current. |
| `TAR-EPIC-01` Platform Foundation | In Progress | Medium | Validate Docker when available. |
| `TAR-EPIC-02` Auth, RBAC, Tenancy | In Progress | High | Implement audit logs, seed roles, and isolation tests. |
| `TAR-EPIC-03` Patient and Visit Management | Ready | High | Create patient and visit tables. |
| `TAR-EPIC-04` Reports and Imaging Pipeline | Ready | High | Create upload and storage contracts. |
| `TAR-EPIC-05` Clinical Memory Engine | Ready | High | Create memory schema after report metadata exists. |
| `TAR-EPIC-06` Digital Patient Twin | Later | Medium | Wait for risk and intervention data. |
| `TAR-EPIC-07` AI Agent Orchestration | Later | High | Define agent output contracts after memory/risk. |
| `TAR-EPIC-08` Risk and Prediction Engine | Ready | High | Start rule-based scoring first. |
| `TAR-EPIC-09` Doctor Command Center | Ready | High | Build queue API after risk queue exists. |
| `TAR-EPIC-10` Clinical Copilot | Ready | High | Ground every response in retrieved context. |
| `TAR-EPIC-11` Workflow and Notifications | Ready | Medium | Build task state machine. |
| `TAR-EPIC-12` Billing Layer | Later | Medium | Add billing after visit workflow stabilizes. |
| `TAR-EPIC-13` Analytics Engine | Later | Medium | Add event writer before dashboards. |
| `TAR-EPIC-14` Executive Dashboard | Later | Medium | Use analytics snapshots only. |
| `TAR-EPIC-15` Population Intelligence | Later | High | Enforce de-identification and suppression. |
| `TAR-EPIC-16` Database and Data Contracts | In Progress | High | Standardize event, error, pagination, audit contracts. |
| `TAR-EPIC-17` Frontend UI Architecture | In Progress | Medium | Add role guards, auth screens, and tenant switching next. |
| `TAR-EPIC-18` Infra, Security, Compliance | In Progress | High | Add PHI-safe logging and rate limits. |
| `TAR-EPIC-19` MLOps and Learning Loop | Later | High | Capture model versions and feedback later. |
| `TAR-EPIC-20` Backlog and Acceptance | In Progress | Low | Keep issue cards synced with implementation. |

## Operating Rules
- Every implementation session should start by opening this board.
- Every active task should have a backing issue card in `issues/`.
- Update `CURRENT_WORK.md` before implementation starts and after verification finishes.
- Do not advance clinical AI tasks until tenancy, audit, source references, and clinician override paths exist.
- Treat all model outputs as assistive until clinical validation and governance are complete.
