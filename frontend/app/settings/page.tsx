import { AppShell } from "@/app/components/app-shell";
import { ErrorState, FieldHint, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { fetchHealth, fetchSystemInfo, isApiError } from "@/app/lib/api";
import { settingsGroups } from "@/app/lib/workspace-data";

export const dynamic = "force-dynamic";

type LiveStatus = {
  health: Awaited<ReturnType<typeof fetchHealth>> | null;
  systemInfo: Awaited<ReturnType<typeof fetchSystemInfo>> | null;
  fallbackMessage: string | null;
};

function toFallbackMessage(source: string, error: unknown): string {
  if (isApiError(error)) {
    return `${source} check failed: ${error.message}`;
  }

  return `${source} check failed: backend is unavailable.`;
}

async function loadLiveStatus(): Promise<LiveStatus> {
  const [healthResult, systemInfoResult] = await Promise.allSettled([fetchHealth(), fetchSystemInfo()]);
  const health = healthResult.status === "fulfilled" ? healthResult.value : null;
  const systemInfo = systemInfoResult.status === "fulfilled" ? systemInfoResult.value : null;
  const messages: string[] = [];

  if (healthResult.status === "rejected") {
    messages.push(toFallbackMessage("Health", healthResult.reason));
  }

  if (systemInfoResult.status === "rejected") {
    messages.push(toFallbackMessage("System info", systemInfoResult.reason));
  }

  return {
    health,
    systemInfo,
    fallbackMessage: messages.length > 0 ? messages.join(" ") : null
  };
}

function getLiveStatusTone(health: LiveStatus["health"], systemInfo: LiveStatus["systemInfo"]) {
  if (!health && !systemInfo) {
    return "danger" as const;
  }

  if (health?.status.toLowerCase() === "ok") {
    return "good" as const;
  }

  return "warning" as const;
}

function getLiveStatusLabel(health: LiveStatus["health"], systemInfo: LiveStatus["systemInfo"]): string {
  if (!health && !systemInfo) {
    return "Unavailable";
  }

  if (health?.status.toLowerCase() === "ok") {
    return "Healthy";
  }

  return "Degraded";
}

export default async function SettingsPage() {
  const { health, systemInfo, fallbackMessage } = await loadLiveStatus();

  const backendTone = getLiveStatusTone(health, systemInfo);
  const backendLabel = getLiveStatusLabel(health, systemInfo);
  const serviceName = health?.service ?? systemInfo?.service ?? "Unavailable";
  const environmentName = health?.environment ?? systemInfo?.environment ?? "Unavailable";
  const version = health?.version ?? systemInfo?.version ?? "Unavailable";
  const apiPrefix = systemInfo?.api_prefix ?? "Unavailable";

  return (
    <AppShell activePath="/settings" eyebrow="Administration" title="Settings">
      <section className="settings-grid">
        {settingsGroups.map((group) => (
          <Panel key={group.title} title={group.title}>
            <div className="settings-list">
              {group.items.map((item) => (
                <div key={item}>
                  <StatusBadge tone="good">Active</StatusBadge>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </section>

      <section className="main-grid compact-top">
        <Panel title="Environment">
          <div className="key-value-list">
            <div>
              <span>Backend status</span>
              <strong>
                <StatusBadge tone={backendTone}>{backendLabel}</StatusBadge>
              </strong>
            </div>
            <div>
              <span>Service</span>
              <strong>{serviceName}</strong>
            </div>
            <div>
              <span>Environment</span>
              <strong>{environmentName}</strong>
            </div>
            <div>
              <span>Backend version</span>
              <strong>{version}</strong>
            </div>
            <div>
              <span>API prefix</span>
              <strong>{apiPrefix}</strong>
            </div>
            {fallbackMessage ? (
              <div>
                <span>Live check</span>
                <strong>{fallbackMessage}</strong>
              </div>
            ) : null}
            <div>
              <span>Frontend</span>
              <strong>Next.js app router</strong>
            </div>
            <div>
              <span>Audit posture</span>
              <strong>Required for clinical actions</strong>
            </div>
          </div>
          {fallbackMessage ? (
            <ErrorState
              title="Live backend check degraded"
              description="Settings will continue using available values while connectivity is restored."
            >
              <FieldHint tone="warning">{fallbackMessage}</FieldHint>
            </ErrorState>
          ) : null}
        </Panel>

        <Panel title="Readiness Checklist">
          <div className="rule-list">
            <label>
              <input defaultChecked type="checkbox" />
              Tenant isolation configured
            </label>
            <label>
              <input defaultChecked type="checkbox" />
              Human approval policy enabled
            </label>
            <label>
              <input type="checkbox" />
              Production model credentials connected
            </label>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
