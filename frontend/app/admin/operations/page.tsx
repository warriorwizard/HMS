import { AppShell } from "@/app/components/app-shell";
import { MetricGrid, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { operationsHandoffs, operationsMetrics, staffPerformanceRows } from "@/app/lib/workspace-data";

export default function AdminOperationsPage() {
  return (
    <AppShell activePath="/admin/operations" eyebrow="Admin console" title="Operations">
      <MetricGrid metrics={operationsMetrics} />

      <section className="main-grid">
        <Panel className="wide-panel" meta={`${staffPerformanceRows.length} staff tracked`} title="Staff Performance">
          <div className="data-table ops-performance-table">
            <div className="table-row table-head">
              <span>Staff</span>
              <span>Handled</span>
              <span>SLA</span>
              <span>Quality + focus</span>
              <span>Status</span>
            </div>
            {staffPerformanceRows.map((member) => (
              <div className="table-row" key={member.staff}>
                <div>
                  <strong>{member.staff}</strong>
                  <small>{member.role}</small>
                </div>
                <span>{member.handled}</span>
                <span>{member.sla}</span>
                <div>
                  <span>{member.quality}</span>
                  <small>{member.focus}</small>
                </div>
                <StatusBadge tone={member.tone}>{member.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Live Handoffs">
          <div className="admin-stack">
            {operationsHandoffs.map((handoff) => (
              <div className="admin-status-row" key={handoff.title}>
                <div>
                  <strong>{handoff.title}</strong>
                  <small>{handoff.owner}</small>
                </div>
                <StatusBadge tone={handoff.tone}>{handoff.status}</StatusBadge>
                <span>{handoff.note}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="split-grid compact-top">
        <Panel title="Shift Notes">
          <div className="signal-list">
            <div>
              <strong>Morning intake surge</strong>
              <span>Walk-ins are up 18%, so triage support is pinned to reception through 12:30.</span>
            </div>
            <div>
              <strong>Billing reconciliation window</strong>
              <span>Insurance portal sync is scheduled at 15:00 with a 20 minute freeze notice.</span>
            </div>
            <div>
              <strong>Evening callback block</strong>
              <span>Care desk receives overflow queue at 18:00 with manager override enabled.</span>
            </div>
          </div>
        </Panel>

        <Panel title="Control Checklist">
          <div className="rule-list">
            <label>
              <input defaultChecked type="checkbox" />
              Auto-route unresolved billing cases to finance pod
            </label>
            <label>
              <input defaultChecked type="checkbox" />
              Raise escalation when callback queue exceeds 10
            </label>
            <label>
              <input type="checkbox" />
              Apply surge staffing profile for evening shift
            </label>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
