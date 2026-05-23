# Tarini Cloud V4 Subproject Stories

Scope now: one Next.js frontend, one FastAPI backend, PostgreSQL, Redis optional, managed file storage, and modular services inside the app. No Docker, Kubernetes, or separate dev/staging/prod environments for this phase.

Effort scale: XS = 0.5 day, S = 1 day, M = 2-3 days, L = 4-6 days, XL = 7-10 days.

| Subproject | Story | Substory | Effort |
| --- | --- | --- | --- |
| SaaS Core | Tenant foundation | Tenant, branch, department tables | M |
| SaaS Core | Tenant foundation | Tenant-aware request context | M |
| SaaS Core | Tenant foundation | Tenant switch API | S |
| SaaS Core | Tenant foundation | Tenant settings screen | M |
| Auth & RBAC | Secure login | JWT login, refresh, logout | M |
| Auth & RBAC | Secure login | Current user and session API | S |
| Auth & RBAC | Permissions | Role and permission seed data | M |
| Auth & RBAC | Permissions | Permission guard helpers | M |
| Auth & RBAC | Permissions | Role-aware frontend navigation | M |
| Audit & Compliance | Audit trail | Audit log table and writer service | M |
| Audit & Compliance | Audit trail | Audit auth, tenant switch, report access | M |
| Audit & Compliance | Compliance basics | PHI-safe logging rules | S |
| Audit & Compliance | Compliance basics | Export/download audit events | M |
| Patient Management | Patient registry | Patient profile tables | M |
| Patient Management | Patient registry | Patient create/read/update API | M |
| Patient Management | Patient registry | Patient search API | M |
| Patient Management | Patient registry | Patient registration UI | M |
| Patient Management | Visit lifecycle | Visit table and status model | M |
| Patient Management | Visit lifecycle | Visit creation API | M |
| Patient Management | Timeline | Patient timeline event writer | M |
| Patient Management | Timeline | Patient timeline UI | L |
| Billing & Orders | Billing foundation | Service catalog and price list tables | M |
| Billing & Orders | Billing foundation | Order creation linked to visit | M |
| Billing & Orders | Billing foundation | Invoice and line item model | M |
| Billing & Orders | Payments | Payment status tracking | M |
| Billing & Orders | Payments | Discount and package support | M |
| Billing & Orders | Billing UI | Billing desk screen | L |
| Diagnostic Workflow | Workflow engine | Task and transition tables | M |
| Diagnostic Workflow | Workflow engine | State transition service | L |
| Diagnostic Workflow | Work queues | Technician queue API | M |
| Diagnostic Workflow | Work queues | Doctor review queue API | M |
| Diagnostic Workflow | Work queues | Staff worklist UI | L |
| Report Uploads | Upload foundation | Report/file metadata tables | M |
| Report Uploads | Upload foundation | Object storage abstraction | M |
| Report Uploads | Upload foundation | Secure upload API | L |
| Report Uploads | Processing | Processing job status model | M |
| Report Uploads | Processing | PDF/text extraction placeholder | M |
| Report Uploads | UI | Technician upload screen | L |
| Report Uploads | UI | Report viewer screen | L |
| LIMS Workflow | Sample workflow | Sample collection table | M |
| LIMS Workflow | Sample workflow | Barcode/accession number generation | M |
| LIMS Workflow | Sample workflow | Sample status tracking API | M |
| LIMS Workflow | Verification | Result entry and verification workflow | L |
| LIMS Workflow | Verification | Lab technician workbench UI | L |
| RIS Workflow | Imaging orders | Imaging order table | M |
| RIS Workflow | Imaging orders | Modality, body part, clinical indication fields | S |
| RIS Workflow | Radiology workflow | Study status tracking | M |
| RIS Workflow | Radiology workflow | Radiologist assignment | M |
| PACS / DICOM Lite | DICOM metadata | DICOM metadata table | M |
| PACS / DICOM Lite | DICOM metadata | Study/series/image hierarchy model | L |
| PACS / DICOM Lite | Viewer route | Basic DICOM viewer route integration | L |
| PACS / DICOM Lite | Storage | DICOM file upload and signed access | L |
| AI Intelligence | AI analysis foundation | AI result and risk score tables | M |
| AI Intelligence | AI analysis foundation | AI task submission API | M |
| AI Intelligence | Report intelligence | Report summarization endpoint | M |
| AI Intelligence | Report intelligence | Finding extraction endpoint | L |
| AI Intelligence | Risk engine | Rule-based risk scoring | L |
| AI Intelligence | Explainability | Source-backed explanation payload | M |
| Doctor Command Center | Priority queue | Priority queue table | M |
| Doctor Command Center | Priority queue | Queue API with filters | L |
| Doctor Command Center | Review workflow | Doctor review action API | M |
| Doctor Command Center | Review workflow | Recommendation and approval flow | L |
| Doctor Command Center | UI | Doctor command center screen | XL |
| Clinical Copilot | Copilot foundation | Conversation and message tables | M |
| Clinical Copilot | Copilot foundation | Patient/report context retrieval | L |
| Clinical Copilot | Doctor assistance | Progression summary response | M |
| Clinical Copilot | Doctor assistance | Note draft generation | M |
| Clinical Copilot | UI | Copilot side panel | L |
| Notifications | In-app notifications | Notification table and API | M |
| Notifications | In-app notifications | User notification center | M |
| Notifications | Patient sharing | OTP-secured report sharing | L |
| Notifications | Patient sharing | SMS/email provider adapter | M |
| Analytics | Event foundation | Analytics event table | M |
| Analytics | Operational analytics | TAT metrics API | M |
| Analytics | Operational analytics | Workflow bottleneck dashboard | L |
| Analytics | Revenue analytics | Revenue summary API | M |
| Analytics | AI analytics | AI usage and AI-vs-doctor metrics | L |
| Analytics | Executive dashboard | Admin analytics dashboard | XL |
| B2B Management | Partner foundation | B2B partner table and pricing rules | M |
| B2B Management | Orders | B2B order placement API | L |
| B2B Management | Tracking | Partner report tracking screen | L |
| B2B Management | Billing | Partner billing summary | M |
| CRM & Marketing | CRM foundation | Lead/contact table | M |
| CRM & Marketing | Campaign basics | Campaign list and status tracking | M |
| CRM & Marketing | Patient engagement | Follow-up reminders | M |
| CRM & Marketing | Dashboard | Basic CRM dashboard | L |
| Admin Console | Super admin | Tenant management screen | L |
| Admin Console | Hospital admin | User and role management screen | L |
| Admin Console | Operations | Staff performance view | L |
| Admin Console | Configuration | Service, price, department, modality settings | L |
| Shared Frontend | Design system | App shell and sidebar | M |
| Shared Frontend | Design system | Tables, filters, badges, status chips | L |
| Shared Frontend | Design system | Forms, empty states, errors, loading states | L |
| Shared Frontend | API integration | Typed API client | M |
| Shared Backend | API foundation | Standard response/error contracts | M |
| Shared Backend | API foundation | Pagination and filtering helpers | M |
| Shared Backend | Data foundation | SQLAlchemy model conventions | M |
| Shared Backend | Testing | Backend smoke and contract tests | M |

## Later Only

| Subproject | Story | Substory | Effort |
| --- | --- | --- | --- |
| Infrastructure | Containerization | Docker packaging | Later |
| Infrastructure | Orchestration | Kubernetes deployment | Later |
| Infrastructure | Environments | Separate dev/staging/prod setup | Later |
| Telemedicine | Remote care | Video consultation workflow | Later |
| IoT / Remote Monitoring | Device data | Device ingestion pipeline | Later |
| Population Intelligence | Cross-center intelligence | De-identified cohort analytics | Later |
| Predictive AI | Model learning | Feedback learning pipeline | Later |
