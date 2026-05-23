import Link from "next/link";

import { AppShell } from "@/app/components/app-shell";
import { ActionBar, MetricGrid, Panel, RiskBadge, StatusBadge } from "@/app/components/workspace-ui";
import { commandMetrics, queueItems, workflowSteps } from "@/app/lib/workspace-data";

export default function CommandCenterPage() {
  return (
    <AppShell activePath="/doctor/command-center" eyebrow="Today" title="Doctor command center">
      <MetricGrid metrics={commandMetrics} />

      <section className="main-grid">
        <Panel className="queue-panel" meta={`${queueItems.length} visible`} title="Priority Queue">
          <div className="queue-list">
            {queueItems.map((item) => (
              <div className="queue-row" key={`${item.patient}-${item.visit}`}>
                <div>
                  <strong>{item.patient}</strong>
                  <span>{item.visit}</span>
                </div>
                <RiskBadge risk={item.risk} />
                <div>
                  <span>{item.status}</span>
                  <small>Due in {item.due}</small>
                </div>
                <div>
                  <span>{item.owner}</span>
                  <small>{item.signal}</small>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel meta="Live demo state" title="Workflow State">
          <div className="pipeline">
            {workflowSteps.map((step, index) => (
              <div className="pipeline-step" key={step.label}>
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
                <small>{step.count} cases</small>
                <StatusBadge tone={step.state === "Delayed" ? "warning" : "neutral"}>{step.state}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="insight-panel" meta="Human review required" title="AI Readiness">
          <p>
            AI outputs are prepared as source-linked summaries, triage signals, and recommended next actions.
            The doctor remains the final clinical decision maker.
          </p>
          <ActionBar>
            <Link className="button-link" href="/reports">
              Review reports
            </Link>
            <Link className="button-link secondary" href="/workflow">
              View workflow
            </Link>
          </ActionBar>
        </Panel>
      </section>
    </AppShell>
  );
}
