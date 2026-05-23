import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type PatientPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type PatientPaginatedResponse<TItem> = {
  items: TItem[];
  page: PatientPagination;
};

export type PatientsQuery = {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

export type PatientResource = {
  id: string;
  registration_id: string;
  full_name: string;
  age: number;
  sex: string;
  primary_condition: string;
  status: string;
  created_at: string;
};

export type VisitResource = {
  id: string;
  patient_id: string;
  visit_type: string;
  status: string;
  scheduled_at: string;
  created_at: string;
};

export type TimelineEventResource = {
  id: string;
  patient_id: string;
  event_type: string;
  description: string;
  created_at: string;
};

export async function fetchPatients(
  query: PatientsQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<PatientPaginatedResponse<PatientResource>> {
  const response = await apiClient.get<PatientPaginatedResponse<PatientResource>>(
    `/patients${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchPatientVisits(
  patientId: string,
  query: { status?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<PatientPaginatedResponse<VisitResource>> {
  const response = await apiClient.get<PatientPaginatedResponse<VisitResource>>(
    `/patients/${patientId}/visits${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchPatientTimeline(
  patientId: string,
  query: { event_type?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<PatientPaginatedResponse<TimelineEventResource>> {
  const response = await apiClient.get<PatientPaginatedResponse<TimelineEventResource>>(
    `/patients/${patientId}/timeline${toQueryString(query)}`,
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
