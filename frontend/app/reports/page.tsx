import { AppShell } from "@/app/components/app-shell";
import { EmptyState, FieldHint, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchReportProcessingJobs, fetchReports, type ReportResource } from "@/app/lib/api/reports";

type PageSearchParams = Promise<{ q?: string | string[] | undefined }>;

function readQuery(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams?: PageSearchParams;
}) {
  const query = readQuery((await searchParams)?.q);

  const reportsResult = await loadReports(query);
  if (reportsResult.kind === "error") {
    return (
      <AppShell activePath="/reports" eyebrow="Reports and imaging" title="Report Intake">
        <Panel className="wide-panel" title="Reports unavailable">
          <EmptyState title="Unable to load reports" description={reportsResult.message} />
        </Panel>
      </AppShell>
    );
  }

  const jobsResult = await loadJobs();
  const recordsMeta = query
    ? `${reportsResult.items.length} of ${reportsResult.page.total} pending`
    : `${reportsResult.page.total} pending`;

  return (
    <AppShell activePath="/reports" eyebrow="Reports and imaging" title="Report Intake">
      <form action="/reports" className="toolbar">
        <label>
          <span>Search reports</span>
          <input
            defaultValue={query}
            name="q"
            placeholder="Report ID, patient, visit, status"
            type="search"
          />
          <FieldHint>Filter by report metadata and processing status.</FieldHint>
        </label>
      </form>

      <section className="split-grid">
        <Panel className="wide-panel" meta={recordsMeta} title="Uploaded Reports">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Report</span>
              <span>Patient/Visit</span>
              <span>Status</span>
              <span>Storage</span>
              <span>Type</span>
            </div>
            {reportsResult.items.length > 0 ? (
              reportsResult.items.map((report) => (
                <div className="table-row" key={report.id}>
                  <div>
                    <strong>{report.file_name}</strong>
                    <small>{report.id}</small>
                  </div>
                  <div>
                    <strong>{report.patient_id}</strong>
                    <small>{report.visit_id}</small>
                  </div>
                  <StatusBadge tone={statusTone(report.status)}>{report.status}</StatusBadge>
                  <span>{report.storage_key}</span>
                  <span>{report.file_type.toUpperCase()}</span>
                </div>
              ))
            ) : (
              <EmptyState
                title="No reports found"
                description={
                  query
                    ? `No uploaded reports match \"${query}\".`
                    : "No reports are available right now."
                }
              />
            )}
          </div>
        </Panel>

        <Panel title="Processing Jobs">
          {jobsResult.kind === "ok" ? (
            <div className="signal-list">
              {jobsResult.items.map((job) => (
                <div key={job.id}>
                  <strong>{job.stage.replaceAll("_", " ")}</strong>
                  <span>
                    {job.report_id} | {job.status} | {job.extraction_preview}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Jobs unavailable" description={jobsResult.message} />
          )}
        </Panel>
      </section>

      <section className="main-grid compact-top">
        <Panel title="Upload Foundation">
          <div className="rule-list">
            <label>
              <input defaultChecked type="checkbox" />
              Report metadata + file storage key captured
            </label>
            <label>
              <input defaultChecked type="checkbox" />
              Signed upload URL generated through storage adapter
            </label>
            <label>
              <input defaultChecked type="checkbox" />
              Processing job queued with extraction placeholder
            </label>
          </div>
        </Panel>

        <Panel title="Secure Upload Contract">
          <div className="timeline">
            <div>
              <strong>POST /api/v1/reports/uploads</strong>
              <span>Creates metadata record and signed upload URL response.</span>
            </div>
            <div>
              <strong>GET /api/v1/reports/processing-jobs</strong>
              <span>Tracks extraction status lifecycle for technicians and reviewers.</span>
            </div>
            <div>
              <strong>POST /api/v1/reports/:id/extract-text</strong>
              <span>Placeholder extraction endpoint for pipeline integration.</span>
            </div>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

async function loadReports(query: string): Promise<
  | { kind: "ok"; items: ReportResource[]; page: { total: number; limit: number; offset: number } }
  | { kind: "error"; message: string }
> {
  try {
    const data = await fetchReports({ q: query || undefined, limit: 25 });
    return { kind: "ok", items: data.items, page: data.page };
  } catch (error) {
    return {
      kind: "error",
      message: isApiError(error)
        ? `The reports API responded with: ${error.message}`
        : "Reports API is currently unavailable."
    };
  }
}

async function loadJobs() {
  try {
    return { kind: "ok" as const, ...(await fetchReportProcessingJobs({ limit: 10 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error)
        ? `The processing API responded with: ${error.message}`
        : "Processing API is currently unavailable."
    };
  }
}

function statusTone(status: string): "good" | "warning" | "danger" | "neutral" {
  const value = status.toLowerCase();
  if (value.includes("failed")) {
    return "danger";
  }
  if (value.includes("processing") || value.includes("queued") || value.includes("running")) {
    return "warning";
  }
  if (value.includes("uploaded") || value.includes("completed")) {
    return "good";
  }
  return "neutral";
}
