import { NextResponse } from "next/server";

type RuntimeStatus = {
  codex: { configured: boolean; reachable: boolean; mode: "app-server" | "agents-api" | "unconfigured"; message: string };
  github: { oauthConfigured: boolean; publicDiscovery: boolean };
  persistence: { configured: boolean; driver: string };
};

export const dynamic = "force-dynamic";

export async function GET() {
  const appServerUrl = process.env.CODEX_APP_SERVER_URL?.trim();
  const agentsKey = process.env.OPENAI_API_KEY?.trim();
  let reachable = false;
  let message = "Set CODEX_APP_SERVER_URL or OPENAI_API_KEY on the server.";

  if (appServerUrl) {
    try {
      const response = await fetch(`${appServerUrl.replace(/\/$/, "")}/health`, {
        headers: process.env.CODEX_APP_SERVER_TOKEN ? { Authorization: `Bearer ${process.env.CODEX_APP_SERVER_TOKEN}` } : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      });
      reachable = response.ok;
      message = response.ok ? "Codex app-server health check passed." : `Codex app-server returned HTTP ${response.status}.`;
    } catch {
      message = "Codex app-server is configured but its health check is unreachable.";
    }
  } else if (agentsKey) {
    message = "OpenAI API credentials are configured; an Agents API execution adapter is still required.";
  }

  const status: RuntimeStatus = {
    codex: {
      configured: Boolean(appServerUrl || agentsKey),
      reachable,
      mode: appServerUrl ? "app-server" : agentsKey ? "agents-api" : "unconfigured",
      message,
    },
    github: {
      oauthConfigured: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.SESSION_SECRET),
      publicDiscovery: true,
    },
    persistence: {
      configured: Boolean(process.env.DATABASE_URL),
      driver: process.env.DATABASE_URL ? "server database" : "browser preferences only",
    },
  };

  return NextResponse.json(status, { headers: { "Cache-Control": "no-store" } });
}
