import Link from "next/link";

import { AppShell } from "@/app/components/app-shell";
import { ActionBar, EmptyState, MetricGrid, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchAiResults } from "@/app/lib/api/ai-intelligence";
import { fetchCommandCenterQueue } from "@/app/lib/api/command-center";
import type { Metric } from "@/app/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const [queueResult, aiResult] = await Promise.all([loadQueue(), loadAiResults()]);

  const metrics: Metric[] = [
    {
      label: "Priority queue",
      value: queueResult.kind === "ok" ? String(queueResult.items.length) : "0",
      trend: queueResult.kind === "ok" ? `${queueResult.page.total} total items` : "Queue unavailable"
    },
    {
      label: "Critical cases",
      value:
        queueResult.kind === "ok"
          ? String(queueResult.items.filter((item) => item.priority === "critical").length)
          : "0",
      trend: "Doctor review focus"
    },
    {
      label: "AI analyses",
      value: aiResult.kind === "ok" ? String(aiResult.items.length) : "0",
      trend: aiResult.kind === "ok" ? `${aiResult.page.total} AI result records` : "AI unavailable"
    },
    {
      label: "High risk",
      value:
        aiResult.kind === "ok"
          ? String(aiResult.items.filter((item) => item.risk_score >= 0.6).length)
          : "0",
      trend: "Rule-based risk scoring"
    }
  ];

  return (
    <AppShell activePath="/doctor/command-center" eyebrow="Today" title="Doctor command center">
      <MetricGrid metrics={metrics} />

      <section className="main-grid">
        <Panel className="queue-panel" meta="Priority queue table" title="Priority Queue">
          {queueResult.kind === "ok" ? (
            <div className="queue-list">
              {queueResult.items.map((item) => (
                <div className="queue-row" key={item.id}>
                  <div>
                    <strong>{item.patient_id}</strong>
                    <span>{item.report_id}</span>
                  </div>
                  <StatusBadge tone={priorityTone(item.priority)}>{item.priority}</StatusBadge>
                  <div>
                    <span>{item.status.replaceAll("_", " ")}</span>
                    <small>Due {item.due_at}</small>
                  </div>
                  <div>
                    <span>{item.owner}</span>
                    <small>{item.recommendation}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Unable to load queue" description={queueResult.message} />
          )}
        </Panel>

        <Panel meta="Explainability payload" title="AI Intelligence">
          {aiResult.kind === "ok" ? (
            <div className="signal-list">
              {aiResult.items.map((item) => (
                <div key={item.id}>
                  <strong>
                    {item.report_id} | risk {(item.risk_score * 100).toFixed(0)}%
                  </strong>
                  <span>{item.summary}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Unable to load AI results" description={aiResult.message} />
          )}
        </Panel>

        <Panel className="insight-panel" meta="Review workflow" title="Recommendation & Approval Flow">
          <p>
            Queue actions are exposed through doctor review and recommendation approval APIs, with auditable
            status transitions for every patient decision.
          </p>
          <ActionBar>
            <Link className="button-link" href="/ai-intelligence">
              View AI intelligence
            </Link>
            <Link className="button-link secondary" href="/copilot">
              Open copilot panel
            </Link>
          </ActionBar>
        </Panel>
      </section>
    </AppShell>
  );
}

async function loadQueue() {
  try {
    return { kind: "ok" as const, ...(await fetchCommandCenterQueue({ limit: 20 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error)
        ? `The command center API responded with: ${error.message}`
        : "Command center API unavailable."
    };
  }
}

async function loadAiResults() {
  try {
    return { kind: "ok" as const, ...(await fetchAiResults({ limit: 20 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error) ? `The AI API responded with: ${error.message}` : "AI API unavailable."
    };
  }
}

function priorityTone(priority: string): "good" | "warning" | "danger" | "neutral" {
  const value = priority.toLowerCase();
  if (value === "critical") {
    return "danger";
  }
  if (value === "high") {
    return "warning";
  }
  if (value === "low") {
    return "good";
  }
  return "neutral";
}
