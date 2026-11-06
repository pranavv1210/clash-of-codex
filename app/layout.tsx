import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clash of Codex — Your AI engineering kingdom",
  description: "Turn a GitHub repository into a living technology kingdom. Explore projects, inspect code and command your AI engineering crew.",
  applicationName: "Clash of Codex",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F7F5EC",
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
