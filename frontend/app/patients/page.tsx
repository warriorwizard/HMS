import { AppShell } from "@/app/components/app-shell";
import { Panel, RiskBadge, StatusBadge } from "@/app/components/workspace-ui";
import { patients } from "@/app/lib/workspace-data";

export default function PatientsPage() {
  return (
    <AppShell activePath="/patients" eyebrow="Patient registry" title="Patients">
      <div className="toolbar">
        <label>
          <span>Search patients</span>
          <input placeholder="Name, patient ID, visit reason" type="search" />
        </label>
        <button type="button">New patient</button>
      </div>

      <section className="wide-grid">
        <Panel className="wide-panel" meta={`${patients.length} records`} title="Active Patient List">
          <div className="data-table">
            <div className="table-row table-head">
              <span>Patient</span>
              <span>Risk</span>
              <span>Last visit</span>
              <span>Next action</span>
            </div>
            {patients.map((patient) => (
              <div className="table-row" key={patient.id}>
                <div>
                  <strong>{patient.name}</strong>
                  <small>
                    {patient.id} | {patient.age}/{patient.sex} | {patient.condition}
                  </small>
                </div>
                <RiskBadge risk={patient.risk} />
                <span>{patient.lastVisit}</span>
                <StatusBadge tone={patient.risk === "Critical" ? "danger" : "neutral"}>
                  {patient.nextAction}
                </StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Longitudinal Memory">
          <div className="timeline">
            <div>
              <strong>Visit created</strong>
              <span>Demographics, billing, and source documents attached.</span>
            </div>
            <div>
              <strong>Clinical context retrieved</strong>
              <span>Prior reports, missed follow-ups, and interventions available for review.</span>
            </div>
            <div>
              <strong>Next action pending</strong>
              <span>Doctor queue and care desk follow-up are linked to each patient profile.</span>
            </div>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
