import { AppShell } from "@/app/components/app-shell";
import { FigmaScreen } from "@/app/components/figma-screen";

type FigmaWorkspacePageProps = {
  activePath: string;
  eyebrow: string;
  title: string;
  folder: string;
  mode?: "html" | "image";
};

export function FigmaWorkspacePage({
  activePath,
  eyebrow,
  title,
  folder,
  mode = "html"
}: FigmaWorkspacePageProps) {
  return (
    <AppShell activePath={activePath} eyebrow={eyebrow} title={title}>
      <section className="figma-screen-panel">
        <FigmaScreen folder={folder} layout="embedded" mode={mode} title={title} />
      </section>
    </AppShell>
  );
}
