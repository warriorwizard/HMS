import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type BillingPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type BillingPaginatedResponse<TItem> = {
  items: TItem[];
  page: BillingPagination;
};

export type BillingServiceResource = {
  id: string;
  code: string;
  name: string;
  department: string;
  base_price: number;
  currency: string;
  status: string;
};

export type BillingOrderResource = {
  id: string;
  patient_id: string;
  visit_id: string;
  service_id: string;
  quantity: number;
  discount_percent: number;
  package_name?: string | null;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
};

export type BillingInvoiceLineResource = {
  id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  line_total: number;
};

export type BillingInvoiceResource = {
  id: string;
  order_id: string;
  patient_id: string;
  status: string;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  lines: BillingInvoiceLineResource[];
  created_at: string;
};

export type BillingPaymentResource = {
  id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  received_at: string;
};

export async function fetchBillingServices(
  query: { status?: string; department?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<BillingPaginatedResponse<BillingServiceResource>> {
  const response = await apiClient.get<BillingPaginatedResponse<BillingServiceResource>>(
    `/billing/services${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchBillingOrders(
  query: { q?: string; status?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<BillingPaginatedResponse<BillingOrderResource>> {
  const response = await apiClient.get<BillingPaginatedResponse<BillingOrderResource>>(
    `/billing/orders${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchBillingInvoices(
  query: { q?: string; status?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<BillingPaginatedResponse<BillingInvoiceResource>> {
  const response = await apiClient.get<BillingPaginatedResponse<BillingInvoiceResource>>(
    `/billing/invoices${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchBillingPayments(
  query: { status?: string; method?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<BillingPaginatedResponse<BillingPaymentResource>> {
  const response = await apiClient.get<BillingPaginatedResponse<BillingPaymentResource>>(
    `/billing/payments${toQueryString(query)}`,
    options
  );
  return response.data;
}

function toQueryString(query: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(query)) {
    if (typeof rawValue === "number") {
      if (Number.isFinite(rawValue)) {
        searchParams.set(key, String(rawValue));
      }
      continue;
    }

    if (typeof rawValue === "string") {
      const trimmed = rawValue.trim();
      if (trimmed.length > 0) {
        searchParams.set(key, trimmed);
      }
    }
  }

  const serialized = searchParams.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
}
