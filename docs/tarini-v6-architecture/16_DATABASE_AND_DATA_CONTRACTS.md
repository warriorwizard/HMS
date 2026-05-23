# Database and Data Contracts Architecture

## Product Purpose
This file defines the data architecture principles, key tables, relationships, indexing strategy, and service data contracts for Tarini V6.

The database must support clinical traceability, tenant isolation, analytics, and AI auditability from the beginning.

## Database Principles
- PostgreSQL is the primary source of truth.
- Every tenant-owned table includes `tenant_id`.
- Every sensitive table has `created_at` and `updated_at`.
- Avoid hard deletes for clinical records; use status and archival.
- Store raw AI inputs/outputs carefully with retention controls.
- Use stable IDs.
- Use migrations for every schema change.
- Use explicit foreign keys where feasible.
- Add composite indexes for tenant-scoped access patterns.

## ID Strategy
Use UUIDs or prefixed IDs.

Examples:
- `ten_...`
- `usr_...`
- `pat_...`
- `vis_...`
- `rep_...`
- `task_...`
- `ai_...`

Prefixed IDs help logs and UI debugging, but UUID database columns are also acceptable if consistent.

## Core Tables
Foundation:
- `tenants`
- `tenant_sites`
- `departments`
- `users`
- `memberships`
- `roles`
- `permissions`
- `role_permissions`
- `user_sessions`
- `audit_logs`

Clinical workflow:
- `patients`
- `patient_identifiers`
- `patient_consents`
- `visits`
- `patient_timeline_events`
- `reports`
- `report_files`
- `report_metadata`
- `report_processing_jobs`

AI:
- `ai_tasks`
- `ai_agent_runs`
- `ai_memory_items`
- `ai_memory_embeddings`
- `memory_retrieval_logs`
- `risk_assessments`
- `risk_factors`
- `patient_twins`
- `patient_twin_snapshots`

Operations:
- `workflow_instances`
- `workflow_tasks`
- `workflow_transitions`
- `notifications`
- `case_reviews`
- `case_comments`
- `case_escalations`

Billing:
- `service_catalog_items`
- `invoices`
- `invoice_line_items`
- `payments`
- `billing_adjustments`

Analytics:
- `analytics_events`
- `metric_snapshots`
- `executive_alerts`
- `population_cohorts`
- `population_metric_snapshots`

## Tenant Indexing Pattern
Common indexes:
- `(tenant_id, id)`
- `(tenant_id, created_at)`
- `(tenant_id, patient_id)`
- `(tenant_id, visit_id)`
- `(tenant_id, status)`
- `(tenant_id, assigned_doctor_id, status)`
- `(tenant_id, event_type, event_time)`

For queue:
- `(tenant_id, assigned_doctor_id, queue_status, priority_score)`
- `(tenant_id, priority_band, sla_due_at)`

For reports:
- `(tenant_id, patient_id, created_at)`
- `(tenant_id, visit_id, status)`
- `(tenant_id, checksum)`

For memory:
- Vector index on embedding.
- Metadata filter index on `(tenant_id, patient_id, memory_type)`.

## Data Contract: Event Envelope
All events should follow:
```json
{
  "event_id": "evt_...",
  "event_type": "report.uploaded",
  "tenant_id": "ten_...",
  "site_id": "site_...",
  "actor_id": "usr_...",
  "resource_type": "report",
  "resource_id": "rep_...",
  "occurred_at": "2026-05-22T10:00:00Z",
  "correlation_id": "corr_...",
  "properties": {}
}
```

## Data Contract: API Error
```json
{
  "error": {
    "code": "permission_denied",
    "message": "You do not have permission to access this resource.",
    "request_id": "req_...",
    "details": {}
  }
}
```

## Data Contract: Paginated Response
```json
{
  "items": [],
  "page": {
    "limit": 25,
    "offset": 0,
    "total": 100
  }
}
```

## Data Contract: Audit Event
```json
{
  "tenant_id": "ten_...",
  "actor_id": "usr_...",
  "action": "report.viewed",
  "resource_type": "report",
  "resource_id": "rep_...",
  "metadata": {},
  "created_at": "2026-05-22T10:00:00Z"
}
```

## Data Quality Fields
For clinical records where useful:
- `data_quality_score`
- `missing_fields`
- `confidence`
- `source_system`
- `source_version`
- `last_verified_at`

## Migration Strategy
- Use sequential migrations.
- Never edit old applied migrations.
- Backfill in separate migrations or jobs.
- Add nullable column first, backfill, then enforce not-null if needed.
- Create indexes concurrently in production where supported.

## Retention and Deletion
Healthcare records should not be physically deleted in normal flows.

Use:
- `status`
- `archived_at`
- `deleted_at` only for soft delete where legal.
- `retention_policy_id`

Audit logs should be immutable.

## Implementation Tasks
- Establish migration tooling.
- Create foundation schema first.
- Add tenant ID to all tenant-owned tables.
- Add repository helpers that require tenant context.
- Add database tests for cross-tenant isolation.
- Add seed data for local demo.

## Acceptance Criteria
- All tenant-owned tables have tenant ID.
- Core indexes support common queries.
- Audit events use consistent schema.
- API errors are consistent.
- Migrations can recreate database from scratch.

## LLM Implementation Notes
Give this file to every LLM coding agent that modifies backend models. It is the contract that prevents accidental one-off schemas.

