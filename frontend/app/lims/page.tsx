import { AppShell } from "@/app/components/app-shell";
import { EmptyState, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchLimsSamples } from "@/app/lib/api/lims";

export const dynamic = "force-dynamic";

export default async function LimsPage() {
  const result = await loadSamples();

  return (
    <AppShell activePath="/lims" eyebrow="Lab operations" title="LIMS Workbench">
      <section className="wide-grid">
        <Panel className="wide-panel" meta="Sample collection + verification" title="Sample Status Tracking">
          {result.kind === "ok" ? (
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
          ) : (
            <EmptyState title="Unable to load samples" description={result.message} />
          )}
        </Panel>

        <Panel title="Verification Workflow">
          <div className="timeline">
            <div>
              <strong>Barcode/accession generation</strong>
              <span>Sample creation API issues accession numbers automatically.</span>
            </div>
            <div>
              <strong>Status tracking API</strong>
              <span>Collection, processing, and verification states are updated through status endpoint.</span>
            </div>
            <div>
              <strong>Technician workbench</strong>
              <span>Workbench view exposes pending verification items to lab staff.</span>
            </div>
          </div>
        </Panel>
      </section>
    </AppShell>
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
