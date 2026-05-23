import { AppShell } from "@/app/components/app-shell";
import { EmptyState, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchAiResults, fetchRiskScore } from "@/app/lib/api/ai-intelligence";

export const dynamic = "force-dynamic";

export default async function AiIntelligencePage() {
  const result = await loadResults();

  if (result.kind === "error") {
    return (
      <AppShell activePath="/ai-intelligence" eyebrow="AI intelligence" title="AI Intelligence">
        <Panel className="wide-panel" title="AI unavailable">
          <EmptyState title="Unable to load AI intelligence" description={result.message} />
        </Panel>
      </AppShell>
    );
  }

  const firstReportId = result.items[0]?.report_id;
  const riskResult = firstReportId ? await loadRisk(firstReportId) : null;

  return (
    <AppShell activePath="/ai-intelligence" eyebrow="AI intelligence" title="AI Intelligence">
      <section className="wide-grid">
        <Panel className="wide-panel" title="AI Results and Explainability">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Report</span>
              <span>Risk</span>
              <span>Status</span>
              <span>Summary</span>
            </div>
            {result.items.map((item) => (
              <div className="table-row" key={item.id}>
                <div>
                  <strong>{item.report_id}</strong>
                  <small>{item.patient_id}</small>
                </div>
                <span>{(item.risk_score * 100).toFixed(0)}%</span>
                <StatusBadge tone={item.status === "completed" ? "good" : "warning"}>{item.status}</StatusBadge>
                <span>{item.summary}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Rule-based risk score">
          {riskResult?.kind === "ok" ? (
            <div className="timeline">
              <div>
                <strong>{riskResult.data.report_id}</strong>
                <span>
                  {riskResult.data.risk_level} ({(riskResult.data.risk_score * 100).toFixed(0)}%)
                </span>
              </div>
              <div>
                <strong>Rationale</strong>
                <span>{riskResult.data.rationale}</span>
              </div>
            </div>
          ) : (
            <EmptyState title="Risk score unavailable" description={riskResult?.message ?? "No reports available."} />
          )}
        </Panel>
      </section>
    </AppShell>
  );
}

async function loadResults() {
  try {
    return { kind: "ok" as const, ...(await fetchAiResults({ limit: 20 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error) ? `The AI API responded with: ${error.message}` : "AI API unavailable."
    };
  }
}

async function loadRisk(reportId: string) {
  try {
    return { kind: "ok" as const, data: await fetchRiskScore(reportId) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error) ? `Risk API responded with: ${error.message}` : "Risk API unavailable."
    };
  }
}
