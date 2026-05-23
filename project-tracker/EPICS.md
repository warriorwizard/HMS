# Tarini V6 Epics

Last updated: 2026-05-22

## Epic Format
Each epic maps one architecture module to implementation-ready work. The matching issue card lives in `issues/`.

## Epic List
| Epic | Status | Architecture Source | Issue Card | Primary Outcome |
| --- | --- | --- | --- | --- |
| `TAR-EPIC-00` LLM Handoff Method | Done | `00_INDEX_AND_LLM_METHOD.md` | `issues/TAR-ARCH-00-llm-method.md` | A repeatable method for handing work to LLM agents. |
| `TAR-EPIC-01` Platform Foundation | In Progress | `01_SYSTEM_ARCHITECTURE.md` | `issues/TAR-ARCH-01-system-architecture.md` | A secure, observable, modular product foundation. |
| `TAR-EPIC-02` Auth, RBAC, Tenancy | In Progress | `02_AUTH_RBAC_TENANCY.md` | `issues/TAR-ARCH-02-auth-rbac-tenancy.md` | Tenant-safe identity, permissions, sessions, and audit. |
| `TAR-EPIC-03` Patient and Visit Management | Ready | `03_PATIENT_VISIT_MANAGEMENT.md` | `issues/TAR-ARCH-03-patient-visit-management.md` | Longitudinal patient records and visit lifecycle. |
| `TAR-EPIC-04` Reports and Imaging Pipeline | Ready | `04_REPORTS_IMAGING_PIPELINE.md` | `issues/TAR-ARCH-04-reports-imaging-pipeline.md` | Secure upload, storage, parsing, and report lifecycle. |
| `TAR-EPIC-05` Clinical Memory Engine | Ready | `05_CLINICAL_MEMORY_ENGINE.md` | `issues/TAR-ARCH-05-clinical-memory-engine.md` | Source-backed patient memory and retrieval. |
| `TAR-EPIC-06` Digital Patient Twin | Later | `06_DIGITAL_PATIENT_TWIN.md` | `issues/TAR-ARCH-06-digital-patient-twin.md` | Dynamic patient profile with progression and intervention context. |
| `TAR-EPIC-07` AI Agent Orchestration | Later | `07_AI_AGENT_ORCHESTRATION.md` | `issues/TAR-ARCH-07-ai-agent-orchestration.md` | Coordinated, auditable AI agent workflows. |
| `TAR-EPIC-08` Risk and Prediction Engine | Ready | `08_RISK_PREDICTION_ENGINE.md` | `issues/TAR-ARCH-08-risk-prediction-engine.md` | Explainable risk scoring and priority queue inputs. |
| `TAR-EPIC-09` Doctor Command Center | Ready | `09_DOCTOR_COMMAND_CENTER.md` | `issues/TAR-ARCH-09-doctor-command-center.md` | Doctor queue, case workspace, decisions, and collaboration. |
| `TAR-EPIC-10` Clinical Copilot | Ready | `10_CLINICAL_COPILOT.md` | `issues/TAR-ARCH-10-clinical-copilot.md` | Retrieval-grounded assistance with citations and safety controls. |
| `TAR-EPIC-11` Workflow, Escalation, Notifications | Ready | `11_WORKFLOW_ESCALATION_NOTIFICATIONS.md` | `issues/TAR-ARCH-11-workflow-escalation-notifications.md` | Tasks, SLAs, transitions, escalation, and notifications. |
| `TAR-EPIC-12` Billing Layer | Later | `12_BILLING_LAYER.md` | `issues/TAR-ARCH-12-billing-layer.md` | Service catalog, invoices, payments, and billing workflow state. |
| `TAR-EPIC-13` Analytics Engine | Later | `13_ANALYTICS_ENGINE.md` | `issues/TAR-ARCH-13-analytics-engine.md` | Operational metrics, event pipeline, and dashboard APIs. |
| `TAR-EPIC-14` Executive Dashboard | Later | `14_EXECUTIVE_DASHBOARD.md` | `issues/TAR-ARCH-14-executive-dashboard.md` | Leadership view of risk, SLA, workload, AI, and business metrics. |
| `TAR-EPIC-15` Population Intelligence | Later | `15_POPULATION_INTELLIGENCE.md` | `issues/TAR-ARCH-15-population-intelligence.md` | Privacy-preserving cohort and regional trend intelligence. |
| `TAR-EPIC-16` Database and Data Contracts | In Progress | `16_DATABASE_AND_DATA_CONTRACTS.md` | `issues/TAR-ARCH-16-database-data-contracts.md` | Shared schema patterns, migrations, events, errors, and audit contracts. |
| `TAR-EPIC-17` Frontend UI Architecture | Later | `17_FRONTEND_UI_ARCHITECTURE.md` | `issues/TAR-ARCH-17-frontend-ui-architecture.md` | Role-aware, dense, clinical SaaS UI surfaces. |
| `TAR-EPIC-18` Infrastructure, Security, Compliance | In Progress | `18_INFRA_SECURITY_COMPLIANCE.md` | `issues/TAR-ARCH-18-infra-security-compliance.md` | Secure environments, observability, backup, incident, and compliance readiness. |
| `TAR-EPIC-19` MLOps and Learning Loop | Later | `19_MLOPS_LEARNING_LOOP.md` | `issues/TAR-ARCH-19-mlops-learning-loop.md` | Versioned models/prompts, feedback, outcomes, drift, and shadow evaluation. |
| `TAR-EPIC-20` Backlog and Acceptance | In Progress | `20_IMPLEMENTATION_BACKLOG_AND_ACCEPTANCE.md` | `issues/TAR-ARCH-20-implementation-backlog-acceptance.md` | Small, verifiable implementation packets with acceptance gates. |

## Cross-Epic Dependencies
| Dependency | Why It Matters |
| --- | --- |
| `TAR-EPIC-02` before all clinical modules | Clinical data access must be tenant-aware and permission-gated. |
| `TAR-EPIC-16` before broad module expansion | Shared contracts prevent inconsistent IDs, events, errors, and audit records. |
| `TAR-EPIC-03` before reports, memory, risk, billing | Patient and visit IDs anchor the rest of the product. |
| `TAR-EPIC-04` before clinical memory and copilot | Reports provide the source documents for retrieval and AI evidence. |
| `TAR-EPIC-05` before copilot and similar case retrieval | AI assistance must cite retrievable source context. |
| `TAR-EPIC-08` before command center priority queues | Doctors need explainable prioritization inputs. |
| `TAR-EPIC-11` before escalation-heavy workflows | Tasks, notifications, and SLA state need one workflow source of truth. |
| `TAR-EPIC-13` before dashboards and population intelligence | Dashboards should read curated metrics, not raw operational tables. |
| `TAR-EPIC-19` after AI feedback exists | Learning loops need real AI outputs, clinician feedback, and outcomes. |

## Definition Of Epic Ready
- Source architecture file has been read.
- Issue card exists in `issues/`.
- Backing tasks are linked to `BACKLOG.md`.
- Dependencies are explicit.
- Acceptance checks are testable.
- Data safety and tenant isolation requirements are included.

## Definition Of Epic Done
- All linked backlog tasks are `[Done]`.
- Database migrations and contracts are documented.
- APIs are tested for tenant isolation and permission behavior.
- UI workflows are verified where applicable.
- Audit logs exist for sensitive reads, writes, overrides, and AI actions.
- Failure cases are tested or explicitly deferred.
