import { Suspense } from "react";

import { AppShell } from "@/app/components/app-shell";
import {
  EmptyState,
  FieldHint,
  LoadingState,
  MetricGrid,
  Panel,
  StatusBadge
} from "@/app/components/workspace-ui";
import type {
  AnalyticsAiUsageResource,
  AnalyticsPaginatedResponse,
  AnalyticsRevenueSummaryResource,
  AnalyticsTatMetricResource,
  AnalyticsWorkflowBottleneckResource
} from "@/app/lib/api/analytics";
import {
  fetchAnalyticsAiUsage,
  fetchAnalyticsRevenueSummary,
  fetchAnalyticsTatMetrics,
  fetchAnalyticsWorkflowBottlenecks
} from "@/app/lib/api/analytics";
import { isApiError } from "@/app/lib/api/errors";
import {
  analyticsBars,
  analyticsMetrics,
  b2bBillingMetrics,
  workflowSteps,
  type Metric
} from "@/app/lib/workspace-data";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  const aiUsagePromise = fetchAnalyticsAiUsage();
  const tatMetricsPromise = fetchAnalyticsTatMetrics();
  const workflowPromise = fetchAnalyticsWorkflowBottlenecks();
  const revenuePromise = fetchAnalyticsRevenueSummary();

  return (
    <AppShell activePath="/analytics" eyebrow="Executive intelligence" title="Analytics">
      <Suspense
        fallback={<LoadingState title="Loading KPIs" description="Calculating executive analytics metrics." />}
      >
        <ExecutiveMetricsSection
          aiUsagePromise={aiUsagePromise}
          revenuePromise={revenuePromise}
          tatMetricsPromise={tatMetricsPromise}
          workflowPromise={workflowPromise}
        />
      </Suspense>

      <section className="main-grid">
        <Suspense
          fallback={
            <Panel className="wide-panel" title="AI Usage and Doctor Alignment">
              <LoadingState
                title="Loading AI usage"
                description="Retrieving AI coverage, override, and doctor alignment metrics."
              />
            </Panel>
          }
        >
          <AiUsagePanel dataPromise={aiUsagePromise} />
        </Suspense>

        <Suspense
          fallback={
            <Panel title="Workflow Bottlenecks">
              <LoadingState
                title="Loading workflow bottlenecks"
                description="Retrieving stage-level backlog and SLA pressure."
              />
            </Panel>
          }
        >
          <WorkflowBottlenecksPanel dataPromise={workflowPromise} />
        </Suspense>
      </section>

      <section className="wide-grid compact-top">
        <Suspense
          fallback={
            <Panel className="wide-panel" title="Turnaround Time Metrics">
              <LoadingState title="Loading TAT metrics" description="Retrieving department-level turnaround performance." />
            </Panel>
          }
        >
          <TatMetricsPanel dataPromise={tatMetricsPromise} />
        </Suspense>

        <Suspense
          fallback={
            <Panel title="Revenue Summary">
              <LoadingState title="Loading revenue summary" description="Retrieving collection and outstanding trend metrics." />
            </Panel>
          }
        >
          <RevenueSummaryPanel dataPromise={revenuePromise} />
        </Suspense>
      </section>
    </AppShell>
  );
}

async function ExecutiveMetricsSection({
  aiUsagePromise,
  tatMetricsPromise,
  workflowPromise,
  revenuePromise
}: {
  aiUsagePromise: Promise<AnalyticsPaginatedResponse<AnalyticsAiUsageResource>>;
  tatMetricsPromise: Promise<AnalyticsPaginatedResponse<AnalyticsTatMetricResource>>;
  workflowPromise: Promise<AnalyticsPaginatedResponse<AnalyticsWorkflowBottleneckResource>>;
  revenuePromise: Promise<AnalyticsPaginatedResponse<AnalyticsRevenueSummaryResource>>;
}) {
  let metrics: Metric[];

  try {
    const [aiUsage, tatMetrics, workflow, revenue] = await Promise.all([
      aiUsagePromise,
      tatMetricsPromise,
      workflowPromise,
      revenuePromise
    ]);

    const latestAiUsage = aiUsage.items[aiUsage.items.length - 1];
    const averageTat = tatMetrics.items.length
      ? Math.round(
          tatMetrics.items.reduce((total, item) => total + item.avg_turnaround_minutes, 0) /
            tatMetrics.items.length
        )
      : 0;
    const criticalBacklog = workflow.items
      .filter((item) => item.status.toLowerCase() === "critical")
      .reduce((total, item) => total + item.pending_cases, 0);
    const revenueOutstanding = revenue.items.reduce(
      (total, item) => total + item.revenue_outstanding,
      0
    );

    metrics = [
      {
        label: "AI assist rate",
        value: latestAiUsage ? `${latestAiUsage.ai_assist_rate.toFixed(1)}%` : "0%",
        trend: latestAiUsage ? `${latestAiUsage.ai_assisted_reports}/${latestAiUsage.total_reports} reports` : "No data"
      },
      {
        label: "Average TAT",
        value: `${averageTat}m`,
        trend: `${tatMetrics.items.length} departments`
      },
      {
        label: "Critical backlog",
        value: String(criticalBacklog),
        trend: `${workflow.items.length} stages monitored`
      },
      {
        label: "Outstanding revenue",
        value: formatCurrency(revenueOutstanding),
        trend: `${revenue.items.length} revenue segments`
      }
    ];
  } catch {
    return <MetricGrid metrics={analyticsMetrics} />;
  }

  return <MetricGrid metrics={metrics} />;
}

async function AiUsagePanel({
  dataPromise
}: {
  dataPromise: Promise<AnalyticsPaginatedResponse<AnalyticsAiUsageResource>>;
}) {
  let response: AnalyticsPaginatedResponse<AnalyticsAiUsageResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return (
      <Panel className="wide-panel" title="AI Usage and Doctor Alignment">
        <FieldHint tone="warning">{analyticsMessage(error)} Showing AI usage operating snapshot.</FieldHint>
        <div className="data-table reports-table compact-top">
          <div className="table-row table-head">
            <span>Period</span>
            <span>Coverage</span>
            <span>Override</span>
            <span>Breakdown</span>
            <span>Status</span>
          </div>
          <div className="table-row">
            <div>
              <strong>Today</strong>
              <small>128 total reports</small>
            </div>
            <span>72.0%</span>
            <span>8.7%</span>
            <div>
              <strong>92 AI assisted</strong>
              <small>36 doctor-only</small>
            </div>
            <StatusBadge tone="good">on_track</StatusBadge>
          </div>
          <div className="table-row">
            <div>
              <strong>This week</strong>
              <small>746 total reports</small>
            </div>
            <span>74.4%</span>
            <span>11.2%</span>
            <div>
              <strong>555 AI assisted</strong>
              <small>191 doctor-only</small>
            </div>
            <StatusBadge tone="warning">watch</StatusBadge>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="wide-panel" title="AI Usage and Doctor Alignment">
      <div className="data-table reports-table">
        <div className="table-row table-head">
          <span>Period</span>
          <span>Coverage</span>
          <span>Override</span>
          <span>Breakdown</span>
          <span>Status</span>
        </div>
        {response.items.length > 0 ? (
          response.items.map((item) => (
            <div className="table-row" key={item.id}>
              <div>
                <strong>{item.period}</strong>
                <small>{item.total_reports} total reports</small>
              </div>
              <span>{item.ai_assist_rate.toFixed(1)}%</span>
              <span>{toRate(item.doctor_override_count, item.ai_assisted_reports)}</span>
              <div>
                <strong>{item.ai_assisted_reports} AI assisted</strong>
                <small>{item.doctor_only_reports} doctor-only</small>
              </div>
              <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
            </div>
          ))
        ) : (
          <EmptyState title="No AI usage metrics found" description="No AI usage data is available yet." />
        )}
      </div>
    </Panel>
  );
}

async function WorkflowBottlenecksPanel({
  dataPromise
}: {
  dataPromise: Promise<AnalyticsPaginatedResponse<AnalyticsWorkflowBottleneckResource>>;
}) {
  let response: AnalyticsPaginatedResponse<AnalyticsWorkflowBottleneckResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return (
      <Panel title="Workflow Bottlenecks">
        <FieldHint tone="warning">{analyticsMessage(error)} Showing stage pressure snapshot.</FieldHint>
        <div className="signal-list compact-top">
          {workflowSteps.map((step) => (
            <div key={step.label}>
              <strong>{step.label}</strong>
              <span>{step.count} cases | {step.state}</span>
              <StatusBadge tone={workflowTone(step.state)}>{step.state}</StatusBadge>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Workflow Bottlenecks">
      <div className="signal-list">
        {response.items.length > 0 ? (
          response.items.map((item) => (
            <div key={item.id}>
              <strong>
                {item.stage} | {item.department}
              </strong>
              <span>
                {item.pending_cases} pending cases | SLA breach {item.sla_breach_percent.toFixed(1)}%
              </span>
              <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
            </div>
          ))
        ) : (
          <EmptyState
            title="No bottleneck data found"
            description="No workflow bottleneck records are currently available."
          />
        )}
      </div>
    </Panel>
  );
}

async function TatMetricsPanel({
  dataPromise
}: {
  dataPromise: Promise<AnalyticsPaginatedResponse<AnalyticsTatMetricResource>>;
}) {
  let response: AnalyticsPaginatedResponse<AnalyticsTatMetricResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return (
      <Panel className="wide-panel" title="Turnaround Time Metrics">
        <FieldHint tone="warning">{analyticsMessage(error)} Showing department TAT snapshot.</FieldHint>
        <div className="data-table reports-table compact-top">
          <div className="table-row table-head">
            <span>Department</span>
            <span>Average</span>
            <span>P90</span>
            <span>Volume</span>
            <span>Status</span>
          </div>
          {analyticsBars.map((bar, index) => (
            <div className="table-row" key={bar.label}>
              <div>
                <strong>{bar.label}</strong>
                <small>OPS-{index + 1}</small>
              </div>
              <span>{Math.max(18, 96 - bar.value)}m</span>
              <span>{Math.max(28, 126 - bar.value)}m</span>
              <span>{bar.value}</span>
              <StatusBadge tone={bar.value >= 64 ? "good" : "warning"}>
                {bar.value >= 64 ? "on_track" : "watch"}
              </StatusBadge>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="wide-panel" title="Turnaround Time Metrics">
      <div className="data-table reports-table">
        <div className="table-row table-head">
          <span>Department</span>
          <span>Average</span>
          <span>P90</span>
          <span>Volume</span>
          <span>Status</span>
        </div>
        {response.items.length > 0 ? (
          response.items.map((item) => (
            <div className="table-row" key={item.id}>
              <div>
                <strong>{item.department}</strong>
                <small>{item.id}</small>
              </div>
              <span>{item.avg_turnaround_minutes}m</span>
              <span>{item.p90_turnaround_minutes}m</span>
              <span>{item.case_count}</span>
              <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
            </div>
          ))
        ) : (
          <EmptyState
            title="No turnaround metrics found"
            description="No department-level turnaround metrics are currently available."
          />
        )}
      </div>
    </Panel>
  );
}

async function RevenueSummaryPanel({
  dataPromise
}: {
  dataPromise: Promise<AnalyticsPaginatedResponse<AnalyticsRevenueSummaryResource>>;
}) {
  let response: AnalyticsPaginatedResponse<AnalyticsRevenueSummaryResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return (
      <Panel title="Revenue Summary">
        <FieldHint tone="warning">{analyticsMessage(error)} Showing revenue snapshot.</FieldHint>
        <div className="signal-list compact-top">
          {b2bBillingMetrics.map((metric) => (
            <div key={metric.label}>
              <strong>{metric.label}</strong>
              <span>{metric.value} | {metric.trend}</span>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Revenue Summary">
      <div className="signal-list">
        {response.items.length > 0 ? (
          response.items.map((item) => (
            <div key={item.id}>
              <strong>
                {item.department} | {item.period}
              </strong>
              <span>
                Collected {formatCurrency(item.revenue_collected)} | Outstanding{" "}
                {formatCurrency(item.revenue_outstanding)}
              </span>
              <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
            </div>
          ))
        ) : (
          <EmptyState
            title="No revenue summary data found"
            description="No revenue summary records are currently available."
          />
        )}
      </div>
    </Panel>
  );
}

function statusTone(status: string): "good" | "warning" | "danger" | "neutral" {
  const normalized = status.toLowerCase();

  if (normalized === "on_track" || normalized === "stable" || normalized === "processed") {
    return "good";
  }

  if (normalized === "watch" || normalized === "queued") {
    return "warning";
  }

  if (normalized === "critical" || normalized === "failed") {
    return "danger";
  }

  return "neutral";
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function toRate(part: number, total: number): string {
  if (total <= 0) {
    return "0.0%";
  }
  return `${((part / total) * 100).toFixed(1)}%`;
}

function analyticsMessage(error: unknown): string {
  return isApiError(error)
    ? `The analytics API responded with an error: ${error.message}.`
    : "The analytics endpoint is currently unavailable.";
}

function workflowTone(state: string): "good" | "warning" | "danger" | "neutral" {
  const normalized = state.toLowerCase();
  if (normalized === "priority" || normalized === "delayed") {
    return "danger";
  }
  if (normalized === "running" || normalized === "watch") {
    return "warning";
  }
  if (normalized === "stable" || normalized === "clean") {
    return "good";
  }
  return "neutral";
}
