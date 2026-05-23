export { createApiClient, apiClient } from "./client";
export type { ApiClient } from "./client";
export { getApiBaseUrl, joinApiUrl } from "./config";
export { ApiError, isApiError, normalizeApiError } from "./errors";
export { fetchAdminMemberships, fetchAdminTenants } from "./admin";
export {
  createB2bOrder,
  fetchB2bBillingSummary,
  fetchB2bOrders,
  fetchB2bPartners,
  fetchB2bPricingRules
} from "./b2b";
export { fetchCrmCampaigns, fetchCrmLeads, fetchCrmReminders } from "./crm";
export { fetchHealth, fetchSystemInfo } from "./system";
export type {
  AdminMembershipResource,
  AdminMembershipRoleSummary,
  AdminMembershipTenantSummary,
  AdminMembershipUserSummary,
  AdminMembershipsQuery,
  AdminPaginatedResponse,
  AdminPagination,
  AdminTenantResource,
  AdminTenantsQuery
} from "./admin";
export type {
  B2bBillingSummaryQuery,
  B2bBillingSummaryResource,
  B2bCreateOrderPayload,
  B2bOrderResource,
  B2bOrdersQuery,
  B2bPaginatedResponse,
  B2bPagination,
  B2bPartnerResource,
  B2bPartnersQuery,
  B2bPricingRuleResource,
  B2bPricingRulesQuery
} from "./b2b";
export type {
  CrmCampaignResource,
  CrmCampaignsQuery,
  CrmLeadResource,
  CrmLeadsQuery,
  CrmPaginatedResponse,
  CrmPagination,
  CrmReminderResource,
  CrmRemindersQuery
} from "./crm";
export type { HealthResource, SystemInfoResource } from "./system";
export type { ApiErrorCode } from "./errors";
export type {
  ApiAccessHandler,
  ApiAccessHandlerContext,
  ApiClientConfig,
  ApiMethod,
  ApiRequestOptions,
  ApiResponse,
  ApiResponseMeta,
  JsonObject,
  JsonPrimitive,
  JsonValue
} from "./types";
