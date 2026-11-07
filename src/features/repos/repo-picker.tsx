"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Lock, GitBranch } from "lucide-react";
import {
  Badge,
  EmptyState,
  ErrorState,
  SearchInput,
  Skeleton,
} from "@/components/ui";
import type { Repo } from "@/lib/github";
export default function RepoPicker({ initial }: { initial: Repo[] }) {
  const [query, setQuery] = useState(""),
    [visibility, setVisibility] = useState("all"),
    [language, setLanguage] = useState("all"),
    [active, setActive] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const search = useRef<HTMLInputElement>(null),
    languages = [
      ...new Set(initial.map((r) => r.language).filter(Boolean)),
    ] as string[];
  const rows = useMemo(
    () =>
      initial.filter(
        (r) =>
          (visibility === "all" || (visibility === "private") === r.private) &&
          (language === "all" || r.language === language) &&
          `${r.fullName} ${r.description || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [initial, query, visibility, language],
  );
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        search.current?.focus();
      }
      if (e.key === "ArrowDown")
        setActive((v) => Math.min(rows.length - 1, v + 1));
      if (e.key === "ArrowUp") setActive((v) => Math.max(0, v - 1));
      if (
        e.key === "Enter" &&
        document.activeElement?.tagName !== "INPUT" &&
        rows[active]
      )
        void choose(rows[active]);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  });
  async function choose(repo: Repo) {
    setBusy(true);
    setError("");
    const res = await fetch("/api/repos/select", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token":
          document.cookie.match(/(?:^|; )coc_csrf=([^;]+)/)?.[1] || "",
      },
      body: JSON.stringify(repo),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Repository could not be selected.");
      setBusy(false);
      return;
    }
    location.href = `/city/${data.id}`;
  }
  return (
    <>
      <div className="toolbar">
        <SearchInput
          ref={search as never}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search repositories  /"
          aria-label="Search repositories"
        />
        <select
          className="ui-input"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          aria-label="Visibility"
        >
          <option value="all">All visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <select
          className="ui-input"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Language"
        >
          <option value="all">All languages</option>
          {languages.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      {error && <ErrorState title="Selection failed" body={error} />}
      <div className="repo-list" role="listbox" aria-label="Repositories">
        {busy && <Skeleton />}
        {!busy &&
          rows.map((repo, i) => (
            <button
              className="repo-row"
              role="option"
              aria-selected={i === active}
              data-active={i === active}
              key={repo.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(repo)}
            >
              <div>
                <div className="repo-name">
                  {repo.private && <Lock size={13} />} {repo.fullName}{" "}
                  <Badge>{repo.private ? "Private" : "Public"}</Badge>
                </div>
                <p className="repo-desc">
                  {repo.description || "No description provided."}
                </p>
                <div className="repo-meta">
                  <span>
                    <span className="lang-dot" />
                    {repo.language || "Unknown"}
                  </span>
                  <span>
                    <GitBranch size={11} /> {repo.defaultBranch}
                  </span>
                  <span>
                    {repo.pushedAt
                      ? new Date(repo.pushedAt).toLocaleDateString()
                      : "No pushes"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        {!busy && !rows.length && (
          <EmptyState
            title="No repositories found"
            body="Change your search or filters."
          />
        )}
      </div>
    </>
  );
}
