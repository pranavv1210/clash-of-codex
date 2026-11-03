# Inceptown

**Give your ideas a world of their own.**

Inceptown turns GitHub repositories into interactive startup cities. Each repository is a city; detected project roots become companies; files are organized into floors; and the city provides a visual home for future AI engineering crews.

## Stack

- Next.js App Router + TypeScript
- React Three Fiber + Three.js for the interactive isometric city
- Tailwind CSS + custom design tokens
- Framer Motion for transitions

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

Import this repository into Vercel. The default Next.js build settings are detected automatically. No environment variables are required for the public GitHub repository explorer.

## Current foundation

- Public GitHub username lookup and repository discovery
- Repository tree scan and project-root detection
- Interactive 3D city with selectable project buildings
- File/floor explorer, mission capture, settings and read-only inspection console
- Responsive desktop and mobile layouts

## Important product boundaries

This first frontend foundation reads public GitHub repository metadata and file trees. It does not yet execute AI agents, modify repositories, run arbitrary terminal commands, or connect provider credentials. Those capabilities require a secure server-side runtime, GitHub App authorization, encrypted secrets, isolated execution environments and explicit approval controls. The interface labels these areas honestly rather than simulating successful execution.

## Product hierarchy

`GitHub repository → City → Companies (projects) → Departments → AI employees → Missions`

A detected project grouping is a proposal based on repository manifests. Inceptown does not move or rewrite source files during discovery.
