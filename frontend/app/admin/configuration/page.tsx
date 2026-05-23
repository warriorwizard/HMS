import { AppShell } from "@/app/components/app-shell";
import { ActionBar, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { adminConfigurationSections } from "@/app/lib/workspace-data";

export default function AdminConfigurationPage() {
  return (
    <AppShell activePath="/admin/configuration" eyebrow="Admin console" title="Configuration">
      <section className="admin-config-grid">
        {adminConfigurationSections.map((section) => (
          <Panel key={section.title} meta={section.meta} title={section.title}>
            <p className="config-description">{section.description}</p>
            <div className="admin-stack">
              {section.fields.map((field) => (
                <article className="config-row" key={field.name}>
                  <div className="config-row-heading">
                    <strong>{field.name}</strong>
                    <StatusBadge tone={field.tone}>{field.status}</StatusBadge>
                  </div>
                  <label className="config-edit">
                    <span>Current value</span>
                    <input className="config-input" defaultValue={field.value} type="text" />
                  </label>
                  <small>{field.note}</small>
                  <ActionBar>
                    <button type="button">Edit</button>
                    <button className="button-link secondary" type="button">
                      Request approval
                    </button>
                  </ActionBar>
                </article>
              ))}
            </div>
          </Panel>
        ))}
      </section>
    </AppShell>
  );
}
