import { AppShell } from "@/app/components/app-shell";
import { EmptyState, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchCopilotContext, fetchCopilotConversations, fetchCopilotMessages } from "@/app/lib/api/copilot";

export const dynamic = "force-dynamic";

export default async function CopilotPage() {
  const conversationsResult = await loadConversations();

  if (conversationsResult.kind === "error") {
    return (
      <AppShell activePath="/copilot" eyebrow="Clinical copilot" title="Copilot Panel">
        <Panel className="wide-panel" title="Copilot unavailable">
          <EmptyState title="Unable to load copilot" description={conversationsResult.message} />
        </Panel>
      </AppShell>
    );
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
