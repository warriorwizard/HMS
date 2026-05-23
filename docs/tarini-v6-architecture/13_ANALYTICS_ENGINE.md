# Analytics Engine Architecture

## Product Purpose
The Analytics Engine converts clinical workflow events, operational activity, billing data, AI outputs, and outcomes into measurable performance intelligence.

This module serves hospital admins, operations teams, product leaders, and future model governance.

## Users
- Hospital Admin: monitors operations and performance.
- Super Admin: monitors platform-wide health.
- Doctor Lead: monitors clinical review performance.
- Operations Manager: identifies bottlenecks.
- AI Governance Lead: monitors model usage and safety signals.

## In Scope
- Operational metrics.
- SLA analytics.
- Doctor review analytics.
- Upload and processing analytics.
- Billing analytics.
- AI usage and safety analytics.
- Follow-up analytics.
- Tenant and site dashboards.

## Out of Scope for MVP
- Fully custom BI builder.
- Complex forecasting beyond initial workload estimate.
- Cross-tenant benchmarking without explicit de-identification.

## Metric Domains
Operational:
- Total visits.
- Active visits.
- Average turnaround time.
- Upload delay.
- Processing delay.
- Doctor review delay.
- SLA breach rate.
- Queue backlog.

Clinical workflow:
- High-risk case count.
- Critical case review time.
- Follow-up required rate.
- Follow-up completion rate.
- Escalation rate.

AI:
- AI tasks requested.
- AI task success/failure rate.
- Average AI latency.
- Safety flag count.
- Doctor override rate.
- Copilot feedback rate.

Billing:
- Invoice count.
- Paid amount.
- Outstanding balance.
- Discounts.
- Voids.
- Partner credit exposure.

## Data Strategy
Use event-driven analytics:
- Capture domain events.
- Write raw event table.
- Build materialized metric tables.
- Refresh dashboards from aggregated tables.

MVP can compute analytics directly from transactional tables if volume is low, but event capture should exist from the beginning.

## Core Entities
`analytics_events`:
- `id`
- `tenant_id`
- `site_id`
- `event_type`
- `resource_type`
- `resource_id`
- `actor_id`
- `event_time`
- `properties`
- `created_at`

`metric_snapshots`:
- `id`
- `tenant_id`
- `site_id`
- `metric_name`
- `metric_value`
- `dimensions`
- `period_start`
- `period_end`
- `created_at`

`dashboard_saved_views`:
- `id`
- `tenant_id`
- `user_id`
- `dashboard_type`
- `filters`
- `created_at`

## Analytics Pipeline
1. Domain service emits event.
2. Event is stored in analytics events table.
3. Aggregation worker processes events on schedule.
4. Metric snapshots are updated.
5. Dashboard APIs read snapshots.
6. Drill-down APIs read transactional records with permission checks.

## API Endpoints
- `GET /analytics/overview`
- `GET /analytics/operations`
- `GET /analytics/sla`
- `GET /analytics/ai`
- `GET /analytics/billing`
- `GET /analytics/followups`
- `GET /analytics/doctors`
- `POST /analytics/saved-views`
- `GET /analytics/export`

## Events Consumed
- Patient and visit events.
- Report processing events.
- Workflow task events.
- Risk events.
- Doctor review events.
- Copilot events.
- Billing events.
- Notification events.
- Follow-up events.

## Dashboard Filters
Common filters:
- Date range.
- Tenant.
- Site.
- Department.
- Doctor.
- Report type.
- Risk band.
- Workflow status.
- Billing status.

## Permissions
- `analytics.read_ops`: Hospital Admin, Operations Manager.
- `analytics.read_clinical`: Doctor Lead, Hospital Admin.
- `analytics.read_billing`: Billing Admin, Hospital Admin.
- `analytics.read_ai`: AI Governance Lead, Hospital Admin.
- `analytics.export`: restricted admin role.

## UI Requirements
Analytics pages should be operational, not decorative.

Required components:
- KPI cards.
- Trend charts.
- Distribution charts.
- Funnel views.
- Queue aging table.
- SLA breach table.
- Drill-down panels.
- Export action with audit.

## Data Privacy
Analytics should default to aggregate data.

Rules:
- Do not expose patient-level drill-down unless role allows patient access.
- Cross-tenant analytics must be de-identified.
- Small cohort suppression should be used for population analytics later.
- Export actions must be audited.

## Failure and Edge Cases
- Missing events: reconciliation job compares transactional data.
- Late events: aggregation handles backfill.
- Tenant timezone: period boundaries use tenant timezone.
- Deleted or archived records: analytics retains allowed historical counts without exposing PHI.

## Implementation Tasks
- Create analytics event table.
- Create event writer utility.
- Implement aggregation jobs.
- Build overview API.
- Build dashboard UI.
- Add export audit.
- Add tests for permissions and metric calculations.

## Acceptance Criteria
- Admin can see operational overview.
- SLA breach rate is computed correctly.
- AI usage and failure metrics are visible.
- Analytics respects tenant and role access.
- Export is permission-gated and audited.

## LLM Implementation Notes
Tell implementation agents to start with a small metric set and event capture. Dashboards can evolve, but missing event history is hard to recover later.

