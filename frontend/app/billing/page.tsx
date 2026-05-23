import { AppShell } from "@/app/components/app-shell";
import { EmptyState, MetricGrid, Panel, StatusBadge } from "@/app/components/workspace-ui";
import {
  fetchBillingInvoices,
  fetchBillingOrders,
  fetchBillingPayments,
  fetchBillingServices
} from "@/app/lib/api/billing-desk";
import { isApiError } from "@/app/lib/api/errors";
import type { Metric } from "@/app/lib/workspace-data";

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
      <AppShell activePath="/billing" eyebrow="Revenue operations" title="Billing Desk">
        <Panel className="wide-panel" title="Billing desk unavailable">
          <EmptyState
            title="Unable to load billing desk"
            description={firstError(servicesResult, ordersResult, invoicesResult, paymentsResult)}
          />
        </Panel>
      </AppShell>
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
