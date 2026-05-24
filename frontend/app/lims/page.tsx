import { AppShell } from "@/app/components/app-shell";
import { FieldHint, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchLimsSamples } from "@/app/lib/api/lims";

export const dynamic = "force-dynamic";

export default async function LimsPage() {
  const result = await loadSamples();

  if (result.kind === "error") {
    return <LimsFallback message={result.message} />;
  }

  return (
    <AppShell activePath="/lims" eyebrow="Lab operations" title="LIMS Workbench">
      <section className="wide-grid">
        <Panel className="wide-panel" meta="Sample collection + verification" title="Sample Status Tracking">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Accession</span>
              <span>Patient / Visit</span>
              <span>Sample</span>
              <span>Status</span>
            </div>
            {result.items.map((sample) => (
              <div className="table-row" key={sample.id}>
                <div>
                  <strong>{sample.accession_number}</strong>
                  <small>{sample.id}</small>
                </div>
                <span>
                  {sample.patient_id} / {sample.visit_id}
                </span>
                <span>{sample.sample_type}</span>
                <StatusBadge tone={sample.status.includes("pending") ? "warning" : "good"}>
                  {sample.status.replaceAll("_", " ")}
                </StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Verification Workflow">
          <LimsWorkflowTimeline />
        </Panel>
      </section>
    </AppShell>
  );
}

function LimsFallback({ message }: { message: string }) {
  const samples = [
    {
      id: "SMP-1042",
      accession: "LAB-24-8221",
      patient: "Asha Rao",
      visit: "VIS-8821",
      sample: "Blood + sputum",
      status: "pending verification",
      tone: "warning" as const
    },
    {
      id: "SMP-1038",
      accession: "LAB-24-8215",
      patient: "Kiran Mehta",
      visit: "VIS-8815",
      sample: "CBC + CRP",
      status: "processing",
      tone: "warning" as const
    },
    {
      id: "SMP-1009",
      accession: "LAB-24-8190",
      patient: "Omar Khan",
      visit: "VIS-8790",
      sample: "Diabetes panel",
      status: "verified",
      tone: "good" as const
    }
  ];

  return (
    <AppShell activePath="/lims" eyebrow="Lab operations" title="LIMS Workbench">
      <FieldHint tone="warning">
        Live LIMS services did not answer locally ({message}). Showing the lab operations workbench instead.
      </FieldHint>

      <section className="wide-grid">
        <Panel className="wide-panel" meta="Sample collection + verification" title="Sample Status Tracking">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Accession</span>
              <span>Patient / Visit</span>
              <span>Sample</span>
              <span>Status</span>
            </div>
            {samples.map((sample) => (
              <div className="table-row" key={sample.id}>
                <div>
                  <strong>{sample.accession}</strong>
                  <small>{sample.id}</small>
                </div>
                <span>
                  {sample.patient} / {sample.visit}
                </span>
                <span>{sample.sample}</span>
                <StatusBadge tone={sample.tone}>{sample.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Verification Workflow">
          <LimsWorkflowTimeline />
        </Panel>
      </section>
    </AppShell>
  );
}

function LimsWorkflowTimeline() {
  return (
    <div className="timeline">
      <div>
        <strong>Barcode/accession generation</strong>
        <span>Sample creation issues accession numbers and binds tubes to patient and visit.</span>
      </div>
      <div>
        <strong>Status tracking</strong>
        <span>Collection, processing, verification, and rejection states stay visible to technicians.</span>
      </div>
      <div>
        <strong>Critical escalation</strong>
        <span>Abnormal or delayed samples route into workflow and command center queues.</span>
      </div>
    </div>
  );
}

async function loadSamples() {
  try {
    return { kind: "ok" as const, ...(await fetchLimsSamples({ limit: 20 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error) ? `The LIMS API responded with: ${error.message}` : "LIMS API unavailable."
    };
  }
}
