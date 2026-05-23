import { AppShell } from "@/app/components/app-shell";
import { MetricGrid, Panel } from "@/app/components/workspace-ui";
import { analyticsBars, analyticsMetrics } from "@/app/lib/workspace-data";

export default function AnalyticsPage() {
  return (
    <AppShell activePath="/analytics" eyebrow="Executive intelligence" title="Analytics">
      <MetricGrid metrics={analyticsMetrics} />

      <section className="main-grid">
        <Panel className="wide-panel" title="Operational Load by Stream">
          <div className="bar-list">
            {analyticsBars.map((bar) => (
              <div className="bar-row" key={bar.label}>
                <span>{bar.label}</span>
                <div aria-label={`${bar.label} load ${bar.value}%`} className="bar-track">
                  <div className="bar-fill" style={{ width: `${bar.value}%` }} />
                </div>
                <strong>{bar.value}%</strong>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Population Intelligence">
          <div className="signal-list">
            <div>
              <strong>Regional cluster watch</strong>
              <span>Respiratory imaging flags increased across two centers.</span>
            </div>
            <div>
              <strong>Screening effectiveness</strong>
              <span>Early escalation rate improved after follow-up reminders.</span>
            </div>
            <div>
              <strong>Data quality</strong>
              <span>Outcome capture is the main blocker for predictive confidence.</span>
            </div>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
