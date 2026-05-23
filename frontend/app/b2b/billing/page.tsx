import { AppShell } from "@/app/components/app-shell";
import { MetricGrid, Panel, StatusBadge } from "@/app/components/workspace-ui";
import {
  b2bAgingBuckets,
  b2bBillingActionChecklist,
  b2bBillingBreakdownRows,
  b2bBillingMetrics,
  b2bSettlementHighlights
} from "@/app/lib/workspace-data";

export default function B2BBillingPage() {
  return (
    <AppShell activePath="/b2b/billing" eyebrow="B2B operations" title="Billing Dashboard">
      <MetricGrid metrics={b2bBillingMetrics} />

      <section className="main-grid">
        <Panel
          className="wide-panel"
          meta={`${b2bBillingBreakdownRows.length} partner segments`}
          title="Partner Billing Breakdown"
        >
          <div className="data-table b2b-billing-table">
            <div className="table-row table-head">
              <span>Segment</span>
              <span>Invoices</span>
              <span>Billed</span>
              <span>Collected</span>
              <span>Outstanding</span>
              <span>Status</span>
            </div>
            {b2bBillingBreakdownRows.map((segment) => (
              <div className="table-row" key={segment.segment}>
                <div>
                  <strong>{segment.segment}</strong>
                  <small>{segment.partners}</small>
                </div>
                <span>{segment.invoices}</span>
                <span>{segment.billed}</span>
                <span>{segment.collected}</span>
                <div>
                  <strong>{segment.outstanding}</strong>
                  <small>Overdue share {segment.overdueShare}</small>
                </div>
                <StatusBadge tone={segment.tone}>{segment.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Aging Buckets">
          <div className="signal-list">
            {b2bAgingBuckets.map((bucket) => (
              <div key={bucket.bucket}>
                <strong>
                  {bucket.bucket} | {bucket.amount}
                </strong>
                <StatusBadge tone={bucket.tone}>{bucket.trend}</StatusBadge>
                <span>{bucket.accounts}</span>
                <span>{bucket.note}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="split-grid compact-top">
        <Panel className="wide-panel" title="Settlement Highlights">
          <div className="timeline">
            {b2bSettlementHighlights.map((item) => (
              <div key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Action Checklist">
          <div className="rule-list">
            {b2bBillingActionChecklist.map((item, index) => (
              <label key={item}>
                <input defaultChecked={index < 2} type="checkbox" />
                {item}
              </label>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
