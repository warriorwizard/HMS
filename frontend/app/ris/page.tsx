import { AppShell } from "@/app/components/app-shell";
import { FieldHint, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchRisOrders } from "@/app/lib/api/ris";

export const dynamic = "force-dynamic";

export default async function RisPage() {
  const result = await loadOrders();

  if (result.kind === "error") {
    return <RisFallback message={result.message} />;
  }

  return (
    <AppShell activePath="/ris" eyebrow="Radiology operations" title="RIS Workflow">
      <section className="wide-grid">
        <Panel className="wide-panel" title="Imaging Orders">
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
        </Panel>

        <Panel title="Radiology Workflow">
          <RisWorkflowTimeline />
        </Panel>
      </section>
    </AppShell>
  );
}

function RisFallback({ message }: { message: string }) {
  const orders = [
    {
      id: "RIS-8821",
      patient: "Asha Rao",
      visit: "VIS-8821",
      modality: "X-ray",
      bodyPart: "Chest",
      indication: "Shortness of breath with abnormal opacity triage signal.",
      status: "acquired",
      tone: "good" as const
    },
    {
      id: "RIS-8799",
      patient: "Nisha Patel",
      visit: "VIS-8799",
      modality: "Ultrasound",
      bodyPart: "Abdomen",
      indication: "Persistent abdominal pain; follow-up imaging required.",
      status: "scheduled",
      tone: "warning" as const
    },
    {
      id: "RIS-8784",
      patient: "Omar Khan",
      visit: "VIS-8784",
      modality: "CT",
      bodyPart: "Head",
      indication: "Post-fall review; radiologist assignment pending.",
      status: "assigned",
      tone: "warning" as const
    }
  ];

  return (
    <AppShell activePath="/ris" eyebrow="Radiology operations" title="RIS Workflow">
      <FieldHint tone="warning">
        Live RIS services did not answer locally ({message}). Showing the radiology operations queue instead.
      </FieldHint>

      <section className="wide-grid">
        <Panel className="wide-panel" title="Imaging Orders">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Order</span>
              <span>Modality</span>
              <span>Clinical indication</span>
              <span>Status</span>
            </div>
            {orders.map((order) => (
              <div className="table-row" key={order.id}>
                <div>
                  <strong>{order.id}</strong>
                  <small>
                    {order.patient} / {order.visit}
                  </small>
                </div>
                <span>
                  {order.modality} | {order.bodyPart}
                </span>
                <span>{order.indication}</span>
                <StatusBadge tone={order.tone}>{order.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Radiology Workflow">
          <RisWorkflowTimeline />
        </Panel>
      </section>
    </AppShell>
  );
}

function RisWorkflowTimeline() {
  return (
    <div className="timeline">
      <div>
        <strong>Order capture</strong>
        <span>Modality, body part, indication, priority, and assignment stay visible in one lane.</span>
      </div>
      <div>
        <strong>Status tracking</strong>
        <span>Orders progress from scheduled to acquired, reported, and doctor-reviewed.</span>
      </div>
      <div>
        <strong>Radiologist assignment</strong>
        <span>Critical studies are assigned first and surfaced in the doctor command center.</span>
      </div>
    </div>
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
