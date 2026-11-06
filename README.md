# Codex City

Codex City turns a public GitHub repository into an interactive isometric software city. Directories become districts, files become selectable buildings, and real repository scan events appear as city transmissions.

## Current capabilities

- Public GitHub user and repository discovery
- Recursive default-branch repository scanning
- Deterministic, path-sorted project and building layout
- Generated-directory exclusions for `node_modules`, `.git`, `dist`, `build`, `coverage`, `.next`, `vendor`, and caches
- Interactive Three.js city with orbit, pan, zoom, project selection, and file selection
- City Scan HUD backed by actual repository counts
- Compact file inspector with exact GitHub links
- File/path search that selects the matching city structure
- Session transmission feed containing real scan and inspection events only
- Persistent connected-repository restoration through browser storage
- Responsive desktop and mobile HUD layouts
- Typed execution-event, permission, and mission contracts for a future backend adapter
- Server-only runtime diagnostics for Codex app-server, GitHub OAuth, and database configuration

## Honest integration boundaries

This deployment does not claim to run Codex agents, execute commands, approve tool calls, access private repositories, publish reviews, or report token usage. Those controls are visibly unavailable until a supported server-side execution service, GitHub authentication, encrypted credential storage, sandboxing, and event transport are configured.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

The production build exposes `/` as Codex City and preserves the earlier repository workspace at `/workspace`.

## Runtime configuration

Copy `.env.example` to `.env.local` for local development. Codex City prefers a server-side Codex app-server gateway for product integrations that need persistent threads, streaming, interruption, and approval handling. The `/api/runtime/status` endpoint performs a real health check and never exposes credentials to the browser.

Until a compatible gateway implements mission transport and permission callbacks, dispatch remains disabled even when the health endpoint is reachable. This avoids representing a diagnostic connection as a working execution engine.
