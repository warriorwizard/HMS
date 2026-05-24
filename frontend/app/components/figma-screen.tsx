"use client";

import Image from "next/image";
import type { SyntheticEvent } from "react";

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

  function handleFrameLoad(event: SyntheticEvent<HTMLIFrameElement>) {
    if (layout !== "embedded") {
      return;
    }

    const frame = event.currentTarget;
    const doc = frame.contentDocument;
    if (!doc || !doc.head) {
      return;
    }

    if (doc.getElementById("codex-single-sidebar-style")) {
      return;
    }

    const style = doc.createElement("style");
    style.id = "codex-single-sidebar-style";
    style.textContent = `
      nav.fixed.left-0.top-0.h-full,
      body > nav:first-of-type {
        display: none !important;
      }

      .ml-64 {
        margin-left: 0 !important;
      }
    `;
    doc.head.appendChild(style);

    const rootMain = doc.querySelector("main");
    if (rootMain instanceof HTMLElement) {
      rootMain.style.width = "100%";
    }
  }

  return (
    <main className={wrapperClassName}>
      <iframe
        className={layout === "embedded" ? "figma-screen-frame-embedded" : "figma-screen-frame"}
        loading="eager"
        onLoad={handleFrameLoad}
        src={`${basePath}/code.html`}
        title={title}
      />
    </main>
  );
}
