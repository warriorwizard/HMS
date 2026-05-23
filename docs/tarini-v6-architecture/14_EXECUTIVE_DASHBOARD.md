# Executive Dashboard Architecture

## Product Purpose
The Executive Dashboard gives leadership a high-level intelligence cockpit across sites, departments, workflow efficiency, risk load, revenue indicators, follow-up reliability, and AI impact.

It should answer: where are we overloaded, where are patients at risk of delay, where is performance improving, and where should leadership intervene?

## Users
- Hospital CEO/Director.
- Diagnostic chain leadership.
- Hospital Admin.
- Operations Head.
- Clinical Head.
- Super Admin for platform-level demo and support.

## In Scope
- Multi-site KPI overview.
- Risk distribution.
- Turnaround time trends.
- Doctor review efficiency.
- Follow-up completion.
- Revenue summary.
- AI impact summary.
- Bottleneck detection.
- Executive alerts.

## Out of Scope for MVP
- Financial accounting replacement.
- Board-grade regulatory reporting.
- Unvalidated clinical outcome claims.
- Cross-tenant comparison without consent and de-identification.

## Executive Metrics
Top-level:
- Total visits.
- Active cases.
- Critical cases pending.
- Average turnaround time.
- SLA breach rate.
- Follow-up completion rate.
- Revenue collected.
- Outstanding balance.
- AI-assisted review rate.

Operational:
- Upload delay by site.
- Processing delay by modality.
- Doctor queue backlog.
- Escalation count.
- Staff workload.

Clinical intelligence:
- Risk band distribution.
- Critical case review time.
- Outcome capture completeness.
- Doctor override rate.

AI impact:
- Copilot usage.
- Time saved estimate where measured.
- AI failure rate.
- Safety flag rate.
- Clinician feedback score.

## Core Entities
This dashboard should mainly read from Analytics Engine. Additional saved executive config:

`executive_dashboard_configs`:
- `id`
- `tenant_id`
- `user_id`
- `default_site_ids`
- `default_date_range`
- `visible_widgets`
- `created_at`

`executive_alerts`:
- `id`
- `tenant_id`
- `site_id`
- `alert_type`
- `severity`
- `title`
- `description`
- `metric_name`
- `metric_value`
- `status`
- `created_at`
- `resolved_at`

## API Endpoints
- `GET /executive/overview`
- `GET /executive/sites`
- `GET /executive/risk`
- `GET /executive/operations`
- `GET /executive/revenue`
- `GET /executive/ai-impact`
- `GET /executive/alerts`
- `PATCH /executive/alerts/{alert_id}`
- `GET /executive/export`

## Dashboard Layout
Recommended layout:
- Top band: key metrics and active executive alerts.
- Middle: site comparison and risk distribution.
- Lower: bottlenecks, revenue, AI impact, follow-up performance.
- Drill-down: click metric to open filtered analytics view.

Avoid marketing-style hero layouts. This is a work dashboard.

## Executive Alerts
Examples:
- Critical case review SLA breached.
- Site backlog above threshold.
- Upload processing failure spike.
- Follow-up completion dropped below target.
- AI safety flag rate increased.
- Revenue outstanding above threshold.

Alert severity:
- `info`
- `warning`
- `high`
- `critical`

## Permissions
- `executive_dashboard.read`: Hospital Admin, Executive role.
- `executive_dashboard.export`: restricted Executive or Admin.
- `executive_alert.resolve`: Executive, Hospital Admin.
- Patient-level drill-down requires separate patient access permission.

## Data Privacy
Executive dashboard should show aggregate data by default.

Patient details should not appear directly in executive widgets. If drill-down opens patient-level data, enforce role and audit access.

## Failure and Edge Cases
- Metric delayed: show last updated time.
- Site missing data: show data completeness warning.
- Small patient cohort: suppress or aggregate.
- AI impact uncertain: show measured usage, not inflated claims.

## Implementation Tasks
- Build executive metric queries from Analytics Engine.
- Create dashboard config table.
- Create executive alert model.
- Build executive overview page.
- Add site comparison views.
- Add export with audit.
- Add tests for aggregate-only access.

## Acceptance Criteria
- Executive user can see multi-site overview.
- Alerts identify operational risks.
- Dashboard shows last updated time.
- Patient details are hidden unless explicitly drilled down with permission.
- AI impact metrics are grounded in measured events.

## LLM Implementation Notes
Tell LLM agents that this is a leadership cockpit, not a landing page. Prioritize clear metrics, comparison, trend, and intervention cues.

