import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codex City — Software development, observable",
  description: "Turn a GitHub repository into a living isometric city where files become buildings and engineering activity becomes visible.",
  applicationName: "Codex City",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#071B24",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
