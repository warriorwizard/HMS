import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type B2bPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type B2bPaginatedResponse<TItem> = {
  items: TItem[];
  page: B2bPagination;
};

export type B2bPartnersQuery = {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

export type B2bPartnerResource = {
  id: string;
  name: string;
  status: string;
  partner_code?: string;
  category?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
};

export type B2bPricingRulesQuery = {
  q?: string;
  status?: string;
  partner_id?: string;
  limit?: number;
  offset?: number;
};

export type B2bPricingRuleResource = {
  id: string;
  partner_id: string;
  rule_name?: string;
  status: string;
  price_list?: string;
  test_code?: string;
  test_name?: string;
  modality?: string;
  currency?: string;
  amount?: number;
  discount_percent?: number;
  effective_from?: string;
  effective_to?: string;
  created_at?: string;
  updated_at?: string;
};

export type B2bOrdersQuery = {
  q?: string;
  status?: string;
  partner_id?: string;
  limit?: number;
  offset?: number;
};

export type B2bOrderResource = {
  id: string;
  partner_id: string;
  status: string;
  partner_name?: string;
  patient_name?: string;
  patient_id?: string;
  test_code?: string;
  test_name?: string;
  quantity?: number;
  unit_price?: number;
  total_amount?: number;
  currency?: string;
  notes?: string;
  requested_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type B2bCreateOrderPayload = {
  partner_id: string;
  po_number: string;
  status: string;
  total_amount: number;
  currency: string;
  patient_name?: string;
  patient_id?: string;
  test_code?: string;
  test_name?: string;
  quantity?: number;
  unit_price?: number;
  notes?: string;
  requested_at?: string;
};

export type B2bBillingSummaryQuery = {
  q?: string;
  status?: string;
  partner_id?: string;
  limit?: number;
  offset?: number;
};

export type B2bBillingSummaryResource = {
  id: string;
  partner_id: string;
  status: string;
  partner_name?: string;
  currency?: string;
  invoice_count?: number;
  order_count?: number;
  gross_amount?: number;
  net_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  period_start?: string;
  period_end?: string;
  updated_at?: string;
};

export async function fetchB2bPartners(
  query: B2bPartnersQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<B2bPaginatedResponse<B2bPartnerResource>> {
  const response = await apiClient.get<B2bPaginatedResponse<B2bPartnerResource>>(
    `/b2b/partners${toQueryString(query)}`,
    options
  );

  return response.data;
}

export async function fetchB2bPricingRules(
  query: B2bPricingRulesQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<B2bPaginatedResponse<B2bPricingRuleResource>> {
  const response = await apiClient.get<B2bPaginatedResponse<B2bPricingRuleResource>>(
    `/b2b/pricing-rules${toQueryString(query)}`,
    options
  );

  return response.data;
}

export async function fetchB2bOrders(
  query: B2bOrdersQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<B2bPaginatedResponse<B2bOrderResource>> {
  const response = await apiClient.get<B2bPaginatedResponse<B2bOrderResource>>(
    `/b2b/orders${toQueryString(query)}`,
    options
  );

  return response.data;
}

export async function createB2bOrder(
  payload: B2bCreateOrderPayload,
  options: ApiRequestOptions<B2bCreateOrderPayload> = {}
): Promise<B2bOrderResource> {
  const response = await apiClient.post<B2bOrderResource, B2bCreateOrderPayload>(
    "/b2b/orders",
    payload,
    options
  );

  return response.data;
}

export async function fetchB2bBillingSummary(
  query: B2bBillingSummaryQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<B2bPaginatedResponse<B2bBillingSummaryResource>> {
  const response = await apiClient.get<B2bPaginatedResponse<B2bBillingSummaryResource>>(
    `/b2b/billing-summary${toQueryString(query)}`,
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
