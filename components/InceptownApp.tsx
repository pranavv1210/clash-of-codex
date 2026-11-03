"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bot, Box, Check, ChevronDown, ChevronRight,
  CircleHelp, Clock3, Code2, Command, Compass, Cpu, ExternalLink, FileCode2, FileText, Folder,
  GitBranch, Github, Globe2, Layers3, LayoutDashboard, LoaderCircle, LockKeyhole,
  MoreHorizontal, Plus, Rocket, Settings2, ShieldCheck, Sparkles, TerminalSquare, X, Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { formatNumber, getFileContent, getFileLanguage, getRepoSnapshot, getUserRepos } from "@/lib/github";
import type { GitHubRepo, Mission, Project, RepoFile } from "@/types/inceptown";

const CityScene = dynamic(() => import("@/components/CityScene"), { ssr: false, loading: () => <div className="scene-loading"><LoaderCircle className="spin" /> Preparing your city…</div> });

const demoProjects: Project[] = [
  { id: "demo-1", name: "Product Studio", root: "apps/product", files: Array.from({ length: 38 }, (_, i) => ({ path: `apps/product/src/module-${i}.tsx`, type: "blob" as const, sha: String(i) })), language: "TypeScript", commits: 128, stars: 24, color: "#73F0C2" },
  { id: "demo-2", name: "API Works", root: "services/api", files: Array.from({ length: 22 }, (_, i) => ({ path: `services/api/app/module-${i}.py`, type: "blob" as const, sha: String(i) })), language: "Python", commits: 76, stars: 12, color: "#788BFF" },
  { id: "demo-3", name: "Design System", root: "packages/ui", files: Array.from({ length: 15 }, (_, i) => ({ path: `packages/ui/components/${i}.tsx`, type: "blob" as const, sha: String(i) })), language: "TypeScript", commits: 43, stars: 8, color: "#FFB86B" },
];

type Floor = { name: string; icon: typeof Folder; files: RepoFile[]; description: string };

function getFloors(files: RepoFile[]): Floor[] {
  const groups: Record<string, RepoFile[]> = { "Source studio": [], "Quality lab": [], "Foundation": [], "Creative assets": [], "Knowledge archive": [], "Other spaces": [] };
  for (const file of files) {
    const path = file.path.toLowerCase();
    const name = path.split("/").pop() || path;
    if (/(test|spec|__tests__|\.test\.|\.spec\.)/.test(path)) groups["Quality lab"].push(file);
    else if (/\.(md|mdx|txt)$/.test(name) || /(^|\/)(docs|documentation)(\/|$)/.test(path)) groups["Knowledge archive"].push(file);
    else if (/\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf)$/.test(name) || /(^|\/)(assets|images)(\/|$)/.test(path)) groups["Creative assets"].push(file);
    else if (/\.(json|ya?ml|toml|ini|env|config|lock)$/.test(name) || /(^|\/)(config|scripts)(\/|$)/.test(path)) groups["Foundation"].push(file);
    else if (/\.(tsx?|jsx?|py|dart|go|rs|java|kt|swift|php|rb|css|scss|html|vue|svelte)$/.test(name)) groups["Source studio"].push(file);
    else groups["Other spaces"].push(file);
  }
  const descriptions: Record<string, string> = {
    "Source studio": "Where the product is made",
    "Quality lab": "Tests, checks and confidence",
    "Foundation": "Configuration and project setup",
    "Creative assets": "Visuals, media and design assets",
    "Knowledge archive": "Documentation and product knowledge",
    "Other spaces": "Everything else in this project",
  };
  return Object.entries(groups).filter(([, items]) => items.length).map(([name, items]) => ({
    name, icon: name === "Source studio" ? Code2 : name === "Quality lab" ? ShieldCheck : name === "Foundation" ? Layers3 : name === "Creative assets" ? Box : name === "Knowledge archive" ? FileText : Folder,
    files: items, description: descriptions[name],
  }));
}

function Brand({ onClick }: { onClick?: () => void }) {
  return <button className="brand" onClick={onClick} aria-label="Inceptown home"><span className="brand-mark"><span /><span /><span /></span><span>inceptown<span className="brand-period">.</span></span></button>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof GitBranch; label: string; value: string | number }) {
  return <div className="stat"><Icon size={14} /><span>{value}</span><small>{label}</small></div>;
}

function RepoCard({ repo, onBuild }: { repo: GitHubRepo; onBuild: () => void }) {
  return (
    <motion.button whileHover={{ y: -4 }} whileTap={{ scale: 0.99 }} className="repo-card" onClick={onBuild}>
      <div className="repo-card-top"><span className="repo-icon"><Github size={18} /></span><span className="repo-updated"><Clock3 size={12} /> {new Date(repo.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div>
      <h3>{repo.name.replace(/[-_]/g, " ")}</h3>
      <p>{repo.description || "A new world waiting to take shape."}</p>
      <div className="repo-card-stats"><span><GitBranch size={13} /> {repo.default_branch}</span><span><Zap size={13} /> {repo.language || "Mixed"}</span><span><Rocket size={13} /> {formatNumber(repo.stargazers_count)}</span></div>
      <div className="repo-card-action">Build this city <ArrowUpRight size={15} /></div>
    </motion.button>
  );
}

function FloorRow({ floor, repoFullName, branch, active, selectedFilePath, onClick }: { floor: Floor; repoFullName: string; branch: string; active: boolean; selectedFilePath?: string; onClick: () => void }) {
  const Icon = floor.icon;
  return (
    <div className={`floor-card ${active ? "floor-card--active" : ""}`}>
      <button className="floor-head" onClick={onClick}>
        <span className="floor-icon"><Icon size={16} /></span>
        <span className="floor-copy"><strong>{floor.name}</strong><small>{floor.description}</small></span>
        <span className="floor-count">{floor.files.length}</span>
        {active ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      <AnimatePresence initial={false}>
        {active && <motion.div className="floor-files" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
          {floor.files.slice(0, 40).map((file) => <a key={file.path} href={`https://github.com/${repoFullName}/blob/${branch}/${file.path.split("/").map(encodeURIComponent).join("/")}`} target="_blank" rel="noreferrer" className={`file-row ${file.path === selectedFilePath ? "file-row--selected" : ""}`}><FileCode2 size={13} /><span>{file.path.split("/").pop()}</span><small>{file.path}</small><ExternalLink size={11} /></a>)}
          {floor.files.length > 40 && <p className="muted tiny">Showing 40 of {floor.files.length} files in this floor.</p>}
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}

function CrewBlueprint({ projectName, onConfigure }: { projectName: string; onConfigure: () => void }) {
  const roles = [
    { initials: "PM", name: "Project manager", focus: "Plans missions and coordinates delivery", tone: "crew-0" },
    { initials: "AR", name: "Software architect", focus: "Designs systems and technical direction", tone: "crew-1" },
    { initials: "DE", name: "Full-stack engineer", focus: "Builds features across the stack", tone: "crew-2" },
    { initials: "QA", name: "QA engineer", focus: "Tests changes and checks quality", tone: "crew-3" },
  ];
  return (
    <section className="panel crew-blueprint-panel">
      <div className="panel-heading">
        <div><span className="section-kicker">COMPANY CREW</span><h3>Specialist role blueprints</h3><p>Scoped to {projectName}.</p></div>
        <span className="quiet-pill">TEMPLATES</span>
      </div>
      <div className="crew-blueprint-grid">
        {roles.map((role) => (
          <article className="crew-role-card" key={role.initials}>
            <span className={`crew-avatar ${role.tone}`}>{role.initials}</span>
            <div><strong>{role.name}</strong><small>{role.focus}</small></div>
            <span className="crew-template-status">IDLE</span>
          </article>
        ))}
      </div>
      <div className="crew-blueprint-footer">
        <span>Role templates only · no agent sessions are running yet.</span>
        <button className="subtle-link" onClick={onConfigure}>Configure providers <ArrowUpRight size={13} /></button>
      </div>
    </section>
  );
}

export default function InceptownApp() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [repoOwner, setRepoOwner] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allFiles, setAllFiles] = useState<RepoFile[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [view, setView] = useState<"landing" | "repos" | "city">("landing");
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState("");
  const [buildStage, setBuildStage] = useState(0);
  const [commitCount, setCommitCount] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [floorOpen, setFloorOpen] = useState(0);
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [tab, setTab] = useState<"overview" | "companies" | "missions">("overview");
  const [prompt, setPrompt] = useState("");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalBusy, setTerminalBusy] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>(["INCEPTOWN INSPECTOR v0.1", "Read-only repository console. Type 'help' to see available commands.", ""]);
  const [provider, setProvider] = useState("OpenAI");
  const [model, setModel] = useState("GPT-4.1");
  const [cityName, setCityName] = useState("");
  const [editingCity, setEditingCity] = useState(false);
  const [companyModal, setCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyPath, setNewCompanyPath] = useState("");
  const [newCompanyPrompt, setNewCompanyPrompt] = useState("");

  const selectedProject = selectedProjectId ? projects.find((project) => project.id === selectedProjectId) : undefined;
  const floors = useMemo(() => selectedProject ? getFloors(selectedProject.files) : [], [selectedProject]);
  const allLanguages = useMemo(() => [...new Set(allFiles.filter((file) => file.type === "blob").map((file) => getFileLanguage(file.path)).filter((language): language is string => Boolean(language)))], [allFiles]);
  const stages = ["Surveying the land", "Mapping the streets", "Raising company towers", "Opening the city gates"];

  useEffect(() => {
    let cancelled = false;
    async function restoreWorkspace() {
      try {
        const raw = window.localStorage.getItem("inceptown:workspace:v1");
        if (!raw) return;
        const saved = JSON.parse(raw) as {
          repo?: GitHubRepo; cityName?: string; missions?: Mission[]; selectedProjectId?: string;
          provider?: string; model?: string;
          manualCompanies?: Array<{ id: string; name: string; root: string; color: string }>;
        };
        if (!saved.repo?.full_name) return;
        setSelectedRepo(saved.repo);
        setRepoOwner(saved.repo.full_name.split("/")[0]);
        setCityName(saved.cityName || saved.repo.name);
        setMissions(Array.isArray(saved.missions) ? saved.missions : []);
        if (saved.provider) setProvider(saved.provider);
        if (saved.model) setModel(saved.model);
        setBusy(true);
        setBuildStage(3);
        const snapshot = await getRepoSnapshot(saved.repo);
        if (cancelled) return;
        const restoredCompanies: Project[] = (saved.manualCompanies || []).map((company) => ({
          id: company.id,
          name: company.name,
          root: company.root,
          files: company.root && company.root !== "Planned project"
            ? snapshot.files.filter((file) => file.type === "blob" && (file.path === company.root || file.path.startsWith(company.root + "/")))
            : [],
          language: saved.repo?.language || "Mixed stack",
          commits: 0,
          stars: 0,
          color: company.color,
        }));
        const restoredProjects = [...snapshot.projects, ...restoredCompanies];
        setProjects(restoredProjects);
        setAllFiles(snapshot.files);
        setCommitCount(snapshot.commits);
        setTruncated(snapshot.truncated);
        setSelectedProjectId(restoredProjects.some((project) => project.id === saved.selectedProjectId)
          ? saved.selectedProjectId || ""
          : restoredProjects[0]?.id || "");
        setTab("overview");
        setView("city");
      } catch {
        setError("We couldn't restore the saved city. You can build it again from GitHub.");
      } finally {
        if (!cancelled) {
          setBusy(false);
          setRestoring(false);
        }
      }
    }
    restoreWorkspace();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (view !== "city" || !selectedRepo) return;
    const manualCompanies = projects.filter((project) => project.id.startsWith("manual-")).map(({ id, name, root, color }) => ({ id, name, root, color }));
    try {
      window.localStorage.setItem("inceptown:workspace:v1", JSON.stringify({
        repo: selectedRepo, cityName, missions, selectedProjectId, provider, model, manualCompanies,
      }));
    } catch {
      // Keep the live workspace usable if browser storage is unavailable or full.
    }
  }, [view, selectedRepo, cityName, missions, selectedProjectId, provider, model, projects]);

  async function discoverRepos(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const clean = username.trim().replace(/^@/, "");
      const found = await getUserRepos(clean);
      setRepos(found);
      setRepoOwner(clean);
      setView("repos");
      if (!found.length) setError("No public repositories found for this account yet.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while reaching GitHub.");
    } finally {
      setBusy(false);
    }
  }

  async function buildCity(repo: GitHubRepo) {
    setSelectedRepo(repo);
    setCityName(repo.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    setBusy(true);
    setBuildStage(0);
    setError("");
    try {
      const snapshotPromise = getRepoSnapshot(repo);
      for (let i = 0; i < stages.length; i++) {
        setBuildStage(i);
        await new Promise((resolve) => setTimeout(resolve, 650));
      }
      const snapshot = await snapshotPromise;
      setProjects(snapshot.projects);
      setAllFiles(snapshot.files);
      setCommitCount(snapshot.commits);
      setTruncated(snapshot.truncated);
      setSelectedProjectId(snapshot.projects[0]?.id || "");
      setFloorOpen(0);
      setTab("overview");
      setView("city");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't map this repository.");
      setView("repos");
    } finally {
      setBusy(false);
    }
  }

  function inspectFile(projectId: string, path: string) {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    const nextFloors = getFloors(project.files);
    const nextFloor = nextFloors.findIndex((floor) => floor.files.some((file) => file.path === path));
    setSelectedProjectId(projectId);
    setSelectedFilePath(path);
    setFloorOpen(nextFloor >= 0 ? nextFloor : 0);
    setTab("companies");
  }

  function createMission(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim() || !selectedProject) return;
    const mission: Mission = {
      id: crypto.randomUUID(),
      prompt: prompt.trim(),
      projectName: selectedProject.name,
      createdAt: new Date().toISOString(),
      status: "Draft",
    };
    setMissions((current) => [mission, ...current]);
    setPrompt("");
    setTab("missions");
  }

  function createCompany(event: FormEvent) {
    event.preventDefault();
    if (!newCompanyName.trim()) return;
    const root = newCompanyPath.trim().replace(/^\/+|\/+$/g, "");
    if (!root && !newCompanyPrompt.trim()) {
      setError("Add a build brief when creating a company without an existing repository folder.");
      return;
    }
    const scoped = root ? allFiles.filter((file) => file.type === "blob" && (file.path === root || file.path.startsWith(root + "/"))) : [];
    if (root && scoped.length === 0) {
      setError("No files were found at that path. Use a folder path from the repository tree.");
      return;
    }
    const project: Project = {
      id: `manual-${Date.now()}`, name: newCompanyName.trim(), root: root || "Planned project", files: scoped,
      language: selectedRepo?.language || "Mixed stack", commits: 0, stars: 0, color: ["#73F0C2", "#788BFF", "#FFB86B"][projects.length % 3],
    };
    setProjects((current) => [...current, project]);
    setSelectedProjectId(project.id);
    if (newCompanyPrompt.trim()) {
      setMissions((current) => [{
        id: crypto.randomUUID(), prompt: newCompanyPrompt.trim(), projectName: project.name,
        createdAt: new Date().toISOString(), status: "Draft",
      }, ...current]);
    }
    setCompanyModal(false);
    setNewCompanyName("");
    setNewCompanyPath("");
    setNewCompanyPrompt("");
    setError("");
    setTab(newCompanyPrompt.trim() ? "missions" : "companies");
  }

  async function runConsole(event: FormEvent) {
    event.preventDefault();
    const command = terminalInput.trim();
    if (!command || terminalBusy) return;
    const [verb, ...rest] = command.split(" ");
    const argument = rest.join(" ").trim();
    setTerminalInput("");
    setTerminalBusy(true);
    setTerminalLines((current) => [...current, `inceptown $ ${command}`]);
    let output = "";
    try {
      if (verb === "help") {
        output = [
          "help                 Show available commands",
          "status               Show the indexed repository snapshot",
          "ls [folder]          List files and folders",
          "tree                 Show the repository file tree",
          "find <name>          Search file paths by name",
          "cat <path>           Read a text file from the default branch",
          "head <path>          Preview the first 30 lines of a file",
          "companies            List project districts",
          "agents               Show available crew templates",
          "commits              Show the observed commit count",
          "clear                Clear this console",
          "",
          "This is a read-only GitHub snapshot inspector, not a shell."
        ].join("\n");
      } else if (verb === "status") {
        output = `City: ${cityName}\nRepository: ${selectedRepo?.full_name}\nBranch: ${selectedRepo?.default_branch}\nCompanies: ${projects.length}\nFiles indexed: ${allFiles.filter((file) => file.type === "blob").length}\nCommits observed: ${commitCount}\nSource: public GitHub default-branch snapshot\nShell execution: disabled`;
      } else if (verb === "tree") {
        output = allFiles.slice(0, 80).map((file) => `${file.type === "tree" ? "▸" : "·"} ${file.path}`).join("\n") || "No files indexed.";
        if (allFiles.length > 80) output += `\n… and ${allFiles.length - 80} more entries. Use find <name> to narrow the list.`;
      } else if (verb === "ls") {
        const prefix = argument.replace(/^\/+|\/+$/g, "");
        const children = new Map<string, "tree" | "blob">();
        for (const file of allFiles) {
          const relative = prefix ? file.path.startsWith(prefix + "/") ? file.path.slice(prefix.length + 1) : "" : file.path;
          if (!relative) continue;
          const [first, ...remaining] = relative.split("/");
          if (!first) continue;
          children.set(first, remaining.length ? "tree" : file.type);
        }
        output = [...children.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, type]) => `${type === "tree" ? "▸" : "·"} ${name}`).join("\n") || "No entries found at that path.";
      } else if (verb === "find") {
        if (!argument) output = "Usage: find <file or folder name>";
        else {
          const matches = allFiles.filter((file) => file.path.toLowerCase().includes(argument.toLowerCase())).slice(0, 60);
          output = matches.map((file) => file.path).join("\n") || "No matching paths.";
          if (matches.length === 60) output += "\nShowing the first 60 matches.";
        }
      } else if (verb === "cat" || verb === "head") {
        if (!argument) output = `Usage: ${verb} <repository-relative file path>`;
        else if (!selectedRepo) output = "Connect a repository first.";
        else {
          const content = await getFileContent(selectedRepo, argument);
          const lines = content.split("\n");
          const shown = verb === "head" ? lines.slice(0, 30) : lines.slice(0, 90);
          output = shown.map((line, index) => `${String(index + 1).padStart(3, " ")}  ${line}`).join("\n");
          if (lines.length > shown.length) output += `\n… ${lines.length - shown.length} more lines. ${verb === "cat" ? "Use head for a shorter preview." : "Open the file on GitHub for the full content."}`;
        }
      } else if (verb === "companies") {
        output = projects.map((project) => `▸ ${project.name}  ${project.root}  (${project.files.length} files)`).join("\n");
      } else if (verb === "agents") {
        output = "Available role templates:\nProject Manager · Software Architect · Engineer · QA Specialist\nNo agent sessions are running in this frontend-only deployment.";
      } else if (verb === "commits") {
        output = `${commitCount ? formatNumber(commitCount) : "Commit count unavailable"} commits observed on the default branch.`;
      } else if (verb === "clear") {
        setTerminalLines([]);
        return;
      } else {
        output = `Command not found: ${verb}. Type 'help' for available commands.`;
      }
    } catch (err) {
      output = err instanceof Error ? err.message : "The repository request failed.";
    } finally {
      setTerminalBusy(false);
    }
    setTerminalLines((current) => [...current, ...output.split("\n"), ""]);
  }

  const demo = view === "landing";

  return (
    <main className="app-shell">
      <AnimatePresence>
        {busy && selectedRepo && (view !== "city") && (
          <motion.div className="build-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="build-modal">
              <div className="build-emblem"><div className="brand-mark large"><span /><span /><span /></div></div>
              <span className="eyebrow">{restoring ? "RESTORING YOUR CITY" : "CITY CONSTRUCTION IN PROGRESS"}</span>
              <h2>Your world is taking shape.</h2>
              <p>{restoring ? "Reconnecting your city and refreshing its repository map." : "We&apos;re reading the repository and laying the foundations for your city."}</p>
              <div className="construction-art"><div className="construction-sun" /><div className="construction-crane"><i /><b /><span /></div><div className="construction-road" /><div className="construction-block block-a" /><div className="construction-block block-b" /><div className="construction-block block-c" /></div>
              <div className="build-progress"><span style={{ width: `${((buildStage + 1) / stages.length) * 100}%` }} /></div>
              <div className="build-stage"><span><LoaderCircle size={14} className="spin" /> {stages[buildStage]}</span><small>{Math.round(((buildStage + 1) / stages.length) * 100)}%</small></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className={`topbar ${demo ? "topbar--landing" : ""}`}>
        <Brand onClick={() => { setView("landing"); setSelectedRepo(null); }} />
        <nav className="topnav">
          <a href="#how-it-works">How it works</a>
          <a href="#world">The world</a>
          <a href="https://github.com/pranavv1210/inceptown" target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a>
        </nav>
        <div className="topbar-right">
          {view === "city" ? <><button className="icon-button" onClick={() => setTerminalOpen(true)} title="Open inspector"><TerminalSquare size={17} /></button><button className="icon-button" onClick={() => setSettingsOpen(true)} title="Settings"><Settings2 size={17} /></button><span className="avatar">P</span></> : <a className="text-link" href="https://github.com/pranavv1210" target="_blank" rel="noreferrer">Made for makers <ArrowUpRight size={14} /></a>}
        </div>
      </header>

      {view === "landing" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <div className="announcement"><span className="announcement-dot" /> A NEW WAY TO BUILD SOFTWARE <ArrowUpRight size={13} /></div>
              <h1>Your ideas deserve<br />a <em>world</em> of their own.</h1>
              <p className="hero-subtitle">Turn your GitHub repositories into living startup cities. Explore your projects, bring your AI crew together, and watch your ideas take shape.</p>
              <form className="username-form" onSubmit={discoverRepos}>
                <div className="github-input"><Github size={19} /><span>github.com/</span><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="your-username" aria-label="GitHub username" /></div>
                <button className="button button-primary" type="submit" disabled={busy || !username.trim()}>{busy ? <LoaderCircle size={17} className="spin" /> : <>Build your startup city <ArrowRight size={17} /></>}</button>
              </form>
              {error && <p className="inline-error">{error}</p>}
              <div className="hero-proof"><span><ShieldCheck size={14} /> Public repositories</span><span><LockKeyhole size={14} /> Read-only discovery</span><span><Zap size={14} /> No setup required</span></div>
            </div>
            <div className="hero-visual" id="world">
              <div className="visual-glow" />
              <div className="visual-label"><span className="live-dot" /> A CITY IN MOTION <small>01 / 01</small></div>
              <CityScene projects={demoProjects} compact />
              <div className="floating-chip chip-top"><span className="chip-icon mint"><Bot size={15} /></span><span><strong>AI crew</strong><small>Ready to assemble</small></span><span className="chip-pulse" /></div>
              <div className="floating-chip chip-bottom"><span className="chip-icon violet"><Layers3 size={15} /></span><span><strong>3 companies</strong><small>One connected world</small></span><ArrowUpRight size={15} /></div>
            </div>
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          </section>
          <section className="trust-strip"><span>YOUR REPOSITORY, REIMAGINED</span><div><span><GitBranch size={15} /> GitHub-native</span><span><Layers3 size={15} /> Project-aware</span><span><Bot size={15} /> Agent-ready</span><span><Compass size={15} /> City-sized vision</span></div></section>
          <section className="intro-section" id="how-it-works">
            <div className="section-kicker">A DIFFERENT WAY TO SEE YOUR WORK</div>
            <h2>From repository to <span>reality.</span></h2>
            <p className="section-lede">Your codebase has a story. Inceptown gives it a place to live — and gives every project room to grow.</p>
            <div className="feature-grid">
              <article className="feature-card"><span className="feature-number">01</span><div className="feature-icon mint"><Github size={21} /></div><h3>Connect your world</h3><p>Enter a GitHub username. Inceptown discovers public repositories and maps their structure into a visual city.</p><span className="feature-foot">REPOSITORY → CITY</span></article>
              <article className="feature-card"><span className="feature-number">02</span><div className="feature-icon violet"><Layers3 size={21} /></div><h3>Give projects a home</h3><p>Project roots become companies. Files find their floors. Shared code stays visible without moving a single file.</p><span className="feature-foot">PROJECT → COMPANY</span></article>
              <article className="feature-card"><span className="feature-number">03</span><div className="feature-icon amber"><Bot size={21} /></div><h3>Grow your crew</h3><p>Make room for specialist AI employees — from product planning and architecture to engineering and QA.</p><span className="feature-foot">AGENTS → MISSIONS</span></article>
            </div>
          </section>
          <section className="closing-cta"><div className="closing-orb" /><div><span className="section-kicker">YOUR NEXT CHAPTER STARTS HERE</span><h2>Make room for<br /><em>what&apos;s possible.</em></h2></div><form onSubmit={discoverRepos} className="closing-form"><div className="github-input"><Github size={17} /><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="GitHub username" aria-label="GitHub username" /></div><button className="button button-primary" disabled={busy || !username.trim()}>Build your city <ArrowRight size={16} /></button></form></section>
          <footer className="footer"><Brand onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} /><span>Ideas deserve a world of their own.</span><small>© 2026 Inceptown · Built for the builders.</small></footer>
        </>
      )}

      {view === "repos" && (
        <section className="repo-discovery page-container">
          <button className="back-link" onClick={() => setView("landing")}><ArrowLeft size={15} /> Back home</button>
          <div className="page-heading"><div><span className="section-kicker">GITHUB EXPLORER</span><h1>Choose a world<br /><em>to bring to life.</em></h1><p>We found these public repositories for <strong>@{repoOwner}</strong>. Each repository becomes its own city.</p></div><div className="repo-count"><strong>{repos.length.toString().padStart(2, "0")}</strong><span>PUBLIC REPOSITORIES</span></div></div>
          {error && <p className="inline-error">{error}</p>}
          <div className="repo-grid">{repos.map((repo) => <RepoCard key={repo.id} repo={repo} onBuild={() => buildCity(repo)} />)}</div>
          <div className="privacy-note"><ShieldCheck size={16} /> Inceptown only reads public repository metadata and file trees. It never changes your code.</div>
        </section>
      )}

      {view === "city" && selectedRepo && (
        <div className="workspace">
          <aside className="sidebar">
            <Brand onClick={() => setView("repos")} />
            <div className="sidebar-city"><span className="city-avatar"><Globe2 size={17} /></span><span><strong>{cityName || selectedRepo.name}</strong><small>{selectedRepo.full_name}</small></span><button onClick={() => setEditingCity(true)}><MoreHorizontal size={17} /></button></div>
            <div className="sidebar-label">WORKSPACE</div>
            <button className={`side-link ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}><LayoutDashboard size={17} /> City overview</button>
            <button className={`side-link ${tab === "companies" ? "active" : ""}`} onClick={() => setTab("companies")}><Layers3 size={17} /> Companies <span>{projects.length}</span></button>
            <button className={`side-link ${tab === "missions" ? "active" : ""}`} onClick={() => setTab("missions")}><Rocket size={17} /> Missions <span>{missions.length}</span></button>
            <div className="sidebar-label sidebar-label-spaced">YOUR CREW</div>
            {["Project manager", "Software architect", "Engineer", "QA specialist"].map((role, i) => <div className="crew-mini" key={role}><span className={`crew-avatar crew-${i}`}>{["PM", "AR", "DE", "QA"][i]}</span><span>{role}<small>Template · idle</small></span><span className="idle-dot" /></div>)}
            <div className="sidebar-bottom"><button className="side-link" onClick={() => setTerminalOpen(true)}><TerminalSquare size={17} /> Inspector console</button><button className="side-link" onClick={() => setSettingsOpen(true)}><Settings2 size={17} /> Settings</button><div className="user-profile"><span className="avatar">P</span><span><strong>Pranav</strong><small>City founder</small></span><MoreHorizontal size={17} /></div></div>
          </aside>
          <section className="main-workspace">
            <div className="workspace-top"><div className="breadcrumb"><span>My cities</span><ChevronRight size={13} /><strong>{cityName}</strong></div><div className="workspace-actions"><span className="read-only-badge"><span /> REPOSITORY LINKED</span><a href={selectedRepo.html_url} target="_blank" rel="noreferrer" className="icon-button" title="Open on GitHub"><ExternalLink size={16} /></a><button className="icon-button" onClick={() => setSettingsOpen(true)}><Settings2 size={16} /></button></div></div>
            <nav className="mobile-workspace-nav" aria-label="Workspace navigation">
              <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><LayoutDashboard size={15} /> City</button>
              <button className={tab === "companies" ? "active" : ""} onClick={() => setTab("companies")}><Layers3 size={15} /> Companies</button>
              <button className={tab === "missions" ? "active" : ""} onClick={() => setTab("missions")}><Rocket size={15} /> Missions</button>
              <button onClick={() => setTerminalOpen(true)}><TerminalSquare size={15} /> Console</button>
            </nav>
            <div className="workspace-scroll">
              <div className="city-heading"><div><span className="section-kicker">YOUR STARTUP CITY</span>{editingCity ? <form className="rename-form" onSubmit={(e) => { e.preventDefault(); setEditingCity(false); }}><input value={cityName} onChange={(e) => setCityName(e.target.value)} autoFocus /><button className="mini-save"><Check size={14} /></button></form> : <h1>{cityName}</h1>}<p>A living map of <strong>{selectedRepo.full_name}</strong>. Explore a company to see what&apos;s inside.</p></div><button className="button button-outline small" onClick={() => { setError(""); setCompanyModal(true); }}><Plus size={15} /> New company</button></div>
              <div className="city-stats"><Stat icon={Layers3} label="companies" value={projects.length} /><Stat icon={FileCode2} label="files mapped" value={formatNumber(allFiles.filter((f) => f.type === "blob").length)} /><Stat icon={GitBranch} label="commits" value={commitCount ? formatNumber(commitCount) : "—"} /><Stat icon={Code2} label="languages" value={allLanguages.length || "—"} /></div>
              {tab === "overview" && <>
                <div className="city-board">
                  <div className="board-top"><div><span className="board-eyebrow"><span className="live-dot" /> CITY VIEW</span><h2>The skyline</h2><p>Each tower is a project. Taller buildings reflect larger codebases.</p></div><div className="board-tools"><span><span className="legend-dot mint-dot" /> Selected company</span><span><span className="legend-dot blue-dot" /> Source file</span><button className="icon-button" onClick={() => setTerminalOpen(true)}><TerminalSquare size={15} /></button></div></div>
                  <CityScene projects={projects} selectedProjectId={selectedProject?.id} selectedFilePath={selectedFilePath} onSelect={(id) => { setSelectedProjectId(id); setSelectedFilePath(""); if (window.matchMedia("(max-width: 850px)").matches) setTab("companies"); }} onSelectFile={inspectFile} />
                  <div className="board-bottom"><span><Compass size={14} /> Drag to orbit · Scroll to zoom · Select a building to inspect</span><span>{projects.length} DISTRICTS MAPPED</span></div>
                </div>
                <div className="overview-lower">
                  <section className="panel company-panel"><div className="panel-heading"><div><span className="section-kicker">YOUR COMPANIES</span><h3>Project districts</h3></div><button className="subtle-link" onClick={() => setTab("companies")}>View all <ArrowRight size={14} /></button></div>
                    {projects.slice(0, 4).map((project) => <button className={`company-row ${project.id === selectedProject?.id ? "selected" : ""}`} key={project.id} onClick={() => setSelectedProjectId(project.id)}><span className="company-building" style={{ "--building-color": project.color } as React.CSSProperties}><span /></span><span className="company-info"><strong>{project.name}</strong><small>{project.root} · {project.language}</small></span><span className="company-files">{project.files.length} files</span><ChevronRight size={15} /></button>)}
                  </section>
                  <section className="panel activity-panel"><div className="panel-heading"><div><span className="section-kicker">CITY ACTIVITY</span><h3>What&apos;s happening</h3></div><span className="quiet-pill">REPO SNAPSHOT</span></div><div className="activity-item"><span className="activity-icon mint"><Github size={15} /></span><span><strong>Repository connected</strong><small>{selectedRepo.full_name}</small></span><time>SCANNED</time></div><div className="activity-item"><span className="activity-icon violet"><Layers3 size={15} /></span><span><strong>{projects.length} project districts mapped</strong><small>Based on repository manifests</small></span><time>SCANNED</time></div><div className="activity-item"><span className="activity-icon amber"><FileCode2 size={15} /></span><span><strong>{allFiles.length} tree entries indexed</strong><small>{truncated ? "GitHub tree response was truncated" : "Default branch snapshot"}</small></span><time>SCANNED</time></div></section>
                </div>
                <section className="prompt-panel"><div className="prompt-heading"><span className="prompt-spark"><Sparkles size={17} /></span><div><strong>What&apos;s the next big idea?</strong><small>Describe a feature, a fix or something entirely new.</small></div><span className="draft-label">MISSION DRAFTS</span></div><form className="mission-form" onSubmit={createMission}><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={`Tell your crew what to create in ${selectedProject?.name || "this project"}…`} rows={2} /><div className="mission-form-bottom"><span><Command size={13} /> Captured as a mission draft · no code is changed</span><button className="button button-primary small" type="submit" disabled={!prompt.trim()}><Sparkles size={14} /> Create mission <ArrowRight size={14} /></button></div></form></section>
              </>}
              {tab === "companies" && <section className="tab-content"><div className="panel-heading"><div><span className="section-kicker">PROJECT ORGANIZATION</span><h2>Your companies</h2><p>These groupings are mapped from repository structure. Nothing has been moved or rewritten.</p></div><button className="button button-primary small" onClick={() => setCompanyModal(true)}><Plus size={15} /> Create company</button></div><div className="company-grid">{projects.map((project) => <button key={project.id} className={`company-card ${project.id === selectedProject?.id ? "selected" : ""}`} onClick={() => setSelectedProjectId(project.id)}><div className="company-card-building" style={{ "--building-color": project.color } as React.CSSProperties}><div className="tower-windows" /></div><span className="company-card-meta"><span>{project.language}</span><span>{project.files.length} files</span></span><h3>{project.name}</h3><p>{project.root}</p><span className="company-card-link">Inspect company <ArrowUpRight size={14} /></span></button>)}</div><section className="panel file-inspector"><div className="panel-heading"><div><span className="section-kicker">COMPANY BLUEPRINT</span><h3>{selectedProject?.name || "Select a company"}</h3><p>{selectedProject?.root}</p></div><span className="quiet-pill">{selectedProject?.files.length || 0} FILES</span></div>{floors.map((floor, index) => <FloorRow key={floor.name} floor={floor} repoFullName={selectedRepo.full_name} branch={selectedRepo.default_branch} active={floorOpen === index} selectedFilePath={selectedFilePath} onClick={() => setFloorOpen(floorOpen === index ? -1 : index)} />)}</section><CrewBlueprint projectName={selectedProject?.name || "this company"} onConfigure={() => setSettingsOpen(true)} /></section>}
              {tab === "missions" && <section className="tab-content"><div className="panel-heading"><div><span className="section-kicker">WORK IN MOTION</span><h2>Mission control</h2><p>Capture what you want your future crew to work on.</p></div></div><section className="prompt-panel"><form className="mission-form" onSubmit={createMission}><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the next feature, improvement or product idea…" rows={3} /><div className="mission-form-bottom"><span>Saved locally as a draft</span><button className="button button-primary small" disabled={!prompt.trim()}><Plus size={14} /> Add mission</button></div></form></section>{missions.length ? <div className="mission-list">{missions.map((mission) => <article className="mission-card" key={mission.id}><span className="mission-icon"><Rocket size={17} /></span><div><span className="quiet-pill">{mission.status}</span><h3>{mission.prompt}</h3><p>{mission.projectName} · {new Date(mission.createdAt).toLocaleString()}</p></div><ArrowUpRight size={16} /></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Rocket size={22} /></div><h3>Your first mission is waiting.</h3><p>Capture an idea above and start shaping what your crew will build.</p></div>}</section>}
              <footer className="workspace-footer"><span>INCEPTOWN EARLY ACCESS · CITY ENGINE 0.1</span><span><ShieldCheck size={13} /> Read-only GitHub connection</span></footer>
            </div>
          </section>
          <aside className="right-rail">
            <div className="rail-heading"><span>COMPANY DETAILS</span><button className="icon-button" onClick={() => setSelectedProjectId("")}><X size={15} /></button></div>
            {selectedProject ? <>
              <div className="rail-building" style={{ "--building-color": selectedProject.color } as React.CSSProperties}><div className="rail-tower"><span /><span /><span /><span /><span /><span /></div><div className="rail-ground" /></div>
              <span className="section-kicker">PROJECT COMPANY</span><h2>{selectedProject.name}</h2><p className="rail-description">A project district inside {cityName}. Its source files are organized into functional floors.</p>
              <div className="rail-stats"><div><strong>{selectedProject.files.length}</strong><small>FILES</small></div><div><strong>{selectedProject.commits ? formatNumber(selectedProject.commits) : "—"}</strong><small>COMMITS</small></div></div>
              <div className="rail-divider" /><span className="section-kicker">BUILDING FLOORS</span><div className="rail-floor-list">{floors.map((floor, i) => <button key={floor.name} onClick={() => { setTab("companies"); setFloorOpen(i); }}><span className="floor-number">0{i + 1}</span><span>{floor.name}</span><strong>{floor.files.length}</strong><ChevronRight size={13} /></button>)}</div>
              <div className="rail-divider" /><span className="section-kicker">CREW BLUEPRINT</span><div className="rail-agent"><span className="crew-avatar crew-0">PM</span><span><strong>Project manager</strong><small>Planning & coordination</small></span><span className="idle-dot" /></div><div className="rail-agent"><span className="crew-avatar crew-2">DE</span><span><strong>Software engineer</strong><small>Implementation</small></span><span className="idle-dot" /></div><div className="rail-agent"><span className="crew-avatar crew-3">QA</span><span><strong>QA specialist</strong><small>Testing & review</small></span><span className="idle-dot" /></div><p className="rail-note"><CircleHelp size={13} /> Crew roles are templates until a secure agent runtime is connected.</p>
            </> : <div className="empty-rail"><Layers3 size={24} /><p>Select a company tower to inspect its floors and crew blueprint.</p></div>}
          </aside>
        </div>
      )}

      <AnimatePresence>
        {settingsOpen && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false); }}><motion.div className="settings-modal" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}><div className="modal-header"><div><span className="section-kicker">PREFERENCES & CONNECTIONS</span><h2>City settings</h2></div><button className="icon-button" onClick={() => setSettingsOpen(false)}><X size={17} /></button></div><div className="settings-section"><h3><Cpu size={16} /> AI provider preferences</h3><p>Choose the provider you plan to use with your future Inceptown agent runtime.</p><label className="field-label">PROVIDER</label><select value={provider} onChange={(e) => { const next = e.target.value; setProvider(next); setModel(next === "OpenAI" ? "GPT-4.1" : next === "Anthropic Claude" ? "Claude Sonnet" : next === "Google Gemini" ? "Gemini 2.5 Pro" : "Provider default"); }}><option>OpenAI</option><option>Anthropic Claude</option><option>Google Gemini</option><option>OpenRouter</option><option>Custom / compatible API</option></select><label className="field-label">PREFERRED MODEL</label><select value={model} onChange={(e) => setModel(e.target.value)}>{(provider === "OpenAI" ? ["GPT-4.1", "GPT-4.1 mini", "o3", "o4-mini"] : provider === "Anthropic Claude" ? ["Claude Sonnet", "Claude Opus", "Claude Haiku"] : provider === "Google Gemini" ? ["Gemini 2.5 Pro", "Gemini 2.5 Flash"] : ["Provider default", "Custom model"]).map((item) => <option key={item}>{item}</option>)}</select><div className="connection-status"><span className="status-indicator" /><div><strong>Secure connection not configured</strong><small>Provider preference: {provider} · {model}</small></div><span className="quiet-pill">PLANNED</span></div><div className="security-callout"><LockKeyhole size={17} /><p>API keys and subscription sign-in must be handled by a secure server-side connection. This browser-only foundation never asks for or stores your provider secrets. ChatGPT and Claude subscription access is only possible where each provider officially supports it.</p></div></div><div className="settings-section"><h3><Github size={16} /> GitHub connection</h3><div className="connection-status"><span className="status-indicator active" /><div><strong>Public repository access</strong><small>Connected through GitHub&apos;s public API</small></div><span className="quiet-pill">ACTIVE</span></div><p className="settings-hint">Private repositories and write access will require a GitHub App installation with granular permissions.</p></div><div className="modal-footer"><span>Settings are session-only in this foundation.</span><button className="button button-primary small" onClick={() => setSettingsOpen(false)}>Done <Check size={14} /></button></div></motion.div></motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {terminalOpen && <motion.div className="terminal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) setTerminalOpen(false); }}><motion.div className="terminal-window" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}><div className="terminal-titlebar"><div className="terminal-dots"><i /><i /><i /></div><span><TerminalSquare size={14} /> INCEPTOWN INSPECTOR</span><button onClick={() => setTerminalOpen(false)}><X size={16} /></button></div><div className="terminal-meta"><span>READ-ONLY REPOSITORY CONSOLE</span><span>{selectedRepo?.full_name}</span></div><div className="terminal-output">{terminalLines.map((line, i) => <div key={i} className={line.startsWith("inceptown $") ? "terminal-command" : ""}>{line || " "}</div>)}</div><form className="terminal-form" onSubmit={runConsole}><span>inceptown $</span><input value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} placeholder={terminalBusy ? "Reading repository…" : "Type a command…"} autoFocus disabled={terminalBusy} /><button type="submit" disabled={terminalBusy}><ArrowUpRight size={16} /></button></form><div className="terminal-foot">Read-only GitHub inspector · try <code>help</code>, <code>ls</code>, <code>find</code>, <code>cat README.md</code> · no shell execution or repository writes.</div></motion.div></motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {companyModal && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) setCompanyModal(false); }}><motion.form className="settings-modal company-modal" onSubmit={createCompany} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}><div className="modal-header"><div><span className="section-kicker">EXPAND YOUR CITY</span><h2>Establish a company</h2></div><button type="button" className="icon-button" onClick={() => setCompanyModal(false)}><X size={17} /></button></div><p className="settings-hint">Start a new project from an idea, or connect an existing folder. This creates a city organization and mission draft only — it does not write code to GitHub.</p>{error && <p className="inline-error">{error}</p>}<label className="field-label">COMPANY NAME</label><input className="text-field" required value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="e.g. Customer mobile app" /><label className="field-label">EXISTING REPOSITORY FOLDER (OPTIONAL)</label><input className="text-field" value={newCompanyPath} onChange={(e) => setNewCompanyPath(e.target.value)} placeholder="e.g. apps/customer" /><label className="field-label">WHAT SHOULD THIS COMPANY BUILD?</label><textarea className="text-field company-brief" value={newCompanyPrompt} onChange={(e) => setNewCompanyPrompt(e.target.value)} placeholder="Describe the product or feature you want this team to create…" rows={4} /><div className="modal-footer"><span>Idea briefs become mission drafts.</span><button className="button button-primary small" type="submit">Create company <ArrowRight size={14} /></button></div></motion.form></motion.div>}
      </AnimatePresence>
    </main>
  );
}
