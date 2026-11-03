# Inceptown

**Your ideas deserve a world of their own.**

Inceptown turns a GitHub repository into an explorable startup city. A repository is the city, detected project roots become companies, and source files become the buildings inside each company district.

## The city

- **Companies are districts.** A company maps to a project root inside the repository.
- **Files are buildings.** Buildings are colored by file type and scale with the file's size. Company headquarters grow with the project's file and commit footprint.
- **Floors organize the code.** Select a company to inspect source, tests, configuration, assets and documentation.
- **The city is navigable.** Orbit, zoom, select a company tower or click a file building to open its company and the matching floor.
- **The city has ambient life.** Small residents move through the streets; they are visual ambience, not fake agent sessions.
- **Missions capture intent.** Describe a new project or a feature. In this frontend milestone, prompts are saved as drafts rather than dispatched to an AI runtime.

## Stack

- Next.js App Router + TypeScript
- React Three Fiber + Three.js for the interactive isometric city
- Framer Motion for transitions
- Space Grotesk, Inter and DM Mono typography

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

GitHub Actions runs these checks on pushes to `main`.

## Deploy to Vercel

Import this repository into Vercel. The Next.js framework and build settings are detected automatically. No environment variables are required to explore public GitHub repositories.

## Current capabilities

- Public GitHub username lookup and repository discovery
- Recursive default-branch repository tree scan
- Project-root proposals from common language and framework manifests
- Full-screen, interactive 3D city with file-level buildings and company districts
- File selection that opens the corresponding company and floor
- Floor-based file explorer with links to the exact GitHub branch and path
- Mission drafts and new-company briefs
- Read-only repository inspector commands: `help`, `status`, `ls`, `tree`, `find`, `cat`, `head`, `companies`, `agents`, `commits`
- Responsive desktop and mobile layouts

## Important product boundaries

This Vercel-ready milestone reads public GitHub repository metadata and file trees. It does **not** yet run AI agents, edit repositories, execute arbitrary shell commands, or connect provider credentials. The inspector is read-only; mission prompts are drafts. These capabilities need a secure server-side agent runtime, GitHub App authorization, encrypted secret storage, isolated execution environments, real-time event transport and explicit approval controls. Provider subscription access must only be used where each provider officially supports it.

## Product hierarchy

`GitHub repository → City → Companies (projects) → Departments → AI employees → Missions`

A detected project grouping is a proposal based on repository manifests. Inceptown does not move or rewrite source files during discovery.
