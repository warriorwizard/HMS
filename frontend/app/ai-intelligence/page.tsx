import { AppShell } from "@/app/components/app-shell";
import { EmptyState, FieldHint, Panel, RiskBadge, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchAiResults, fetchRiskScore } from "@/app/lib/api/ai-intelligence";
import { reports as demoReports, type RiskLevel } from "@/app/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function AiIntelligencePage() {
  const result = await loadResults();

  if (result.kind === "error") {
    return <AiIntelligenceFallback message={result.message} />;
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

function AiIntelligenceFallback({ message }: { message: string }) {
  return (
    <AppShell activePath="/ai-intelligence" eyebrow="AI intelligence" title="AI Intelligence">
      <FieldHint tone="warning">
        Live AI services did not answer locally ({message}). Showing the clinical governance workspace instead.
      </FieldHint>

      <section className="wide-grid">
        <Panel className="wide-panel" title="AI Results and Explainability">
          <div className="data-table reports-table">
            <div className="table-row table-head">
              <span>Report</span>
              <span>Risk</span>
              <span>Status</span>
              <span>Explainability</span>
            </div>
            {demoReports.map((report) => (
              <div className="table-row" key={report.id}>
                <div>
                  <strong>{report.id}</strong>
                  <small>
                    {report.patient} | {report.type}
                  </small>
                </div>
                <RiskBadge risk={report.risk} />
                <StatusBadge tone={report.risk === "Critical" ? "danger" : "warning"}>
                  {report.status}
                </StatusBadge>
                <span>{explainRisk(report.risk)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Rule-based risk score">
          <div className="timeline">
            <div>
              <strong>{demoReports[0].id}</strong>
              <span>
                Critical ({riskScoreFor(demoReports[0].risk)}%) | abnormal imaging signal and urgent sign-off.
              </span>
            </div>
            <div>
              <strong>Human approval required</strong>
              <span>AI can prioritize and summarize, but diagnosis and release stay with the doctor.</span>
            </div>
            <div>
              <strong>Audit trail</strong>
              <span>Every AI summary, override, and final decision must be linked to source report text.</span>
            </div>
          </div>
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

function riskScoreFor(risk: RiskLevel): number {
  if (risk === "Critical") {
    return 92;
  }
  if (risk === "High") {
    return 78;
  }
  if (risk === "Moderate") {
    return 54;
  }
  return 24;
}

function explainRisk(risk: RiskLevel): string {
  if (risk === "Critical") {
    return "Abnormal findings, short turnaround, and doctor queue priority.";
  }
  if (risk === "High") {
    return "Lab trend and symptom context need consultant review before release.";
  }
  if (risk === "Moderate") {
    return "Follow-up window is approaching; care desk should confirm appointment.";
  }
  return "Routine review lane with no active escalation signal.";
}
