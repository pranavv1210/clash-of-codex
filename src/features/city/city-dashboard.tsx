"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowUpRight, Boxes, Code2, Database, FileCode2,
  Folder, GitBranch, GitFork, LockKeyhole, RefreshCw, Search,
  ShieldCheck, Sparkles, Star, Terminal, Workflow,
} from "lucide-react";
import type { RepositoryCity } from "@/lib/github";
import "./city.css";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function districtKind(name: string) {
  const value = name.toLowerCase();
  if (/test|spec|qa/.test(value)) return "quality";
  if (/doc|wiki|readme/.test(value)) return "knowledge";
  if (/api|server|backend|service/.test(value)) return "systems";
  if (/ui|web|app|client|component/.test(value)) return "product";
  if (/data|model|ml|ai|train/.test(value)) return "intelligence";
  if (/infra|deploy|docker|kube|terraform|\.github/.test(value)) return "operations";
  return "engineering";
}
const districtIcons = {
  quality: ShieldCheck,
  knowledge: FileCode2,
  systems: Database,
  product: Boxes,
  intelligence: Sparkles,
  operations: Workflow,
  engineering: Terminal,
};

export default function CityDashboard({
  city,
  error,
}: {
  city: RepositoryCity | null;
  error: string;
}) {
  const [query, setQuery] = useState("");
  const [activeDistrict, setActiveDistrict] = useState("All files");
  const [tab, setTab] = useState<"overview" | "files">("overview");
  const files = useMemo(() => {
    if (!city) return [];
    return city.files.filter((file) => {
      const matchesQuery = file.path.toLowerCase().includes(query.toLowerCase());
      const root = file.path.includes("/") ? file.path.split("/")[0] : "Root";
      return matchesQuery && (activeDistrict === "All files" || root === activeDistrict);
    });
  }, [city, query, activeDistrict]);

  if (!city) {
    return (
      <main className="shell city-shell">
        <header className="topbar"><a className="wordmark" href="/repos"><span className="mark"><Code2 size={15} /></span>Clash of Codex</a></header>
        <div className="city-error"><span className="label">Repository scan</span><h1>We couldn’t build this city yet.</h1><p>{error || "The selected repository could not be found."}</p><a className="ui-button ui-secondary" href="/repos">Back to repositories</a></div>
      </main>
    );
  }

  const maxFiles = Math.max(1, ...city.districts.map((district) => district.files));
  return (
    <main className="shell city-shell">
      <header className="topbar city-topbar">
        <a className="wordmark" href="/repos"><span className="mark"><Code2 size={15} /></span>Clash of Codex</a>
        <span className="topbar-spacer" />
        <span className="city-branch"><GitBranch size={13} /> {city.defaultBranch}</span>
        <span className="city-visibility">{city.visibility === "Private" ? <LockKeyhole size={12} /> : <ShieldCheck size={12} />}{city.visibility}</span>
      </header>

      <div className="city-page">
        <div className="city-heading">
          <div>
            <a href="/repos" className="city-back"><ArrowLeft size={14} /> All repositories</a>
            <span className="label">Your repository, reimagined</span>
            <h1>{city.fullName}</h1>
            <p>{city.description || "A new world built from the structure of your codebase."}</p>
          </div>
          <div className="city-heading-actions"><span className="city-live"><i /> Scan complete</span><a className="ui-button ui-secondary" href={`https://github.com/${city.fullName}`} target="_blank" rel="noreferrer">Open on GitHub <ArrowUpRight size={14} /></a></div>
        </div>

        {city.truncated && <div className="city-notice">GitHub returned a truncated file tree. Counts represent the files included in the available scan.</div>}

        <section className="city-metrics" aria-label="Repository metrics">
          <article><span><FileCode2 size={15} /> Files indexed</span><strong>{city.fileCount.toLocaleString()}</strong><small>Up to 300 paths shown below</small></article>
          <article><span><Folder size={15} /> Districts</span><strong>{city.directoryCount.toLocaleString()}</strong><small>Top-level code areas</small></article>
          <article><span><Star size={15} /> Stars</span><strong>{city.stars.toLocaleString()}</strong><small>GitHub repository stars</small></article>
          <article><span><GitFork size={15} /> Forks</span><strong>{city.forks.toLocaleString()}</strong><small>{city.openIssues.toLocaleString()} open issues</small></article>
        </section>

        <div className="city-tabs" role="tablist" aria-label="City views">
          <button role="tab" aria-selected={tab === "overview"} onClick={() => setTab("overview")}>City overview</button>
          <button role="tab" aria-selected={tab === "files"} onClick={() => setTab("files")}>File explorer <span>{city.fileCount}</span></button>
        </div>

        {tab === "overview" ? (
          <div className="city-layout">
            <section className="city-world-panel">
              <div className="city-panel-heading"><div><span className="label">Live codebase map</span><h2>Startup City</h2></div><span className="city-map-key"><i /> Active district</span></div>
              <div className="city-world">
                <div className="city-grid-floor" />
                <div className="city-skyline">
                  {city.districts.slice(0, 8).map((district, index) => {
                    const kind = districtKind(district.name);
                    const Icon = districtIcons[kind];
                    const height = 54 + Math.round((district.files / maxFiles) * 118);
                    return (
                      <button key={district.name} className={`city-building district-${kind}`} style={{ "--building-height": `${height}px`, "--building-index": index } as React.CSSProperties} onClick={() => { setActiveDistrict(district.name); setTab("files"); }}>
                        <span className="city-building-cap"><Icon size={17} /></span>
                        <span className="city-building-body"><i /><i /><i /></span>
                        <span className="city-building-label">{district.name}</span>
                        <span className="city-building-count">{district.files} files</span>
                      </button>
                    );
                  })}
                </div>
                <div className="city-world-caption"><span><Sparkles size={13} /> Districts are generated from repository folders</span><span>{city.directoryCount} areas detected</span></div>
              </div>
              <div className="city-district-list">
                {city.districts.slice(0, 6).map((district) => <button key={district.name} onClick={() => { setActiveDistrict(district.name); setTab("files"); }}><span>{district.name}</span><strong>{district.files} files</strong><i><b style={{ width: `${Math.max(5, (district.files / maxFiles) * 100)}%` }} /></i></button>)}
              </div>
            </section>

            <aside className="city-side">
              <section className="city-side-panel"><span className="label">Language ecosystem</span><h2>What this city runs on</h2>
                {city.languages.length ? city.languages.slice(0, 6).map((language) => <div className="city-language" key={language.name}><div><span>{language.name}</span><strong>{language.percent}%</strong></div><i><b style={{ width: `${language.percent}%` }} /></i></div>) : <p className="city-muted">GitHub has no language breakdown for this repository.</p>}
              </section>
              <section className="city-side-panel city-footprint"><span className="label">Repository footprint</span><strong>{formatBytes(city.totalBytes)}</strong><p>Tracked file content size in the scanned tree</p><div><span>Default branch</span><b>{city.defaultBranch}</b></div><div><span>Primary language</span><b>{city.language || "Not detected"}</b></div><div><span>Visibility</span><b>{city.visibility}</b></div></section>
              <section className="city-side-panel city-next"><span className="label">City systems</span><h2>Foundation established</h2><p>Your repository structure now defines the first districts. The next layer can turn commits, issues, and workflows into live city activity.</p><span className="city-scan-time"><RefreshCw size={12} /> Scanned {new Date(city.scannedAt).toLocaleString()}</span></section>
            </aside>
          </div>
        ) : (
          <section className="city-files-panel">
            <div className="city-files-toolbar"><div><span className="label">Repository tree</span><h2>Explore the districts</h2></div><label className="city-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search file paths" /></label></div>
            <div className="city-filter-row"><button className={activeDistrict === "All files" ? "active" : ""} onClick={() => setActiveDistrict("All files")}>All files</button>{city.districts.map((district) => <button key={district.name} className={activeDistrict === district.name ? "active" : ""} onClick={() => setActiveDistrict(district.name)}>{district.name}</button>)}</div>
            <div className="city-file-list">{files.map((file) => <div className="city-file-row" key={file.path}><FileCode2 size={15} /><span>{file.path}</span><small>{file.extension}</small><b>{formatBytes(file.size)}</b></div>)}{!files.length && <p className="city-muted">No files match this search.</p>}</div>
            <p className="city-file-footnote">Showing up to 300 paths from the repository tree. File contents are not downloaded or stored.</p>
          </section>
        )}
        <footer className="city-footer"><span>CLASH OF CODEX / STARTUP CITY</span><span>Repository-derived world · {city.fullName}</span></footer>
      </div>
    </main>
  );
}
