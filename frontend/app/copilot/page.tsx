import { AppShell } from "@/app/components/app-shell";
import { EmptyState, FieldHint, Panel, RiskBadge, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchCopilotContext, fetchCopilotConversations, fetchCopilotMessages } from "@/app/lib/api/copilot";
import { patients as demoPatients, reports as demoReports } from "@/app/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function CopilotPage() {
  const conversationsResult = await loadConversations();

  if (conversationsResult.kind === "error") {
    return <CopilotFallback message={conversationsResult.message} />;
  }

  const activeConversation = conversationsResult.items[0] ?? null;
  const [messagesResult, contextResult] = activeConversation
    ? await Promise.all([
        loadMessages(activeConversation.id),
        loadContext(activeConversation.patient_id, activeConversation.report_id ?? undefined)
      ])
    : [null, null];

  return (
    <AppShell activePath="/copilot" eyebrow="Clinical copilot" title="Copilot Panel">
      <section className="main-grid">
        <Panel className="queue-panel" title="Conversations">
          <div className="signal-list">
            {conversationsResult.items.map((conversation) => (
              <div key={conversation.id}>
                <strong>{conversation.title}</strong>
                <span>
                  {conversation.patient_id} {conversation.report_id ? `| ${conversation.report_id}` : ""}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Messages">
          {messagesResult?.kind === "ok" ? (
            <div className="timeline">
              {messagesResult.items.map((message) => (
                <div key={message.id}>
                  <strong>{message.role}</strong>
                  <span>{message.content}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No messages"
              description={messagesResult?.kind === "error" ? messagesResult.message : "No active conversation."}
            />
          )}
        </Panel>

        <Panel className="insight-panel" title="Patient / Report Context">
          {contextResult?.kind === "ok" ? (
            <div className="timeline">
              <div>
                <strong>{contextResult.data.patient_id}</strong>
                <span>{contextResult.data.report_id ?? "No report selected"}</span>
              </div>
              <div>
                <strong>Context summary</strong>
                <span>{contextResult.data.context_summary}</span>
              </div>
              <div>
                <strong>Doctor assistance</strong>
                <span>Progression summary and note draft APIs are available for this context.</span>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Context unavailable"
              description={contextResult?.kind === "error" ? contextResult.message : "No context selected."}
            />
          )}
          <StatusBadge tone="good">Copilot side panel enabled</StatusBadge>
        </Panel>
      </section>
    </AppShell>
  );
}

function CopilotFallback({ message }: { message: string }) {
  const patient = demoPatients[0];
  const report = demoReports[0];

  return (
    <AppShell activePath="/copilot" eyebrow="Clinical copilot" title="Copilot Panel">
      <FieldHint tone="warning">
        Live copilot services did not answer locally ({message}). Showing the safe clinical assist workspace instead.
      </FieldHint>

      <section className="main-grid">
        <Panel className="queue-panel" title="Conversations">
          <div className="signal-list">
            <div>
              <strong>{patient.name} escalation review</strong>
              <span>{patient.id} | {report.id} | doctor sign-off required.</span>
              <RiskBadge risk={patient.risk} />
            </div>
            <div>
              <strong>Kiran Mehta lab progression</strong>
              <span>TAR-P-1038 | RPT-8215 | trend comparison and summary draft.</span>
              <RiskBadge risk="High" />
            </div>
            <div>
              <strong>Nisha Patel follow-up</strong>
              <span>TAR-P-1021 | RPT-8199 | care desk callback note.</span>
              <RiskBadge risk="Moderate" />
            </div>
          </div>
        </Panel>

        <Panel title="Messages">
          <div className="timeline">
            <div>
              <strong>Doctor</strong>
              <span>Summarize the imaging concern and compare it with the latest visit notes.</span>
            </div>
            <div>
              <strong>Copilot</strong>
              <span>
                Asha Rao has a critical chest X-ray triage signal. Source-linked summary is ready for doctor review.
              </span>
            </div>
            <div>
              <strong>Guardrail</strong>
              <span>Do not release a diagnosis or patient message without explicit clinician approval.</span>
            </div>
          </div>
        </Panel>

        <Panel className="insight-panel" title="Patient / Report Context">
          <div className="timeline">
            <div>
              <strong>{patient.name}</strong>
              <span>
                {patient.id} | {patient.age}/{patient.sex} | {patient.condition}
              </span>
            </div>
            <div>
              <strong>{report.type}</strong>
              <span>{report.status} | source {report.source} | turnaround {report.turnaround}</span>
            </div>
            <div>
              <strong>Doctor assistance</strong>
              <span>Progression summary, next-step draft, and patient-safe explanation are staged for approval.</span>
            </div>
          </div>
          <StatusBadge tone="good">Copilot side panel enabled</StatusBadge>
        </Panel>
      </section>
    </AppShell>
  );
}

async function loadConversations() {
  try {
    return { kind: "ok" as const, ...(await fetchCopilotConversations({ limit: 20 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error)
        ? `The copilot API responded with: ${error.message}`
        : "Copilot API unavailable."
    };
  }
}

async function loadMessages(conversationId: string) {
  try {
    return { kind: "ok" as const, ...(await fetchCopilotMessages(conversationId, { limit: 30 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error)
        ? `The copilot messages API responded with: ${error.message}`
        : "Copilot messages unavailable."
    };
  }
}

async function loadContext(patientId: string, reportId?: string) {
  try {
    return { kind: "ok" as const, data: await fetchCopilotContext(patientId, reportId) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error)
        ? `The copilot context API responded with: ${error.message}`
        : "Copilot context unavailable."
    };
  }
}
