import { AppShell } from "@/app/components/app-shell";
import { MetricGrid, Panel, StatusBadge } from "@/app/components/workspace-ui";
import {
  crmDashboardMetrics,
  crmFunnelStages,
  crmHealthRows,
  crmWatchlist
} from "@/app/lib/workspace-data";

export default function CrmDashboardPage() {
  return (
    <AppShell activePath="/crm/dashboard" eyebrow="Revenue operations" title="CRM Dashboard">
      <MetricGrid metrics={crmDashboardMetrics} />

      <section className="main-grid">
        <Panel className="wide-panel" meta={`${crmFunnelStages[0]?.leads ?? 0} lead records`} title="Pipeline Funnel">
          <div className="crm-funnel">
            {crmFunnelStages.map((stage) => (
              <div className="crm-funnel-row" key={stage.stage}>
                <div className="crm-funnel-meta">
                  <strong>{stage.stage}</strong>
                  <span>{stage.owner}</span>
                </div>
                <div
                  aria-label={`${stage.stage} conversion ${stage.conversion}%`}
                  className="crm-funnel-track"
                >
                  <div className="crm-funnel-fill" style={{ width: `${stage.conversion}%` }} />
                </div>
                <div className="crm-funnel-stats">
                  <strong>{stage.leads}</strong>
                  <small>
                    {stage.conversion}% | {stage.trend}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Campaign Watchlist">
          <div className="signal-list">
            {crmWatchlist.map((item) => (
              <div key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="split-grid compact-top">
        <Panel className="wide-panel" meta={`${crmHealthRows.length} segments`} title="Pipeline Health">
          <div className="crm-health-list">
            <div className="crm-health-row crm-health-head">
              <span>Segment</span>
              <span>Response SLA</span>
              <span>Health</span>
              <span>Note</span>
            </div>
            {crmHealthRows.map((row) => (
              <div className="crm-health-row" key={row.segment}>
                <div>
                  <strong>{row.segment}</strong>
                  <small>{row.coverage}</small>
                </div>
                <span>{row.responseSla}</span>
                <StatusBadge tone={row.tone}>{row.health}</StatusBadge>
                <small>{row.note}</small>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Today Focus">
          <div className="rule-list">
            <label>
              <input defaultChecked type="checkbox" />
              Prioritize opportunities with procurement calls due in 24 hours
            </label>
            <label>
              <input defaultChecked type="checkbox" />
              Escalate accounts with first-response SLA above 6 hours
            </label>
            <label>
              <input type="checkbox" />
              Launch reactivation sequence for stalled diagnostic center leads
            </label>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
