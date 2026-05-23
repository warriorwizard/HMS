import Image from "next/image";

type FigmaScreenMode = "html" | "image";
type FigmaScreenLayout = "standalone" | "embedded";

type FigmaScreenProps = {
  folder: string;
  title: string;
  mode?: FigmaScreenMode;
  layout?: FigmaScreenLayout;
};

export function FigmaScreen({
  folder,
  title,
  mode = "html",
  layout = "standalone"
}: FigmaScreenProps) {
  const basePath = `/figma-screens/${folder}`;
  const wrapperClassName =
    layout === "embedded" ? "figma-screen-embed figma-screen-embed-page" : "figma-screen-root";

  if (mode === "image") {
    return (
      <main
        className={
          layout === "embedded"
            ? `${wrapperClassName} figma-screen-root-image`
            : "figma-screen-root figma-screen-root-image"
        }
      >
        <Image
          alt={title}
          className={layout === "embedded" ? "figma-screen-image-embedded" : "figma-screen-image"}
          height={1080}
          priority
          src={`${basePath}/screen.png`}
          width={1920}
        />
      </main>
    );
  }

  return (
    <main className={wrapperClassName}>
      <iframe
        className={layout === "embedded" ? "figma-screen-frame-embedded" : "figma-screen-frame"}
        loading="eager"
        src={`${basePath}/code.html`}
        title={title}
      />
    </main>
  );
}
