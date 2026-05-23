import { AppShell } from "@/app/components/app-shell";
import { EmptyState, FieldHint, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { fetchPatientTimeline, fetchPatients, fetchPatientVisits, type PatientResource } from "@/app/lib/api/patients";
import { isApiError } from "@/app/lib/api/errors";

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
  const patients = await loadPatients(query);

  if (patients.kind === "error") {
    return (
      <AppShell activePath="/patients" eyebrow="Patient registry" title="Patients">
        <Panel className="wide-panel" title="Registry unavailable">
          <EmptyState title="Unable to load patient registry" description={patients.message} />
        </Panel>
      </AppShell>
    );
  }

  const selectedPatient = patients.items[0] ?? null;
  const [visits, timeline] = selectedPatient
    ? await Promise.all([
        fetchPatientVisits(selectedPatient.id, { limit: 5 }),
        fetchPatientTimeline(selectedPatient.id, { limit: 5 })
      ])
    : [null, null];

  const recordsMeta = query
    ? `${patients.items.length} of ${patients.page.total} records`
    : `${patients.page.total} records`;

  return (
    <AppShell activePath="/patients" eyebrow="Patient registry" title="Patients">
      <form action="/patients" className="toolbar">
        <label>
          <span>Search patients</span>
          <input
            defaultValue={query}
            name="q"
            placeholder="Name, patient ID, condition"
            type="search"
          />
          <FieldHint>Search by registration ID, name, condition, age, or status.</FieldHint>
        </label>
        <button type="button">Register patient</button>
      </form>

      <section className="wide-grid">
        <Panel className="wide-panel" meta={recordsMeta} title="Active Patient List">
          <div className="data-table">
            <div className="table-row table-head">
              <span>Patient</span>
              <span>Status</span>
              <span>Condition</span>
              <span>Registration</span>
            </div>
            {patients.items.length > 0 ? (
              patients.items.map((patient) => (
                <div className="table-row" key={patient.id}>
                  <div>
                    <strong>{patient.full_name}</strong>
                    <small>
                      {patient.id} | {patient.age}/{patient.sex}
                    </small>
                  </div>
                  <StatusBadge tone={statusTone(patient.status)}>{patient.status.replaceAll("_", " ")}</StatusBadge>
                  <span>{patient.primary_condition}</span>
                  <span>{patient.registration_id}</span>
                </div>
              ))
            ) : (
              <EmptyState
                title="No patients found"
                description={
                  query
                    ? `No records match \"${query}\".`
                    : "No patient records are available right now."
                }
              />
            )}
          </div>
        </Panel>

        <Panel title="Visit Lifecycle">
          <div className="signal-list">
            {visits && visits.items.length > 0 ? (
              visits.items.map((visit) => (
                <div key={visit.id}>
                  <strong>{visit.visit_type.replaceAll("_", " ")}</strong>
                  <span>
                    {visit.id} | {visit.status.replaceAll("_", " ")} | {visit.scheduled_at}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState title="No visits" description="Create a visit to start workflow tracking." />
            )}
          </div>
        </Panel>
      </section>

      <section className="main-grid compact-top">
        <Panel title="Registration UI">
          <div className="rule-list">
            <label>
              <input defaultChecked type="checkbox" />
              Capture demographics and condition during registration
            </label>
            <label>
              <input defaultChecked type="checkbox" />
              Auto-generate registration ID and timeline seed event
            </label>
            <label>
              <input defaultChecked type="checkbox" />
              Link first visit to patient lifecycle
            </label>
          </div>
        </Panel>

        <Panel title="Patient Timeline">
          <div className="timeline">
            {timeline && timeline.items.length > 0 ? (
              timeline.items.map((event) => (
                <div key={event.id}>
                  <strong>{event.event_type.replaceAll("_", " ")}</strong>
                  <span>{event.description}</span>
                </div>
              ))
            ) : (
              <EmptyState
                title="No timeline events"
                description="Timeline events appear when patient and visit actions are recorded."
              />
            )}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

async function loadPatients(query: string): Promise<
  | { kind: "ok"; items: PatientResource[]; page: { total: number; limit: number; offset: number } }
  | { kind: "error"; message: string }
> {
  try {
    const data = await fetchPatients({ q: query || undefined, limit: 25 });
    return { kind: "ok", items: data.items, page: data.page };
  } catch (error) {
    return {
      kind: "error",
      message: isApiError(error)
        ? `The patient API responded with: ${error.message}`
        : "Patient registry API is currently unavailable."
    };
  }
}

function statusTone(status: string): "good" | "warning" | "danger" | "neutral" {
  const value = status.toLowerCase();
  if (value.includes("critical") || value.includes("inactive")) {
    return "danger";
  }
  if (value.includes("pending") || value.includes("watch")) {
    return "warning";
  }
  if (value.includes("active") || value.includes("ready")) {
    return "good";
  }
  return "neutral";
}
