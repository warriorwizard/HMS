import { AppShell } from "@/app/components/app-shell";
import { FieldHint, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchPacsStudies } from "@/app/lib/api/pacs";

export const dynamic = "force-dynamic";

export default async function PacsViewerPage() {
  const result = await loadStudies();

  if (result.kind === "error") {
    return <PacsFallback message={result.message} />;
  }

  return (
    <AppShell activePath="/pacs/viewer" eyebrow="Imaging archive" title="PACS / DICOM Viewer">
      <section className="wide-grid">
        <Panel className="wide-panel" title="DICOM Study Hierarchy">
          <div className="signal-list">
            {result.items.map((study) => (
              <div key={study.id}>
                <strong>
                  {study.id} | {study.study_uid}
                </strong>
                <span>
                  {study.patient_id} | {study.series.length} series |{" "}
                  {study.series.reduce((acc, s) => acc + s.images.length, 0)} images
                </span>
                <StatusBadge tone={study.status === "available" ? "good" : "warning"}>{study.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Viewer Route Integration">
          <PacsIntegrationTimeline />
        </Panel>
      </section>
    </AppShell>
  );
}

function PacsFallback({ message }: { message: string }) {
  const studies = [
    {
      id: "STUDY-8821",
      uid: "1.2.840.113619.2.55.3.604688432.8221",
      patient: "PXH-P-1042",
      series: 3,
      images: 42,
      status: "available"
    },
    {
      id: "STUDY-8799",
      uid: "1.2.840.113619.2.55.3.604688432.8799",
      patient: "PXH-P-1021",
      series: 2,
      images: 28,
      status: "prefetching"
    }
  ];

  return (
    <AppShell activePath="/pacs/viewer" eyebrow="Imaging archive" title="PACS / DICOM Viewer">
      <FieldHint tone="warning">
        Live PACS services did not answer locally ({message}). Showing imaging archive metadata instead.
      </FieldHint>

      <section className="wide-grid">
        <Panel className="wide-panel" title="DICOM Study Hierarchy">
          <div className="signal-list">
            {studies.map((study) => (
              <div key={study.id}>
                <strong>
                  {study.id} | {study.uid}
                </strong>
                <span>
                  {study.patient} | {study.series} series | {study.images} images
                </span>
                <StatusBadge tone={study.status === "available" ? "good" : "warning"}>
                  {study.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Viewer Route Integration">
          <PacsIntegrationTimeline />
        </Panel>
      </section>
    </AppShell>
  );
}

function PacsIntegrationTimeline() {
  return (
    <div className="timeline">
      <div>
        <strong>Metadata API</strong>
        <span>Study &gt; series &gt; image hierarchy initializes the viewer and worklist.</span>
      </div>
      <div>
        <strong>DICOM upload API</strong>
        <span>Signed upload URLs are generated for each DICOM object and linked to the visit.</span>
      </div>
      <div>
        <strong>Signed access API</strong>
        <span>Viewer consumes short-lived signed URLs for secure image retrieval and audit.</span>
      </div>
    </div>
  );
}

async function loadStudies() {
  try {
    return { kind: "ok" as const, ...(await fetchPacsStudies({ limit: 20 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error) ? `The PACS API responded with: ${error.message}` : "PACS API unavailable."
    };
  }
}

