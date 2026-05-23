import { AppShell } from "@/app/components/app-shell";
import { EmptyState, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchRisOrders } from "@/app/lib/api/ris";

export const dynamic = "force-dynamic";

export default async function RisPage() {
  const result = await loadOrders();

  return (
    <AppShell activePath="/ris" eyebrow="Radiology operations" title="RIS Workflow">
      <section className="wide-grid">
        <Panel className="wide-panel" title="Imaging Orders">
          {result.kind === "ok" ? (
            <div className="data-table reports-table">
              <div className="table-row table-head">
                <span>Order</span>
                <span>Modality</span>
                <span>Clinical indication</span>
                <span>Status</span>
              </div>
              {result.items.map((order) => (
                <div className="table-row" key={order.id}>
                  <div>
                    <strong>{order.id}</strong>
                    <small>
                      {order.patient_id} / {order.visit_id}
                    </small>
                  </div>
                  <span>
                    {order.modality} | {order.body_part}
                  </span>
                  <span>{order.clinical_indication}</span>
                  <StatusBadge tone={order.status.includes("scheduled") ? "warning" : "good"}>
                    {order.status.replaceAll("_", " ")}
                  </StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Unable to load RIS orders" description={result.message} />
          )}
        </Panel>

        <Panel title="Radiology Workflow">
          <div className="timeline">
            <div>
              <strong>Order table</strong>
              <span>Includes modality, body part, indication, and assignment fields.</span>
            </div>
            <div>
              <strong>Status tracking</strong>
              <span>Orders progress from scheduled to acquired to reported.</span>
            </div>
            <div>
              <strong>Radiologist assignment</strong>
              <span>Assignment endpoint links each study to a responsible radiologist.</span>
            </div>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

async function loadOrders() {
  try {
    return { kind: "ok" as const, ...(await fetchRisOrders({ limit: 20 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error) ? `The RIS API responded with: ${error.message}` : "RIS API unavailable."
    };
  }
}
