import Link from "next/link";

import { AppShell } from "@/app/components/app-shell";
import { ActionBar, EmptyState, MetricGrid, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchAiResults } from "@/app/lib/api/ai-intelligence";
import { fetchCommandCenterQueue } from "@/app/lib/api/command-center";
import { commandMetrics, queueItems, type Metric } from "@/app/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const [queueResult, aiResult] = await Promise.all([loadQueue(), loadAiResults()]);

  if (queueResult.kind === "error" && aiResult.kind === "error") {
    return <CommandCenterFallback />;
  }

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

function CommandCenterFallback() {
  return (
    <AppShell activePath="/doctor/command-center" eyebrow="Today" title="Doctor command center">
      <MetricGrid metrics={commandMetrics} />

      <section className="main-grid">
        <Panel className="queue-panel" meta="Highest risk first" title="Priority Queue">
          <div className="queue-list">
            {queueItems.map((item) => (
              <div className="queue-row" key={item.patient}>
                <div>
                  <strong>{item.patient}</strong>
                  <span>{item.visit}</span>
                </div>
                <span className={`risk ${item.risk.toLowerCase()}`}>{item.risk}</span>
                <div>
                  <span>{item.status}</span>
                  <small>Due {item.due}</small>
                </div>
                <div>
                  <span>{item.owner}</span>
                  <small>{item.signal}</small>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel meta="Clinical decision support" title="AI Intelligence">
          <div className="signal-list">
            <div>
              <strong>Pulmonary opacity flagged</strong>
              <span>Chest X-ray signal mapped to prior report trend and elevated care urgency.</span>
            </div>
            <div>
              <strong>Inflammation trend rising</strong>
              <span>CBC and CRP trajectory suggests follow-up priority before discharge.</span>
            </div>
            <div>
              <strong>Missed follow-up risk</strong>
              <span>Care desk should contact patient before the current outreach SLA closes.</span>
            </div>
          </div>
        </Panel>

        <Panel className="insight-panel" meta="Review workflow" title="Recommendation & Approval Flow">
          <p>
            Doctors keep final responsibility. AI cues prioritize the worklist, expose rationale, and keep
            approval actions auditable.
          </p>
          <ActionBar>
            <Link className="button-link" href="/reports">
              Review reports
            </Link>
            <Link className="button-link secondary" href="/workflow">
              Open workflow
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
