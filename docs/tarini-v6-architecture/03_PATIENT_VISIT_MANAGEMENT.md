# Patient and Visit Management Architecture

## Product Purpose
Patient and Visit Management is the clinical workflow entry point. It captures who the patient is, why they came, what visit is active, which reports belong to the visit, who is responsible, and what follow-up is expected.

This module must be reliable, simple for staff, and strict about identity matching because downstream AI quality depends on clean patient context.

## Users
- Staff: register patient, create visit, update demographics.
- Technician: attach reports/images to visits.
- Doctor: review patient timeline and visit context.
- Hospital Admin: manage patient data policies and duplicate merges.
- Patient: view approved profile and visits.
- B2B Partner: create or track referred patients if enabled.

## In Scope
- Patient registration.
- Patient search and identity matching.
- Visit creation and status lifecycle.
- Demographic and contact management.
- Consent capture.
- Clinical history summary fields.
- Patient timeline.
- Duplicate detection and merge workflow.
- Follow-up shell creation.

## Out of Scope for MVP
- Full EMR replacement.
- Complete medication reconciliation.
- National health ID integrations unless required by pilot.
- Complex insurance adjudication.
- Patient portal messaging beyond basics.

## Core Entities
`patients`:
- `id`
- `tenant_id`
- `site_id`
- `external_patient_id`
- `first_name`
- `last_name`
- `date_of_birth`
- `sex_at_birth`
- `gender_identity`
- `phone`
- `email`
- `address`
- `emergency_contact`
- `identity_hash`
- `status`
- `created_at`
- `updated_at`

`patient_identifiers`:
- `id`
- `tenant_id`
- `patient_id`
- `identifier_type`
- `identifier_value_hash`
- `display_value_masked`
- `issuer`
- `verified_at`

`visits`:
- `id`
- `tenant_id`
- `patient_id`
- `site_id`
- `department_id`
- `visit_type`
- `reason`
- `status`
- `priority`
- `assigned_doctor_id`
- `created_by`
- `started_at`
- `closed_at`

`patient_consents`:
- `id`
- `tenant_id`
- `patient_id`
- `consent_type`
- `status`
- `captured_by`
- `captured_at`
- `expires_at`
- `source_document_id`

`patient_timeline_events`:
- `id`
- `tenant_id`
- `patient_id`
- `visit_id`
- `event_type`
- `event_title`
- `event_summary`
- `source_type`
- `source_id`
- `created_at`

## Visit Status Lifecycle
Recommended statuses:
- `draft`
- `registered`
- `checked_in`
- `awaiting_billing`
- `awaiting_upload`
- `processing`
- `ready_for_review`
- `under_review`
- `doctor_action_required`
- `followup_required`
- `closed`
- `cancelled`

Status transition rules:
- `draft` to `registered`: minimum demographic fields present.
- `registered` to `checked_in`: visit confirmed.
- `checked_in` to `awaiting_billing`: billing required.
- `awaiting_billing` to `awaiting_upload`: payment or approved credit.
- `awaiting_upload` to `processing`: report/image uploaded.
- `processing` to `ready_for_review`: AI or metadata processing complete.
- `ready_for_review` to `under_review`: doctor opens case.
- `under_review` to `followup_required`: doctor requests follow-up.
- `under_review` to `closed`: doctor completes review.

## Patient Registration Workflow
1. Staff enters demographics and contact details.
2. System searches existing patients using exact and fuzzy matching.
3. If high-confidence match exists, staff chooses existing patient.
4. If possible duplicates exist, staff confirms or creates new record.
5. Consent is captured if needed.
6. Visit is created.
7. Timeline records `patient.registered` and `visit.created`.

## Identity Matching
Use a conservative matching strategy:
- Exact phone plus date of birth.
- Exact external ID.
- Exact government or hospital ID hash.
- Fuzzy name plus date of birth plus phone.

Never auto-merge patients. Suggest potential duplicate and require human confirmation.

## API Endpoints
- `POST /patients`
- `GET /patients`
- `GET /patients/{patient_id}`
- `PATCH /patients/{patient_id}`
- `GET /patients/search`
- `GET /patients/{patient_id}/timeline`
- `POST /patients/{patient_id}/consents`
- `POST /patients/{patient_id}/visits`
- `GET /visits`
- `GET /visits/{visit_id}`
- `PATCH /visits/{visit_id}`
- `POST /patients/duplicate-check`
- `POST /patients/merge-requests`

## Events
- `patient.created`
- `patient.updated`
- `patient.duplicate_suspected`
- `patient.merge_requested`
- `patient.consent_captured`
- `visit.created`
- `visit.status_changed`
- `visit.assigned`
- `visit.closed`

## Permissions
- `patient.create`: Staff, Hospital Admin.
- `patient.read`: Doctor, Staff, Technician, Hospital Admin with tenant rules.
- `patient.update`: Staff, Hospital Admin.
- `patient.merge`: Hospital Admin or authorized data steward.
- `visit.create`: Staff, B2B Partner if enabled.
- `visit.assign`: Hospital Admin, Doctor lead.
- `visit.close`: Doctor, authorized Staff for non-clinical visits.

## UI Requirements
Primary screens:
- Patient search.
- Patient registration.
- Patient profile.
- Patient timeline.
- Visit details.
- Duplicate warning modal.
- Consent capture panel.

UX priorities:
- Fast search.
- Minimal required fields at front desk.
- Clear duplicate warnings.
- Visible visit state.
- Timeline that combines reports, AI analysis, doctor actions, billing, and follow-ups.

## Data Quality Rules
Required fields for MVP:
- Name.
- Phone or external ID.
- Age/date of birth or approximate age.
- Sex at birth if clinically relevant for interpretation.

Validation:
- Phone format normalized.
- Email normalized.
- Date of birth cannot be future.
- Duplicate search runs before create.
- Missing critical fields produce data quality warnings, not silent failure.

## Failure and Edge Cases
- Patient has no phone: allow external ID or alternate contact.
- Patient age unknown: allow estimated age with flag.
- Duplicate found after creation: create merge request.
- Visit created under wrong patient: allow correction with audit trail.
- Patient revokes consent: block AI processing that depends on consent policy.

## Implementation Tasks
- Create patient and visit database migrations.
- Build tenant-scoped patient repository.
- Implement duplicate-check service.
- Implement visit state machine.
- Add timeline event writer.
- Add registration and profile screens.
- Add API tests for tenant isolation and duplicate matching.

## Acceptance Criteria
- Staff can register patient and create visit in under one minute for basic case.
- Duplicate detection warns before likely duplicate creation.
- Doctor can view patient timeline for a visit.
- Every patient update is audited.
- Patient records are tenant-isolated.
- Visit state transitions reject invalid moves.

## LLM Implementation Notes
Give implementation LLMs this file with Auth/RBAC architecture. Patient APIs must never be built without tenant-scoped repositories and audit logging.

