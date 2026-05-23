import { AppShell } from "@/app/components/app-shell";
import { EmptyState, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchPacsStudies } from "@/app/lib/api/pacs";

export const dynamic = "force-dynamic";

export default async function PacsViewerPage() {
  const result = await loadStudies();

  return (
    <AppShell activePath="/pacs/viewer" eyebrow="Imaging archive" title="PACS / DICOM Viewer">
      <section className="wide-grid">
        <Panel className="wide-panel" title="DICOM Study Hierarchy">
          {result.kind === "ok" ? (
            <div className="signal-list">
              {result.items.map((study) => (
                <div key={study.id}>
                  <strong>
                    {study.id} | {study.study_uid}
                  </strong>
                  <span>
                    {study.patient_id} | {study.series.length} series | {study.series.reduce((acc, s) => acc + s.images.length, 0)} images
                  </span>
                  <StatusBadge tone={study.status === "available" ? "good" : "warning"}>{study.status}</StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Unable to load PACS metadata" description={result.message} />
          )}
        </Panel>

        <Panel title="Viewer Route Integration">
          <div className="timeline">
            <div>
              <strong>Metadata API</strong>
              <span>Study &gt; series &gt; image hierarchy is returned for viewer initialization.</span>
            </div>
            <div>
              <strong>DICOM upload API</strong>
              <span>Signed upload URL is generated for each DICOM object.</span>
            </div>
            <div>
              <strong>Signed access API</strong>
              <span>Viewer consumes short-lived signed URL for secure image retrieval.</span>
            </div>
          </div>
        </Panel>
      </section>
    </AppShell>
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
