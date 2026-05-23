import { AppShell } from "@/app/components/app-shell";
import { Panel, StatusBadge } from "@/app/components/workspace-ui";
import { settingsGroups } from "@/app/lib/workspace-data";

export default function SettingsPage() {
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
              <span>Frontend</span>
              <strong>Next.js app router</strong>
            </div>
            <div>
              <span>API mode</span>
              <strong>Local demo wiring</strong>
            </div>
            <div>
              <span>Audit posture</span>
              <strong>Required for clinical actions</strong>
            </div>
          </div>
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
