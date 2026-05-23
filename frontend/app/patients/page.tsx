import { AppShell } from "@/app/components/app-shell";
import { EmptyState, FieldHint, Panel, RiskBadge, StatusBadge } from "@/app/components/workspace-ui";
import { patients } from "@/app/lib/workspace-data";

type PageSearchParams = Promise<{ q?: string | string[] | undefined }>;

function readQuery(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export default async function PatientsPage({
  searchParams
}: {
  searchParams?: PageSearchParams;
}) {
  const query = readQuery((await searchParams)?.q);
  const normalizedQuery = query.toLowerCase();
  const filteredPatients = normalizedQuery
    ? patients.filter((patient) =>
        [
          patient.name,
          patient.id,
          patient.condition,
          patient.lastVisit,
          patient.nextAction,
          patient.risk,
          String(patient.age),
          patient.sex
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : patients;
  const recordsMeta = normalizedQuery
    ? `${filteredPatients.length} of ${patients.length} records`
    : `${patients.length} records`;

  return (
    <AppShell activePath="/patients" eyebrow="Patient registry" title="Patients">
      <form action="/patients" className="toolbar">
        <label>
          <span>Search patients</span>
          <input
            defaultValue={query}
            name="q"
            placeholder="Name, patient ID, visit reason"
            type="search"
          />
          <FieldHint>Use a name, ID, or condition to narrow the list.</FieldHint>
        </label>
        <button type="button">New patient</button>
      </form>

      <section className="wide-grid">
        <Panel className="wide-panel" meta={recordsMeta} title="Active Patient List">
          <div className="data-table">
            <div className="table-row table-head">
              <span>Patient</span>
              <span>Risk</span>
              <span>Last visit</span>
              <span>Next action</span>
            </div>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
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
              ))
            ) : (
              <EmptyState
                title="No patients found"
                description={
                  query
                    ? `No records match "${query}". Try a different keyword.`
                    : "No patient records are available right now."
                }
              />
            )}
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
