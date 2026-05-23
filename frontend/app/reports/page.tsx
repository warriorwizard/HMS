import { AppShell } from "@/app/components/app-shell";
import { EmptyState, FieldHint, Panel, RiskBadge, StatusBadge } from "@/app/components/workspace-ui";
import { reports } from "@/app/lib/workspace-data";

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
  const normalizedQuery = query.toLowerCase();
  const filteredReports = normalizedQuery
    ? reports.filter((report) =>
        [report.id, report.patient, report.type, report.source, report.status, report.turnaround, report.risk]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : reports;
  const recordsMeta = normalizedQuery
    ? `${filteredReports.length} of ${reports.length} pending`
    : `${reports.length} pending`;

  return (
    <AppShell activePath="/reports" eyebrow="Reports and imaging" title="Report Intake">
      <form action="/reports" className="toolbar">
        <label>
          <span>Search reports</span>
          <input
            defaultValue={query}
            name="q"
            placeholder="Report ID, patient, source, or status"
            type="search"
          />
          <FieldHint>Filter by patient, report type, source, or workflow status.</FieldHint>
        </label>
      </form>

      <section className="split-grid">
        <Panel className="wide-panel" meta={recordsMeta} title="Uploaded Reports">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Report</span>
              <span>Patient</span>
              <span>Status</span>
              <span>Turnaround</span>
              <span>Risk</span>
            </div>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div className="table-row" key={report.id}>
                  <div>
                    <strong>{report.type}</strong>
                    <small>
                      {report.id} | {report.source}
                    </small>
                  </div>
                  <span>{report.patient}</span>
                  <StatusBadge tone={report.status.includes("doctor") ? "warning" : "neutral"}>
                    {report.status}
                  </StatusBadge>
                  <span>{report.turnaround}</span>
                  <RiskBadge risk={report.risk} />
                </div>
              ))
            ) : (
              <EmptyState
                title="No reports found"
                description={
                  query
                    ? `No uploaded reports match "${query}". Try another search value.`
                    : "No reports are available right now."
                }
              />
            )}
          </div>
        </Panel>

        <Panel title="Upload Workbench">
          <div className="upload-box">
            <strong>Drop study files here</strong>
            <span>DICOM, PDF, JPG, PNG, CSV, and lab exports</span>
            <button type="button">Choose files</button>
          </div>
          <div className="checklist">
            <StatusBadge tone="good">Tenant tag required</StatusBadge>
            <StatusBadge tone="good">Patient match required</StatusBadge>
            <StatusBadge tone="warning">Doctor sign-off required</StatusBadge>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
