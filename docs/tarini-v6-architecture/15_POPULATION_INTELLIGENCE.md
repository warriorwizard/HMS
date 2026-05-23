# Population Intelligence Architecture

## Product Purpose
Population Intelligence identifies patterns across groups, sites, regions, demographics, report types, risk clusters, screening effectiveness, and outcomes.

This module is powerful but sensitive. It must be de-identified, cohort-safe, and honest about limitations.

## Users
- Healthcare chain leadership.
- Clinical governance team.
- Population health analyst.
- Operations team.
- Super Admin for platform-level aggregate monitoring if contract permits.

## In Scope
- Cohort analytics.
- Cross-center trends.
- Regional risk clusters.
- Screening effectiveness indicators.
- Demographic insights.
- Follow-up adherence patterns.
- Outcome distribution.

## Out of Scope for MVP
- Public health claims without validation.
- Individual patient targeting from population trends without clinical review.
- Selling or sharing identifiable data.
- Cross-tenant benchmarking without legal and contractual approval.

## Data Principles
Population Intelligence must use:
- De-identification.
- Aggregation.
- Small cohort suppression.
- Tenant and contract-aware boundaries.
- Audit logs for exports and sensitive queries.

Small cohort suppression:
- Do not show cohorts below configured threshold, for example fewer than 10 patients.
- Suppress or merge dimensions that could re-identify patients.

## Core Entities
`population_cohorts`:
- `id`
- `tenant_id`
- `name`
- `definition`
- `created_by`
- `created_at`

`population_metric_snapshots`:
- `id`
- `tenant_id`
- `cohort_id`
- `metric_name`
- `metric_value`
- `dimensions`
- `period_start`
- `period_end`
- `suppression_applied`
- `created_at`

`risk_clusters`:
- `id`
- `tenant_id`
- `cluster_type`
- `region`
- `site_id`
- `risk_signal`
- `severity`
- `cohort_size`
- `evidence`
- `created_at`

## Cohort Dimensions
Possible dimensions:
- Age band.
- Sex at birth where relevant.
- Region.
- Site.
- Department.
- Report type.
- Modality.
- Risk band.
- Time period.
- Follow-up status.
- Outcome category.

Avoid overly granular combinations that re-identify patients.

## Metrics
Screening:
- Screening volume.
- Positive/abnormal rate.
- Follow-up completion after abnormal result.
- Time to doctor review.

Risk:
- High-risk case rate.
- Critical case trend.
- Risk band migration.
- Repeat high-risk patients.

Operations:
- Center-level turnaround time.
- Processing delay by site.
- Missed follow-up clusters.

Outcomes:
- Outcome capture completeness.
- Intervention completion rate.
- Readmission or return-visit proxy if available.

## API Endpoints
- `GET /population/overview`
- `POST /population/cohorts`
- `GET /population/cohorts`
- `GET /population/cohorts/{cohort_id}`
- `GET /population/metrics`
- `GET /population/risk-clusters`
- `GET /population/screening-effectiveness`
- `GET /population/export`

## Events Consumed
- `visit.created`
- `report.parsed`
- `risk.assessment_completed`
- `followup.created`
- `followup.completed`
- `followup.missed`
- `outcome.recorded`
- `doctor.review_completed`

## UI Requirements
Screens:
- Population overview.
- Cohort builder.
- Regional or site cluster view.
- Screening effectiveness view.
- Follow-up adherence view.

UX rules:
- Show cohort size.
- Show suppression warnings.
- Show confidence/limitations.
- Avoid patient-level lists by default.

## Risk Cluster Detection
Initial MVP cluster detection can be simple:
- Compare current period risk rate against previous baseline.
- Flag site or region when increase exceeds threshold.
- Require minimum cohort size.
- Label as signal, not diagnosis or outbreak.

Future:
- Statistical anomaly detection.
- Spatial clustering.
- Demographic adjustment.
- External public health data integration.

## Permissions
- `population.read`: Hospital Admin, Clinical Governance.
- `population.create_cohort`: Analyst, Hospital Admin.
- `population.export`: restricted and audited.
- Cross-tenant access requires Super Admin plus contract policy.

## Failure and Edge Cases
- Cohort too small: suppress results.
- Missing demographics: show unknown bucket.
- Incomplete outcomes: show data completeness.
- Regional cluster from poor data quality: include data quality score.
- User attempts patient-level export: block unless separate permission and policy.

## Implementation Tasks
- Define de-identified aggregate tables.
- Implement cohort definition schema.
- Implement small cohort suppression.
- Build population metrics APIs.
- Build risk cluster job.
- Build population intelligence UI.
- Add tests for suppression and permissions.

## Acceptance Criteria
- Admin can view cohort-level trends.
- Small cohorts are suppressed.
- Risk clusters include cohort size and limitations.
- Population exports are audited.
- No identifiable patient data appears in default population views.

## LLM Implementation Notes
Tell implementation agents to treat population intelligence as a de-identified aggregate product. Do not implement patient-level browsing in this module by default.

