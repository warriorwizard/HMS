import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Tarini V6",
  description: "Healthcare intelligence workspace for clinical operations."
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

