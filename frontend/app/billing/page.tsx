import { AppShell } from "@/app/components/app-shell";
import { FieldHint, MetricGrid, Panel, StatusBadge } from "@/app/components/workspace-ui";
import {
  fetchBillingInvoices,
  fetchBillingOrders,
  fetchBillingPayments,
  fetchBillingServices
} from "@/app/lib/api/billing-desk";
import { isApiError } from "@/app/lib/api/errors";
import {
  b2bBillingBreakdownRows,
  b2bBillingMetrics,
  type Metric
} from "@/app/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function BillingDeskPage() {
  const [servicesResult, ordersResult, invoicesResult, paymentsResult] = await Promise.all([
    loadServices(),
    loadOrders(),
    loadInvoices(),
    loadPayments()
  ]);

  if (
    servicesResult.kind === "error" ||
    ordersResult.kind === "error" ||
    invoicesResult.kind === "error" ||
    paymentsResult.kind === "error"
  ) {
    return (
      <BillingDeskFallback
        message={firstError(servicesResult, ordersResult, invoicesResult, paymentsResult)}
      />
    );
  }

  const metrics: Metric[] = [
    {
      label: "Service catalog",
      value: String(servicesResult.items.length),
      trend: `${servicesResult.page.total} configured services`
    },
    {
      label: "Orders",
      value: String(ordersResult.items.length),
      trend: `${ordersResult.page.total} active orders`
    },
    {
      label: "Invoices",
      value: String(invoicesResult.items.length),
      trend: `${invoicesResult.page.total} total invoices`
    },
    {
      label: "Payments",
      value: String(paymentsResult.items.length),
      trend: `${paymentsResult.page.total} settled records`
    }
  ];

  return (
    <AppShell activePath="/billing" eyebrow="Revenue operations" title="Billing Desk">
      <MetricGrid metrics={metrics} />

      <section className="wide-grid">
        <Panel className="wide-panel" title="Service Catalog & Price List">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Service</span>
              <span>Department</span>
              <span>Base price</span>
              <span>Status</span>
            </div>
            {servicesResult.items.map((service) => (
              <div className="table-row" key={service.id}>
                <div>
                  <strong>{service.name}</strong>
                  <small>{service.code}</small>
                </div>
                <span>{service.department}</span>
                <span>{formatCurrency(service.base_price, service.currency)}</span>
                <StatusBadge tone={service.status === "active" ? "good" : "warning"}>{service.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Payment Tracking">
          <div className="signal-list">
            {paymentsResult.items.map((payment) => (
              <div key={payment.id}>
                <strong>{payment.invoice_id}</strong>
                <span>
                  {formatCurrency(payment.amount, payment.currency)} via {payment.method} ({payment.status})
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="main-grid compact-top">
        <Panel title="Orders linked to visits">
          <div className="signal-list">
            {ordersResult.items.map((order) => (
              <div key={order.id}>
                <strong>{order.id}</strong>
                <span>
                  Patient {order.patient_id} | Visit {order.visit_id} | {formatCurrency(order.total_amount, order.currency)}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Invoices & discount packages">
          <div className="signal-list">
            {invoicesResult.items.map((invoice) => (
              <div key={invoice.id}>
                <strong>{invoice.id}</strong>
                <span>
                  {invoice.status} | Discount {formatCurrency(invoice.discount_amount, invoice.currency)} | Total{" "}
                  {formatCurrency(invoice.total_amount, invoice.currency)}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

function BillingDeskFallback({ message }: { message: string }) {
  return (
    <AppShell activePath="/billing" eyebrow="Revenue operations" title="Billing Desk">
      <FieldHint tone="warning">
        Live billing services did not answer locally ({message}). Showing the revenue command desk instead.
      </FieldHint>

      <MetricGrid metrics={b2bBillingMetrics} />

      <section className="wide-grid">
        <Panel className="wide-panel" title="Service Catalog & Price List">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Service</span>
              <span>Department</span>
              <span>Base price</span>
              <span>Status</span>
            </div>
            {[
              ["Chest X-ray AI review", "Radiology", "INR 1,200", "active"],
              ["CBC + CRP panel", "Pathology", "INR 850", "active"],
              ["Doctor tele-review", "Care coordination", "INR 600", "watch"]
            ].map(([service, department, price, status]) => (
              <div className="table-row" key={service}>
                <div>
                  <strong>{service}</strong>
                  <small>{service.toUpperCase().replaceAll(" ", "_")}</small>
                </div>
                <span>{department}</span>
                <span>{price}</span>
                <StatusBadge tone={status === "active" ? "good" : "warning"}>{status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Payment Tracking">
          <div className="signal-list">
            {b2bBillingBreakdownRows.slice(0, 3).map((segment) => (
              <div key={segment.segment}>
                <strong>{segment.segment}</strong>
                <span>
                  Collected {segment.collected} | Outstanding {segment.outstanding} | Overdue {segment.overdueShare}
                </span>
                <StatusBadge tone={segment.tone}>{segment.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="main-grid compact-top">
        <Panel title="Orders linked to visits">
          <div className="signal-list">
            <div>
              <strong>ORD-8821</strong>
              <span>Asha Rao | VIS-8821 | Chest X-ray AI review | INR 1,200</span>
            </div>
            <div>
              <strong>ORD-8815</strong>
              <span>Kiran Mehta | VIS-8815 | CBC + CRP panel | INR 850</span>
            </div>
            <div>
              <strong>ORD-8799</strong>
              <span>Nisha Patel | VIS-8799 | Ultrasound follow-up | INR 1,600</span>
            </div>
          </div>
        </Panel>

        <Panel title="Invoices & discount packages">
          <div className="signal-list">
            <div>
              <strong>INV-24091</strong>
              <span>Pending insurer approval | Discount INR 300 | Total INR 4,900</span>
            </div>
            <div>
              <strong>INV-24088</strong>
              <span>Paid | Discount INR 0 | Total INR 2,050</span>
            </div>
            <div>
              <strong>INV-24081</strong>
              <span>Disputed | Package mismatch | Total INR 8,400</span>
            </div>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

async function loadServices() {
  try {
    return { kind: "ok" as const, ...(await fetchBillingServices({ limit: 10 })) };
  } catch (error) {
    return { kind: "error" as const, message: toMessage(error) };
  }
}

async function loadOrders() {
  try {
    return { kind: "ok" as const, ...(await fetchBillingOrders({ limit: 10 })) };
  } catch (error) {
    return { kind: "error" as const, message: toMessage(error) };
  }
}

async function loadInvoices() {
  try {
    return { kind: "ok" as const, ...(await fetchBillingInvoices({ limit: 10 })) };
  } catch (error) {
    return { kind: "error" as const, message: toMessage(error) };
  }
}

async function loadPayments() {
  try {
    return { kind: "ok" as const, ...(await fetchBillingPayments({ limit: 10 })) };
  } catch (error) {
    return { kind: "error" as const, message: toMessage(error) };
  }
}

function firstError(
  ...results: Array<{ kind: "ok" } | { kind: "error"; message: string }>
): string {
  const failed = results.find((result) => result.kind === "error");
  return failed?.kind === "error" ? failed.message : "Unknown billing desk error.";
}

function toMessage(error: unknown): string {
  if (isApiError(error)) {
    return `The billing API responded with: ${error.message}`;
  }
  return "Billing API is currently unavailable.";
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
}
