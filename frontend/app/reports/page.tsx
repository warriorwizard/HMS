import { AppShell } from "@/app/components/app-shell";
import { EmptyState, FieldHint, Panel, RiskBadge, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchReportProcessingJobs, fetchReports, type ReportResource } from "@/app/lib/api/reports";
import { reports as demoReports } from "@/app/lib/workspace-data";

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
    return <ReportsFallback message={reportsResult.message} query={query} />;
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

function ReportsFallback({ query, message }: { query: string; message: string }) {
  const normalizedQuery = query.toLowerCase();
  const filteredReports = normalizedQuery
    ? demoReports.filter((report) =>
        [report.id, report.patient, report.type, report.source, report.status, report.risk]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : demoReports;

  return (
    <AppShell activePath="/reports" eyebrow="Reports and imaging" title="Report Intake">
      <form action="/reports" className="toolbar">
        <label>
          <span>Search reports</span>
          <input
            defaultValue={query}
            name="q"
            placeholder="Report ID, patient, modality, status"
            type="search"
          />
          <FieldHint>Filter report intake by patient, source, risk, or current processing state.</FieldHint>
        </label>
      </form>

      <FieldHint tone="warning">
        Live report services did not answer locally ({message}). Showing the hospital operations workspace instead.
      </FieldHint>

      <section className="split-grid">
        <Panel className="wide-panel" meta={`${filteredReports.length} active reports`} title="Uploaded Reports">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Report</span>
              <span>Patient</span>
              <span>Status</span>
              <span>Risk</span>
              <span>Turnaround</span>
            </div>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div className="table-row" key={report.id}>
                  <div>
                    <strong>{report.type}</strong>
                    <small>{report.id} | {report.source}</small>
                  </div>
                  <span>{report.patient}</span>
                  <StatusBadge tone={statusTone(report.status)}>{report.status}</StatusBadge>
                  <RiskBadge risk={report.risk} />
                  <span>{report.turnaround}</span>
                </div>
              ))
            ) : (
              <EmptyState
                title="No reports found"
                description={`No reports match "${query}". Try patient, source, or risk.`}
              />
            )}
          </div>
        </Panel>

        <Panel title="Processing Jobs">
          <div className="signal-list">
            <div>
              <strong>OCR extraction</strong>
              <span>RPT-8221 | running | chest X-ray text and impression extraction.</span>
              <StatusBadge tone="warning">Running</StatusBadge>
            </div>
            <div>
              <strong>AI pre-triage</strong>
              <span>RPT-8215 | queued | lab trend summary waiting for doctor approval.</span>
              <StatusBadge tone="warning">Queued</StatusBadge>
            </div>
            <div>
              <strong>Doctor sign-off</strong>
              <span>RPT-8199 | ready | imaging report available for consultant review.</span>
              <StatusBadge tone="good">Ready</StatusBadge>
            </div>
          </div>
        </Panel>
      </section>

      <section className="main-grid compact-top">
        <Panel title="Upload Controls">
          <div className="rule-list">
            <label>
              <input defaultChecked type="checkbox" />
              Capture patient, visit, department, modality, and storage key before queueing.
            </label>
            <label>
              <input defaultChecked type="checkbox" />
              Route critical radiology and pathology reports directly to command center.
            </label>
            <label>
              <input defaultChecked type="checkbox" />
              Keep original file, extracted text, AI summary, and doctor decision auditable.
            </label>
          </div>
        </Panel>

        <Panel title="Clinical Review Contract">
          <div className="timeline">
            <div>
              <strong>1. Intake</strong>
              <span>Technician uploads report and validates patient/visit mapping.</span>
            </div>
            <div>
              <strong>2. AI assist</strong>
              <span>Extraction, abnormality flags, and concise summary are generated as support only.</span>
            </div>
            <div>
              <strong>3. Doctor approval</strong>
              <span>Final report status changes only after human sign-off with audit trail.</span>
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
