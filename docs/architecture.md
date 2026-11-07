# Phase 1 architecture

GitHub OAuth is retained for the existing deployment. A GitHub App is the recommended migration because GitHub documents fine-grained repository selection and short-lived installation tokens. The browser receives only an opaque session identifier. GitHub tokens are encrypted with AES-256-GCM server-side. Protected queries set transaction-local `app.user_id`; Postgres RLS restricts rows to that user. Persistent Codex execution is excluded until Phase 5.

GitHub.com OAuth web flow supports PKCE and strongly recommends `S256`. The authorization request stores an HttpOnly verifier cookie and the callback supplies the original verifier during token exchange. State validation remains mandatory.

## Environment

- `GITHUB_CLIENT_ID`: GitHub OAuth client ID.
- `GITHUB_CLIENT_SECRET`: server-only OAuth secret.
- `SESSION_SECRET`: at least 32 characters; encryption key material.
- `DATABASE_URL`: Postgres URL with Phase 1 migration applied.
