import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AppShell } from "@/app/components/app-shell";
import {
  EmptyState,
  ErrorState,
  FieldHint,
  LoadingState,
  Panel,
  StatusBadge
} from "@/app/components/workspace-ui";
import type {
  B2bCreateOrderPayload,
  B2bOrderResource,
  B2bPaginatedResponse,
  B2bPartnerResource
} from "@/app/lib/api";
import {
  createB2bOrder,
  fetchB2bOrders,
  fetchB2bPartners,
  isApiError
} from "@/app/lib/api";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{
  q?: string | string[] | undefined;
  status?: string | string[] | undefined;
  partner_id?: string | string[] | undefined;
  order_result?: string | string[] | undefined;
  order_id?: string | string[] | undefined;
  order_error?: string | string[] | undefined;
}>;

type OrdersFilters = {
  q: string;
  status: string;
  partner_id: string;
};

type OrderFeedback = {
  kind: "idle" | "success" | "error";
  message: string;
  orderId: string;
};

type OrderDirectoryPanelProps = {
  filters: OrdersFilters;
  dataPromise: Promise<B2bPaginatedResponse<B2bOrderResource>>;
};

type PlaceOrderPanelProps = {
  feedback: OrderFeedback;
  filters: OrdersFilters;
  partnersPromise: Promise<B2bPaginatedResponse<B2bPartnerResource>>;
};

export default async function B2bOrdersPage({
  searchParams
}: {
  searchParams?: PageSearchParams;
}) {
  const params = await searchParams;
  const filters: OrdersFilters = {
    q: readFilterValue(params?.q),
    status: readFilterValue(params?.status),
    partner_id: readFilterValue(params?.partner_id)
  };
  const feedback = readOrderFeedback(params);
  const ordersPromise = fetchB2bOrders({
    q: filters.q || undefined,
    status: filters.status || undefined,
    partner_id: filters.partner_id || undefined
  });
  const partnersPromise = fetchB2bPartners({
    status: "active",
    limit: 80
  });
  const hasFilters = filters.q.length > 0 || filters.status.length > 0 || filters.partner_id.length > 0;

  return (
    <AppShell activePath="/b2b/orders" eyebrow="B2B management" title="Partner Orders">
      <form action="/b2b/orders" className="toolbar">
        <label>
          <span>Search orders</span>
          <input defaultValue={filters.q} name="q" placeholder="Order ID, patient, test, or notes" type="search" />
          <FieldHint>Search across order ID, patient, test, and notes metadata.</FieldHint>
        </label>
        <label>
          <span>Status</span>
          <input defaultValue={filters.status} name="status" placeholder="new, in_progress, completed" type="search" />
          <FieldHint>Use one or more comma-separated statuses.</FieldHint>
        </label>
        <label>
          <span>Partner ID</span>
          <input defaultValue={filters.partner_id} name="partner_id" placeholder="par_..." type="search" />
          <FieldHint>Limit the list to one partner identifier.</FieldHint>
        </label>
        <button type="submit">Apply filters</button>
        {hasFilters ? (
          <Link className="button-link secondary" href="/b2b/orders">
            Clear
          </Link>
        ) : null}
      </form>

      <section className="wide-grid">
        <Suspense
          fallback={
            <Panel className="wide-panel" title="Order Tracker">
              <LoadingState
                title="Loading orders"
                description="Retrieving B2B order placement and tracking records."
              />
            </Panel>
          }
        >
          <OrderDirectoryPanel dataPromise={ordersPromise} filters={filters} />
        </Suspense>

        <Suspense
          fallback={
            <Panel title="Place Order">
              <LoadingState
                title="Preparing order form"
                description="Loading partner options and order form defaults."
              />
            </Panel>
          }
        >
          <PlaceOrderPanel feedback={feedback} filters={filters} partnersPromise={partnersPromise} />
        </Suspense>
      </section>
    </AppShell>
  );
}

async function OrderDirectoryPanel({ filters, dataPromise }: OrderDirectoryPanelProps) {
  let response: B2bPaginatedResponse<B2bOrderResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return (
      <Panel className="wide-panel" title="Order Tracker">
        <ErrorState
          title="Unable to load orders"
          description={
            isApiError(error)
              ? `The B2B API responded with an error: ${error.message}`
              : "The B2B orders API is currently unavailable. Try again in a moment."
          }
        />
      </Panel>
    );
  }

  return (
    <Panel
      className="wide-panel"
      meta={describePageWindow(response.page.limit, response.page.offset, response.page.total, "orders")}
      title="Order Tracker"
    >
      <div className="data-table reports-table">
        <div className="table-row table-head">
          <span>Order</span>
          <span>Partner</span>
          <span>Test / patient</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {response.items.length > 0 ? (
          response.items.map((order) => (
            <div className="table-row" key={order.id}>
              <div>
                <strong>{order.id}</strong>
                <small>{formatOrderTimestamp(order)}</small>
              </div>
              <div>
                <strong>{order.partner_name ?? order.partner_id}</strong>
                <small>{order.partner_id}</small>
              </div>
              <div>
                <strong>{order.test_name ?? order.test_code ?? "Test not specified"}</strong>
                <small>{order.patient_name ?? order.patient_id ?? "Patient details unavailable"}</small>
              </div>
              <span>{formatOrderAmount(order)}</span>
              <StatusBadge tone={statusTone(order.status)}>{order.status}</StatusBadge>
            </div>
          ))
        ) : (
          <EmptyState
            title="No orders found"
            description={
              hasOrderFilters(filters)
                ? "No orders match the current query, status, or partner filter."
                : "No B2B orders are available yet."
            }
          />
        )}
      </div>
    </Panel>
  );
}

async function PlaceOrderPanel({ feedback, filters, partnersPromise }: PlaceOrderPanelProps) {
  let partners: B2bPartnerResource[] = [];
  let partnerLoadWarning: string | null = null;

  try {
    const partnerResponse = await partnersPromise;
    partners = partnerResponse.items;
  } catch (error) {
    partnerLoadWarning = isApiError(error)
      ? `Could not load partner suggestions: ${error.message}`
      : "Partner suggestions are unavailable, but manual partner IDs can still be used.";
  }

  return (
    <Panel meta={`${partners.length} active partners`} title="Place Order">
      {feedback.kind === "success" ? (
        <FieldHint tone="good">
          Order created successfully{feedback.orderId ? ` (ID: ${feedback.orderId})` : ""}.
        </FieldHint>
      ) : null}
      {feedback.kind === "error" ? (
        <ErrorState title="Unable to place order" description={feedback.message} />
      ) : null}
      {partnerLoadWarning ? <FieldHint tone="warning">{partnerLoadWarning}</FieldHint> : null}

      <form action={placeOrderAction} className="rule-list compact-top">
        <input name="current_q" type="hidden" value={filters.q} />
        <input name="current_status" type="hidden" value={filters.status} />
        <input name="current_partner_id" type="hidden" value={filters.partner_id} />

        <label>
          <span>Partner ID</span>
          <input
            className="config-input"
            defaultValue={filters.partner_id}
            list="b2b-partner-options"
            name="partner_id"
            placeholder="par_..."
            required
            type="text"
          />
        </label>

        <label>
          <span>PO number</span>
          <input className="config-input" name="po_number" placeholder="PO-XXXX-123" required type="text" />
        </label>

        <label>
          <span>Patient name</span>
          <input className="config-input" name="patient_name" placeholder="Patient full name" type="text" />
        </label>

        <label>
          <span>Test code</span>
          <input className="config-input" name="test_code" placeholder="CBC, XRAY_CHEST, etc." type="text" />
        </label>

        <label>
          <span>Quantity</span>
          <input className="config-input" defaultValue="1" min={1} name="quantity" step={1} type="number" />
        </label>

        <label>
          <span>Total amount</span>
          <input
            className="config-input"
            defaultValue="1000"
            min={0.01}
            name="total_amount"
            step="0.01"
            type="number"
          />
        </label>

        <label>
          <span>Currency</span>
          <input className="config-input" defaultValue="USD" name="currency" required type="text" />
        </label>

        <label>
          <span>Status</span>
          <input className="config-input" defaultValue="open" name="status" required type="text" />
        </label>

        <label>
          <span>Notes</span>
          <input className="config-input" name="notes" placeholder="Special handling or timing notes" type="text" />
        </label>

        <button type="submit">Place order</button>

        {partners.length > 0 ? (
          <datalist id="b2b-partner-options">
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </datalist>
        ) : null}
      </form>
    </Panel>
  );
}

async function placeOrderAction(formData: FormData) {
  "use server";

  const filters: OrdersFilters = {
    q: readFormValue(formData.get("current_q")),
    status: readFormValue(formData.get("current_status")),
    partner_id: readFormValue(formData.get("current_partner_id"))
  };
  const partnerId = readFormValue(formData.get("partner_id"));

  if (partnerId.length === 0) {
    redirect(
      buildOrdersHref(filters, {
        order_result: "error",
        order_error: "Partner ID is required to place a B2B order."
      })
    );
  }

  const quantity = readOptionalPositiveNumber(formData.get("quantity"));
  if (quantity === null) {
    redirect(
      buildOrdersHref(filters, {
        order_result: "error",
        order_error: "Quantity must be a positive number."
      })
    );
  }

  const totalAmount = readRequiredPositiveNumber(formData.get("total_amount"));
  if (totalAmount === null) {
    redirect(
      buildOrdersHref(filters, {
        order_result: "error",
        order_error: "Total amount must be a positive number."
      })
    );
  }

  const poNumber = readFormValue(formData.get("po_number"));
  if (poNumber.length === 0) {
    redirect(
      buildOrdersHref(filters, {
        order_result: "error",
        order_error: "PO number is required to place a B2B order."
      })
    );
  }

  const currency = readFormValue(formData.get("currency"));
  if (currency.length === 0) {
    redirect(
      buildOrdersHref(filters, {
        order_result: "error",
        order_error: "Currency is required to place a B2B order."
      })
    );
  }

  const orderStatus = readFormValue(formData.get("status"));
  if (orderStatus.length === 0) {
    redirect(
      buildOrdersHref(filters, {
        order_result: "error",
        order_error: "Status is required to place a B2B order."
      })
    );
  }

  const payload: B2bCreateOrderPayload = {
    partner_id: partnerId,
    po_number: poNumber,
    status: orderStatus,
    total_amount: totalAmount,
    currency,
    patient_name: readOptionalFormValue(formData.get("patient_name")),
    test_code: readOptionalFormValue(formData.get("test_code")),
    quantity: quantity ?? undefined,
    notes: readOptionalFormValue(formData.get("notes")),
    requested_at: new Date().toISOString()
  };

  let createdOrder: B2bOrderResource;

  try {
    createdOrder = await createB2bOrder(payload);
  } catch (error) {
    redirect(
      buildOrdersHref(filters, {
        order_result: "error",
        order_error: buildOrderErrorMessage(error)
      })
    );
  }

  redirect(
    buildOrdersHref(filters, {
      order_result: "success",
      order_id: createdOrder.id
    })
  );
}

function readOrderFeedback(
  params:
    | {
        order_result?: string | string[] | undefined;
        order_id?: string | string[] | undefined;
        order_error?: string | string[] | undefined;
      }
    | undefined
): OrderFeedback {
  const result = readFilterValue(params?.order_result).toLowerCase();

  if (result === "success") {
    return {
      kind: "success",
      message: "",
      orderId: readFilterValue(params?.order_id)
    };
  }

  if (result === "error") {
    const message = readFilterValue(params?.order_error);
    return {
      kind: "error",
      message: message || "The order could not be created. Please check values and try again.",
      orderId: ""
    };
  }

  return {
    kind: "idle",
    message: "",
    orderId: ""
  };
}

function buildOrdersHref(
  filters: OrdersFilters,
  state?: {
    order_result?: string;
    order_id?: string;
    order_error?: string;
  }
): string {
  const searchParams = new URLSearchParams();

  if (filters.q.trim().length > 0) {
    searchParams.set("q", filters.q.trim());
  }
  if (filters.status.trim().length > 0) {
    searchParams.set("status", filters.status.trim());
  }
  if (filters.partner_id.trim().length > 0) {
    searchParams.set("partner_id", filters.partner_id.trim());
  }

  if (state?.order_result) {
    searchParams.set("order_result", state.order_result);
  }
  if (state?.order_id) {
    searchParams.set("order_id", state.order_id);
  }
  if (state?.order_error) {
    searchParams.set("order_error", state.order_error.slice(0, 280));
  }

  const serialized = searchParams.toString();
  return serialized.length > 0 ? `/b2b/orders?${serialized}` : "/b2b/orders";
}

function hasOrderFilters(filters: OrdersFilters): boolean {
  return filters.q.length > 0 || filters.status.length > 0 || filters.partner_id.length > 0;
}

function readFilterValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function readFormValue(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function readOptionalFormValue(value: FormDataEntryValue | null): string | undefined {
  const trimmed = readFormValue(value);
  return trimmed.length > 0 ? trimmed : undefined;
}

function readOptionalPositiveNumber(value: FormDataEntryValue | null): number | undefined | null {
  const raw = readFormValue(value);

  if (raw.length === 0) {
    return undefined;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.trunc(parsed);
}

function readRequiredPositiveNumber(value: FormDataEntryValue | null): number | null {
  const raw = readFormValue(value);
  if (raw.length === 0) {
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function statusTone(status: string): "good" | "warning" | "danger" | "neutral" {
  const normalized = status.toLowerCase();

  if (normalized === "completed" || normalized === "delivered" || normalized === "paid") {
    return "good";
  }

  if (
    normalized === "new" ||
    normalized === "pending" ||
    normalized === "queued" ||
    normalized === "in_progress"
  ) {
    return "warning";
  }

  if (normalized === "cancelled" || normalized === "failed" || normalized === "rejected") {
    return "danger";
  }

  return "neutral";
}

function formatOrderTimestamp(order: B2bOrderResource): string {
  const value = order.requested_at ?? order.created_at ?? order.updated_at;
  return value ? value : "Timestamp unavailable";
}

function formatOrderAmount(order: B2bOrderResource): string {
  const amount =
    typeof order.total_amount === "number" && Number.isFinite(order.total_amount)
      ? order.total_amount
      : typeof order.unit_price === "number" && Number.isFinite(order.unit_price)
        ? order.unit_price
        : null;

  if (amount === null) {
    return "Not specified";
  }

  const currency = order.currency?.trim();
  return `${currency && currency.length > 0 ? `${currency} ` : ""}${amount.toFixed(2)}`;
}

function buildOrderErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return `The B2B API responded with an error: ${error.message}`;
  }

  return "Unable to place the order right now. Please try again in a moment.";
}

function describePageWindow(limit: number, offset: number, total: number, noun: string): string {
  if (total === 0) {
    return `0 ${noun}`;
  }

  const from = Math.min(total, offset + 1);
  const to = Math.min(total, offset + limit);
  return `${from}-${to} of ${total} ${noun}`;
}
