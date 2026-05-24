import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ProxoHMS",
  description:
    "Proxomind Labs healthcare SaaS workspace for Cloud PACS, RIS, LIMS, Medical AI, and TeleReporting workflows."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
