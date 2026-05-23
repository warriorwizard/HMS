import { AppShell } from "@/app/components/app-shell";
import { Panel, StatusBadge } from "@/app/components/workspace-ui";
import { workflowSteps } from "@/app/lib/workspace-data";

export default function WorkflowPage() {
  return (
    <AppShell activePath="/workflow" eyebrow="Operations" title="Workflow Engine">
      <section className="workflow-board">
        {workflowSteps.map((step, index) => (
          <Panel key={step.label} meta={`${step.count} cases`} title={step.label}>
            <div className="workflow-card-body">
              <span className="step-index">{index + 1}</span>
              <StatusBadge tone={step.state === "Delayed" ? "warning" : "neutral"}>{step.state}</StatusBadge>
              <p>
                Queue state is tracked for handoffs, delay detection, ownership, and audit-ready activity history.
              </p>
            </div>
          </Panel>
        ))}
      </section>

      <section className="main-grid compact-top">
        <Panel title="Bottleneck Signals">
          <div className="signal-list">
            <div>
              <strong>Uploads delayed</strong>
              <span>27 reports waiting for AI review or doctor routing.</span>
            </div>
            <div>
              <strong>Doctor review pressure</strong>
              <span>11 cases need senior clinical attention in the next hour.</span>
            </div>
            <div>
              <strong>Follow-up watchlist</strong>
              <span>32 patients need contact, reminder, or outcome capture.</span>
            </div>
          </div>
        </Panel>

        <Panel title="Automation Rules">
          <div className="rule-list">
            <label>
              <input defaultChecked type="checkbox" />
              Escalate critical imaging reports
            </label>
            <label>
              <input defaultChecked type="checkbox" />
              Notify care desk on missed follow-up
            </label>
            <label>
              <input type="checkbox" />
              Auto-create billing exception tickets
            </label>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
