# Frontend UI Architecture

## Product Purpose
The frontend is the working surface for Tarini V6 users. It must support fast clinical workflows, dense operational views, trustworthy AI panels, and role-specific navigation.

This is not a marketing website. The first screen after login should be the user's work area.

## Technology
- Next.js App Router.
- TypeScript.
- Server components where useful.
- Client components for interactive workflows.
- Role-aware route guards.
- API client with typed DTOs.
- Real-time updates through SSE/WebSocket or polling fallback.

## UI Principles
- Dense but calm layouts.
- Clinical clarity over visual decoration.
- Role-specific information hierarchy.
- Fast scanning in queues.
- Clear empty, loading, error, and success states.
- AI content must show source, confidence, and uncertainty.
- Avoid hiding workflow state behind decorative UI.

## App Shells
Role-based shells:
- Super Admin Shell.
- Hospital Admin Shell.
- Doctor Shell.
- Technician Shell.
- Staff Shell.
- Patient Shell.
- B2B Partner Shell.

Shared shell parts:
- Top bar with tenant/site switch.
- Role-aware navigation.
- Notification center.
- Search.
- User menu.
- Main content area.

## Route Map
Recommended routes:
- `/login`
- `/select-tenant`
- `/dashboard`
- `/patients`
- `/patients/[patientId]`
- `/patients/[patientId]/timeline`
- `/visits/[visitId]`
- `/reports`
- `/reports/[reportId]`
- `/doctor/command-center`
- `/workflow/tasks`
- `/billing`
- `/analytics`
- `/executive`
- `/population`
- `/settings/users`
- `/settings/roles`
- `/settings/tenant`

## State Management
Use server state for API data:
- Query cache for lists and details.
- Optimistic updates only for low-risk UI actions.
- Refetch queue after workflow events.

Use client state for:
- Filters.
- Selected queue item.
- Panel open/closed state.
- Draft note content.
- Upload progress.

## API Client Contract
Frontend API client should:
- Attach auth token/session automatically.
- Include request ID when possible.
- Handle 401 with refresh or redirect.
- Handle 403 with permission state.
- Normalize API errors.
- Support cancellation for search.

## Core Components
Foundational:
- `AppShell`
- `RoleGuard`
- `TenantSwitcher`
- `SiteSwitcher`
- `DataTable`
- `FilterBar`
- `StatusBadge`
- `RiskBadge`
- `Timeline`
- `AuditAwareAction`
- `SourceReferenceChip`
- `ConfidenceIndicator`
- `EmptyState`
- `ErrorState`

Clinical:
- `PatientSearch`
- `PatientRegistrationForm`
- `PatientHeader`
- `VisitSummaryPanel`
- `ReportViewer`
- `ClinicalTimeline`
- `RiskExplanationPanel`
- `SimilarCaseList`
- `CopilotPanel`
- `DoctorQueue`
- `CaseWorkspace`

Operations:
- `WorkflowTaskList`
- `SlaIndicator`
- `EscalationPanel`
- `NotificationCenter`
- `BillingInvoiceEditor`
- `PaymentCapture`
- `AnalyticsKpiCard`
- `MetricTrendChart`

## Doctor Command Center UI
Must be optimized for repeated use:
- Queue remains visible while case changes.
- Selected case loads without losing filters.
- Risk and SLA visible in list.
- AI panel can be collapsed.
- Doctor decision action is clear and always auditable.

## Upload UI
Upload UI must show:
- Selected patient and visit.
- File validation.
- Upload progress.
- Processing status.
- Metadata extraction result.
- Need human review warnings.
- Retry failed processing if permitted.

## Copilot UI
Copilot UI must show:
- Mode.
- Source references.
- Confidence.
- Missing data.
- Draft approval controls.
- Feedback controls.

Do not display AI response as plain authority text. It needs surrounding evidence and controls.

## Responsive Behavior
Desktop:
- Multi-panel layouts for command center and dashboards.

Tablet:
- Queue and detail panels should collapse into tabs.

Mobile:
- Staff workflows, patient portal, and alerts should work.
- Doctor command center can be limited but must not break.

## Accessibility
Requirements:
- Keyboard navigation for core flows.
- Visible focus states.
- Sufficient contrast.
- Form labels.
- Error messages near fields.
- ARIA labels for icon-only controls.

## Failure and Edge Cases
- Session expired: preserve intended destination.
- Permission denied: show clear access state.
- API offline: show retry and do not lose drafts.
- Upload interrupted: resume or retry where possible.
- AI unavailable: show manual workflow.

## Implementation Tasks
- Create app shell and route guards.
- Build typed API client.
- Build shared component library.
- Implement patient and visit screens.
- Implement upload screen.
- Implement command center.
- Implement copilot panel.
- Implement analytics dashboards.
- Add end-to-end tests for core workflows.

## Acceptance Criteria
- Role-specific users see only allowed navigation.
- Doctor can complete review from command center.
- Staff can register patient and create visit.
- Technician can upload report and see processing state.
- AI panels show citations and uncertainty.
- UI handles loading, empty, error, and permission states.

## LLM Implementation Notes
Tell implementation agents to build the actual application screens first, not a landing page. The frontend should feel like clinical operations software: fast, legible, and trustworthy.

