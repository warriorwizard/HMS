import { AppShell } from "@/app/components/app-shell";
import { Panel, RiskBadge, StatusBadge } from "@/app/components/workspace-ui";
import { reports } from "@/app/lib/workspace-data";

export default function ReportsPage() {
  return (
    <AppShell activePath="/reports" eyebrow="Reports and imaging" title="Report Intake">
      <section className="split-grid">
        <Panel className="wide-panel" meta={`${reports.length} pending`} title="Uploaded Reports">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Report</span>
              <span>Patient</span>
              <span>Status</span>
              <span>Turnaround</span>
              <span>Risk</span>
            </div>
            {reports.map((report) => (
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
            ))}
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
