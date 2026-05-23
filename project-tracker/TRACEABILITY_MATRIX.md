# Tarini V6 Architecture Traceability Matrix

Last updated: 2026-05-22

## Purpose
This matrix links every architecture file to its Jira-style issue card, implementation backlog area, and gap queue coverage. Use it to avoid losing architecture requirements during implementation.

| Architecture File | Issue Card | Epic | Primary Backlog Area | Gap Queue Coverage | Current Status |
| --- | --- | --- | --- | --- | --- |
| `00_INDEX_AND_LLM_METHOD.md` | `TAR-ARCH-00` | LLM Handoff Method | Tracker Setup | `TAR-TRACK-003`, `TAR-TRACK-004`, `TAR-TRACK-005` | Done / Expanding |
| `01_SYSTEM_ARCHITECTURE.md` | `TAR-ARCH-01` | Platform Foundation | Phase 0 | `TAR-P0-011` to `TAR-P0-018` | In Progress |
| `02_AUTH_RBAC_TENANCY.md` | `TAR-ARCH-02` | Auth, RBAC, Tenancy | Phase 1 | `TAR-P1-013` to `TAR-P1-017` | In Progress |
| `03_PATIENT_VISIT_MANAGEMENT.md` | `TAR-ARCH-03` | Patient and Visit Management | Phase 2 | `TAR-P2-013` to `TAR-P2-016` | Ready |
| `04_REPORTS_IMAGING_PIPELINE.md` | `TAR-ARCH-04` | Reports and Imaging Pipeline | Phase 3 | `TAR-P3-012` to `TAR-P3-017` | Ready |
| `05_CLINICAL_MEMORY_ENGINE.md` | `TAR-ARCH-05` | Clinical Memory Engine | Phase 5 | `TAR-P5-010` to `TAR-P5-014` | Ready |
| `06_DIGITAL_PATIENT_TWIN.md` | `TAR-ARCH-06` | Digital Patient Twin | Phase 9 | `TAR-P9-008` to `TAR-P9-011` | Later |
| `07_AI_AGENT_ORCHESTRATION.md` | `TAR-ARCH-07` | AI Agent Orchestration | AI Gap Queue | `TAR-AI-001` to `TAR-AI-005` | Later |
| `08_RISK_PREDICTION_ENGINE.md` | `TAR-ARCH-08` | Risk and Prediction Engine | Phase 6 | `TAR-P6-009` to `TAR-P6-013` | Ready |
| `09_DOCTOR_COMMAND_CENTER.md` | `TAR-ARCH-09` | Doctor Command Center | Phase 7 | `TAR-P7-011` to `TAR-P7-015` | Ready |
| `10_CLINICAL_COPILOT.md` | `TAR-ARCH-10` | Clinical Copilot | Phase 8 | `TAR-P8-011` to `TAR-P8-015` | Ready |
| `11_WORKFLOW_ESCALATION_NOTIFICATIONS.md` | `TAR-ARCH-11` | Workflow and Notifications | Phase 4 | `TAR-P4-010` to `TAR-P4-014` | Ready |
| `12_BILLING_LAYER.md` | `TAR-ARCH-12` | Billing Layer | Phase 10 | `TAR-P10-009` to `TAR-P10-013` | Later |
| `13_ANALYTICS_ENGINE.md` | `TAR-ARCH-13` | Analytics Engine | Phase 11 | `TAR-P11-011` to `TAR-P11-015` | Later |
| `14_EXECUTIVE_DASHBOARD.md` | `TAR-ARCH-14` | Executive Dashboard | Phase 11 | `TAR-P11-016` to `TAR-P11-020` | Later |
| `15_POPULATION_INTELLIGENCE.md` | `TAR-ARCH-15` | Population Intelligence | Phase 12 | `TAR-P12-008` to `TAR-P12-012` | Later |
| `16_DATABASE_AND_DATA_CONTRACTS.md` | `TAR-ARCH-16` | Database and Data Contracts | Phase 0 / Phase 1 | `TAR-P0-015` to `TAR-P0-018` | In Progress |
| `17_FRONTEND_UI_ARCHITECTURE.md` | `TAR-ARCH-17` | Frontend UI Architecture | Frontend Platform | `TAR-FE-001` to `TAR-FE-005` | In Progress |
| `18_INFRA_SECURITY_COMPLIANCE.md` | `TAR-ARCH-18` | Infra, Security, Compliance | Phase 14 | `TAR-P14-009` to `TAR-P14-013` | In Progress |
| `19_MLOPS_LEARNING_LOOP.md` | `TAR-ARCH-19` | MLOps and Learning Loop | Phase 13 | `TAR-P13-009` to `TAR-P13-013` | Later |
| `20_IMPLEMENTATION_BACKLOG_AND_ACCEPTANCE.md` | `TAR-ARCH-20` | Backlog and Acceptance | All Phases | Tracker, CI, verification, acceptance gates | In Progress |

## Traceability Rule
Any implementation task must reference at least one architecture file or issue card before work starts. If it does not map cleanly, create or update a gap queue issue first.

