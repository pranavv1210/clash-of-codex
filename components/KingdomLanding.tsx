"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Code2,
  Command,
  FileCode2,
  GitFork,
  Github,
  LoaderCircle,
  LockKeyhole,
  Map as MapIcon,
  Radio,
  Search,
  ShieldAlert,
  Star,
  TerminalSquare,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  formatNumber,
  getAuthenticatedRepos,
  getFileLanguage,
  getRepoSnapshot,
  getUserRepos,
} from "@/lib/github";
import type { GitHubRepo, Project, RepoFile } from "@/types/inceptown";
import type { RuntimeDiagnostics } from "@/types/codex-city";
import styles from "./KingdomLanding.module.css";

const CityScene = dynamic(() => import("@/components/CityScene"), {
  ssr: false,
  loading: () => (
    <div className={styles.loading}>
      <LoaderCircle /> Mapping city structures…
    </div>
  ),
});
type Transmission = { id: string; label: string; detail: string; time: string };
type GitHubViewer = {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  profileUrl: string;
};
const clock = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function KingdomLanding() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [commits, setCommits] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [permissionMode, setPermissionMode] = useState<"ask" | "safe">("ask");
  const [order, setOrder] = useState("");
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [runtime, setRuntime] = useState<RuntimeDiagnostics | null>(null);
  const [viewer, setViewer] = useState<GitHubViewer | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [repoQuery, setRepoQuery] = useState("");
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const selectedFile = selectedProject?.files.find(
    (file) => file.path === selectedFilePath,
  );
  const sourceFiles = useMemo(
    () => files.filter((file) => file.type === "blob"),
    [files],
  );
  const directories = useMemo(
    () =>
      new Set(
        sourceFiles.flatMap((file) =>
          file.path
            .split("/")
            .slice(0, -1)
            .map((_, i, parts) => parts.slice(0, i + 1).join("/")),
        ),
      ).size,
    [sourceFiles],
  );
  const languages = useMemo(() => {
    const counts = new globalThis.Map<string, number>();
    sourceFiles.forEach((file) => {
      const language = getFileLanguage(file.path) || "Other";
      counts.set(language, (counts.get(language) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [sourceFiles]);
  const results = useMemo(
    () =>
      query
        ? sourceFiles
            .filter((file) =>
              file.path.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 30)
        : [],
    [query, sourceFiles],
  );

  useEffect(() => {
    void (async () => {
      try {
        const oauthResult = new URLSearchParams(window.location.search).get(
          "github",
        );
        if (oauthResult) {
          setError(
            oauthResult === "invalid-state"
              ? "GitHub sign-in expired. Start the connection again."
              : "GitHub could not complete sign-in. Check the OAuth callback and try again.",
          );
          window.history.replaceState({}, "", window.location.pathname);
        }
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const session = (await response.json()) as {
          user: GitHubViewer | null;
        };
        setViewer(session.user);
        if (session.user) setRepos(await getAuthenticatedRepos());
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "GitHub session could not be restored.",
        );
      } finally {
        setAuthLoading(false);
      }
    })();
    void fetch("/api/runtime/status", { cache: "no-store" })
      .then((response) =>
        response.ok
          ? (response.json() as Promise<RuntimeDiagnostics>)
          : Promise.reject(),
      )
      .then(setRuntime)
      .catch(() => setRuntime(null));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function transmit(label: string, detail: string) {
    setTransmissions((items) =>
      [
        { id: crypto.randomUUID(), label, detail, time: clock() },
        ...items,
      ].slice(0, 8),
    );
  }
  async function discover(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      setRepos(await getUserRepos(username));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "GitHub discovery failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function openCity(next: GitHubRepo, restoring = false) {
    setBusy(true);
    setError("");
    try {
      const snapshot = await getRepoSnapshot(next);
      setFiles(snapshot.files);
      setProjects(snapshot.projects);
      setCommits(snapshot.commits);
      setSelectedProjectId(snapshot.projects[0]?.id || "");
      setRepo(next);
      localStorage.setItem("codex-city:repo:v1", JSON.stringify(next));
      transmit(
        restoring ? "CITY RESTORED" : "REPOSITORY SCANNED",
        `${snapshot.files.length} structures mapped from ${next.default_branch}`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Repository scan failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  function inspectFile(projectId: string, path: string) {
    setSelectedProjectId(projectId);
    setSelectedFilePath(path);
    transmit("FILE INSPECTED", path);
  }
  function chooseFile(file: RepoFile) {
    const project = projects.find((item) =>
      item.files.some((candidate) => candidate.path === file.path),
    );
    if (project) inspectFile(project.id, file.path);
    setSearchOpen(false);
    setQuery("");
  }

  if (authLoading) return <AuthGate loading />;
  if (!viewer) return <AuthGate error={error} />;
  if (!repo)
    return (
      <RepositoryRealm
        viewer={viewer}
        repos={repos}
        query={repoQuery}
        onQuery={setRepoQuery}
        onOpen={openCity}
        busy={busy}
        error={error}
      />
    );

  return (
    <main className={styles.cityShell}>
      <div className={styles.cityStage}>
        <CityScene
          projects={projects}
          selectedProjectId={selectedProjectId}
          selectedFilePath={selectedFilePath}
          onSelect={(id) => {
            setSelectedProjectId(id);
            setSelectedFilePath("");
          }}
          onSelectFile={inspectFile}
        />
      </div>
      <header className={styles.cityBrand}>
        <span>
          <Code2 />
        </span>
        <div>
          <strong>CODEX CITY</strong>
          <small>SOFTWARE OPERATIONS MAP</small>
        </div>
        <button onClick={() => setSearchOpen(true)} disabled={!repo}>
          <Search /> SEARCH
        </button>
      </header>

      <aside className={`${styles.panel} ${styles.scan}`}>
        <Title
          icon={<Radio />}
          label="CITY SCAN"
          state={repo ? "SYNCED" : viewer ? "SIGNED IN" : "OFFLINE"}
          good={!!repo || !!viewer}
        />
        <strong className={styles.big}>
          {repo ? formatNumber(files.length) : "—"}
        </strong>
        <small>STRUCTURES MAPPED</small>
        <div className={styles.metrics}>
          <Metric value={directories || "—"} label="DIRECTORIES" />
          <Metric value={sourceFiles.length || "—"} label="FILES" />
          <Metric value={languages.length || "—"} label="LANGUAGES" />
        </div>
        <div className={styles.langs}>
          {languages.slice(0, 5).map(([language, count]) => (
            <span key={language}>
              {language.slice(0, 3).toUpperCase()} <b>{count}</b>
            </span>
          ))}
        </div>
        <div className={styles.changes}>
          <span>
            ADDED <b>—</b>
          </span>
          <span>
            MODIFIED <b>—</b>
          </span>
          <span>
            DELETED <b>—</b>
          </span>
        </div>
        {!repo &&
          (authLoading ? (
            <div className={styles.authButton}>
              <LoaderCircle /> CHECKING GITHUB
            </div>
          ) : viewer ? (
            <div className={styles.account}>
              <img src={viewer.avatarUrl} alt="" />
              <span>
                <strong>{viewer.name || viewer.login}</strong>
                <small>
                  @{viewer.login} · {repos.length} repositories
                </small>
              </span>
              <form action="/api/auth/logout" method="post">
                <button title="Sign out">OUT</button>
              </form>
            </div>
          ) : (
            <a className={styles.authButton} href="/api/auth/github">
              <Github /> SIGN IN WITH GITHUB
            </a>
          ))}
        {!repo && !viewer && (
          <form className={styles.connect} onSubmit={discover}>
            <label>OR SCAN A PUBLIC GITHUB USER</label>
            <div>
              <Github />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
              />
              <button disabled={busy || !username.trim()}>
                {busy ? <LoaderCircle /> : "SCAN"}
              </button>
            </div>
          </form>
        )}
        {error && <p className={styles.error}>{error}</p>}
        {!repo && repos.length > 0 && (
          <div className={styles.repos}>
            {repos.slice(0, 20).map((item) => (
              <button key={item.id} onClick={() => void openCity(item)}>
                <span>
                  <strong>
                    {item.name}
                    {item.private ? " · PRIVATE" : ""}
                  </strong>
                  <small>
                    {item.language || "Mixed"} · {item.default_branch}
                  </small>
                </span>
                <b>OPEN</b>
              </button>
            ))}
          </div>
        )}
      </aside>

      <aside className={`${styles.panel} ${styles.mayor}`}>
        <Title
          label="CODEX · MAYOR CONSOLE"
          state={
            runtime?.codex.reachable
              ? "CONNECTED"
              : runtime?.codex.configured
                ? "UNREACHABLE"
                : "NOT CONFIGURED"
          }
          good={runtime?.codex.reachable}
        />
        <div className={styles.repo}>
          <Github />
          <span>
            <strong>{repo?.full_name || "No repository connected"}</strong>
            <small>
              {repo
                ? `${repo.default_branch} · ${formatNumber(commits)} commits observed`
                : "Connect GitHub to initialize the city"}
            </small>
          </span>
        </div>
        <div className={styles.agent}>
          <span>CX</span>
          <div>
            <strong>Codex crew</strong>
            <small>
              {runtime?.codex.message || "Checking server runtime diagnostics…"}
            </small>
          </div>
          <i className={runtime?.codex.reachable ? styles.connected : ""} />
        </div>
        <section className={styles.permit}>
          <ShieldAlert />
          <span>
            <strong>NO PENDING PERMITS</strong>
            <small>
              Requests appear only from a connected execution backend.
            </small>
          </span>
        </section>
        <h3>
          <Activity /> TRANSMISSIONS <span>REAL EVENTS ONLY</span>
        </h3>
        <div className={styles.feed}>
          {transmissions.length ? (
            transmissions.map((item) => (
              <div key={item.id}>
                <time>{item.time}</time>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
              </div>
            ))
          ) : (
            <p>No repository events received in this session.</p>
          )}
        </div>
      </aside>

      <aside className={`${styles.panel} ${styles.order}`}>
        <Title
          icon={<Command />}
          label="MAYOR'S ORDER"
          state={runtime?.codex.reachable ? "RUNTIME READY" : "SETUP REQUIRED"}
          good={runtime?.codex.reachable}
        />
        <div className={styles.orderMeta}>
          <Metric value="Codex worker" label="CREW" />
          <Metric
            value={runtime?.codex.reachable ? "Runtime catalog" : "Unavailable"}
            label="EFFORT"
          />
        </div>
        <div className={styles.policy}>
          <button
            className={permissionMode === "ask" ? styles.active : ""}
            onClick={() => setPermissionMode("ask")}
          >
            ASK MAYOR
          </button>
          <button
            className={permissionMode === "safe" ? styles.active : ""}
            onClick={() => setPermissionMode("safe")}
          >
            AUTO-SAFE
          </button>
        </div>
        <p>
          {permissionMode === "ask"
            ? "Sensitive operations pause for explicit mayor approval."
            : "Only safe and reversible operations may run automatically."}
        </p>
        <textarea
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder={
            selectedFile
              ? `Order for ${selectedFile.path}`
              : "What should the crew build?"
          }
        />
        <button
          className={styles.dispatch}
          disabled
          title={
            runtime?.codex.reachable
              ? "Mission transport is not enabled in this deployment."
              : "Configure a supported Codex runtime on the server."
          }
        >
          <TerminalSquare />{" "}
          {runtime?.codex.reachable
            ? "ADAPTER REQUIRED"
            : "DISPATCH UNAVAILABLE"}
        </button>
      </aside>

      {selectedFile && (
        <aside className={`${styles.panel} ${styles.inspector}`}>
          <Title
            icon={<FileCode2 />}
            label="FILE INSPECTOR"
            action={() => setSelectedFilePath("")}
          />
          <h2>{selectedFile.path.split("/").pop()}</h2>
          <code>{selectedFile.path}</code>
          <dl>
            <Metric
              label="LANGUAGE"
              value={getFileLanguage(selectedFile.path) || "Unknown"}
            />
            <Metric
              label="SIZE"
              value={
                selectedFile.size
                  ? `${formatNumber(selectedFile.size)} B`
                  : "Unavailable"
              }
            />
            <Metric label="DISTRICT" value={selectedProject?.name || "—"} />
            <Metric label="GIT STATE" value="Snapshot" />
          </dl>
          <a
            href={`https://github.com/${repo?.full_name}/blob/${repo?.default_branch}/${selectedFile.path.split("/").map(encodeURIComponent).join("/")}`}
            target="_blank"
            rel="noreferrer"
          >
            OPEN ON GITHUB
          </a>
        </aside>
      )}
      <div className={styles.hint}>
        DRAG TO ORBIT · SCROLL TO ZOOM · SELECT A STRUCTURE
      </div>
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSearchOpen(false);
            }}
          >
            <motion.section
              className={styles.searchModal}
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
            >
              <div>
                <Search />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search mapped files…"
                />
                <button onClick={() => setSearchOpen(false)}>
                  <X />
                </button>
              </div>
              {results.map((file) => (
                <button key={file.path} onClick={() => chooseFile(file)}>
                  <FileCode2 />
                  <span>
                    <strong>{file.path.split("/").pop()}</strong>
                    <small>{file.path}</small>
                  </span>
                  <b>{getFileLanguage(file.path) || "FILE"}</b>
                </button>
              ))}
              {query && !results.length && (
                <p>No mapped file matches that search.</p>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Title({
  icon,
  label,
  state,
  good,
  action,
}: {
  icon?: React.ReactNode;
  label: string;
  state?: string;
  good?: boolean;
  action?: () => void;
}) {
  return (
    <div className={styles.title}>
      <span>
        {icon}
        {label}
      </span>
      {action ? (
        <button onClick={action}>
          <X />
        </button>
      ) : (
        state && <b className={good ? styles.good : ""}>{state}</b>
      )}
    </div>
  );
}
function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

function RepositoryRealm({
  viewer,
  repos,
  query,
  onQuery,
  onOpen,
  busy,
  error,
}: {
  viewer: GitHubViewer;
  repos: GitHubRepo[];
  query: string;
  onQuery: (value: string) => void;
  onOpen: (repo: GitHubRepo) => void;
  busy: boolean;
  error: string;
}) {
  const visible = repos.filter((repo) =>
    `${repo.name} ${repo.description || ""} ${repo.language || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <main className={styles.realm}>
      <div className={styles.realmSky}>
        <i />
        <i />
        <i />
      </div>
      <header className={styles.realmBar}>
        <div className={styles.realmBrand}>
          <span>
            <Code2 />
          </span>
          <strong>Codex City</strong>
        </div>
        <div className={styles.realmResources}>
          <span>
            <Star />{" "}
            {repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
          </span>
          <span>
            <GitFork /> {repos.reduce((sum, repo) => sum + repo.forks_count, 0)}
          </span>
          <span className={styles.realmGold}>{repos.length} VILLAGES</span>
        </div>
        <div className={styles.realmMayor}>
          <img src={viewer.avatarUrl} alt="" />
          <span>
            <strong>{viewer.name || viewer.login}</strong>
            <small>@{viewer.login}</small>
          </span>
          <form action="/api/auth/logout" method="post">
            <button>LOG OUT</button>
          </form>
        </div>
      </header>
      <section className={styles.realmIntro}>
        <span>THE MAYOR&apos;S ATLAS</span>
        <h1>Choose your village</h1>
        <p>
          Every repository becomes a living software settlement. Pick one to
          raise its Town Hall, districts, builders, roads, and code structures.
        </p>
        <label>
          <Search />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search your repositories"
          />
        </label>
      </section>
      {error && <p className={styles.realmError}>{error}</p>}
      <section className={styles.realmGrid}>
        {visible.map((item, index) => (
          <button
            key={item.id}
            className={styles.realmTile}
            onClick={() => onOpen(item)}
            disabled={busy}
            style={
              {
                "--realm-accent": [
                  "#f5b52e",
                  "#60a951",
                  "#66b7d6",
                  "#d96f50",
                  "#9f79c5",
                ][index % 5],
              } as React.CSSProperties
            }
          >
            <span className={styles.realmTower}>
              <i />
              <i />
              <i />
            </span>
            <span className={styles.realmInfo}>
              <span className={styles.realmMeta}>
                {item.private ? (
                  <>
                    <LockKeyhole /> PRIVATE VILLAGE
                  </>
                ) : (
                  <>
                    <Github /> PUBLIC VILLAGE
                  </>
                )}
              </span>
              <strong>{item.name}</strong>
              <small>
                {item.description || "A repository waiting to become a city."}
              </small>
              <span className={styles.realmStats}>
                <b>{item.language || "Mixed"}</b>
                <b>
                  <Star /> {item.stargazers_count}
                </b>
                <b>
                  <GitFork /> {item.forks_count}
                </b>
              </span>
            </span>
            <span className={styles.realmEnter}>BUILD CITY</span>
          </button>
        ))}
      </section>
      {!visible.length && (
        <div className={styles.realmEmpty}>
          <MapIcon />
          <strong>No village matches that search.</strong>
          <button onClick={() => onQuery("")}>SHOW ALL REPOSITORIES</button>
        </div>
      )}
      {busy && (
        <div className={styles.realmBuild}>
          <div>
            <LoaderCircle />
            <strong>Raising your city…</strong>
            <small>
              Surveying branches, mapping files, and assigning builders.
            </small>
          </div>
        </div>
      )}
    </main>
  );
}

function AuthGate({
  loading = false,
  error = "",
}: {
  loading?: boolean;
  error?: string;
}) {
  return (
    <main className={styles.gate}>
      <div className={styles.gateGrid} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className={styles.gateBeacon} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <header className={styles.gateBrand}>
        <span>
          <Code2 />
        </span>
        <div>
          <strong>Codex City</strong>
          <small>Software operations kingdom</small>
        </div>
        <b>GATE 01</b>
      </header>
      <section className={styles.gateCard} aria-busy={loading}>
        <div className={styles.gateCrest}>
          <Github />
        </div>
        <p className={styles.gateSignal}>
          {loading ? "Verifying city passport" : "The city gates are closed"}
        </p>
        <h1>
          {loading ? "Checking your GitHub session…" : "Enter with GitHub"}
        </h1>
        <p className={styles.gateCopy}>
          {loading
            ? "Your city opens automatically when the session is ready."
            : "Sign in to discover repositories you can access, choose a codebase, and generate your own engineering city."}
        </p>
        {error && <p className={styles.gateError}>{error}</p>}
        {loading ? (
          <div className={styles.gateLoading}>
            <LoaderCircle /> CONTACTING GITHUB
          </div>
        ) : (
          <a className={styles.gateEnter} href="/api/auth/github">
            <Github /> SIGN IN AND ENTER CITY
          </a>
        )}
        <div className={styles.gateRules}>
          <span>
            <ShieldAlert /> Encrypted session
          </span>
          <span>
            <FileCode2 /> Read-only scans
          </span>
          <span>
            <MapIcon /> Your repositories
          </span>
        </div>
      </section>
      <aside className={styles.gateStatus}>
        <strong>World status</strong>
        <span>
          <i /> GitHub gateway ready
        </span>
        <span>
          <i /> Private cities supported
        </span>
        <span>
          <i /> Personal sessions isolated
        </span>
      </aside>
      <footer className={styles.gateFooter}>
        <span>CODEX CITY · MAYOR ACCESS TERMINAL</span>
        <span>Every mayor enters their own city.</span>
      </footer>
    </main>
  );
}
