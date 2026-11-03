import type { GitHubRepo, Project, RepoFile } from "@/types/inceptown";

const API = "https://api.github.com";
const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };

async function github<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers, cache: "no-store" });
  if (!response.ok) {
    if (response.status === 404) throw new Error("We couldn't find that GitHub user or repository.");
    if (response.status === 403) throw new Error("GitHub's public API rate limit was reached. Please try again in a little while.");
    throw new Error(`GitHub returned an error (${response.status}). Please try again.`);
  }
  return response.json() as Promise<T>;
}

export async function getUserRepos(username: string): Promise<GitHubRepo[]> {
  const clean = username.trim().replace(/^@/, "");
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(clean)) throw new Error("Enter a valid GitHub username.");
  const repos = await github<GitHubRepo[]>(`${API}/users/${encodeURIComponent(clean)}/repos?per_page=100&sort=updated&type=owner`);
  return repos.filter((repo) => !repo.private);
}

const manifestNames = new Set([
  "package.json", "pubspec.yaml", "pyproject.toml", "requirements.txt", "Cargo.toml",
  "go.mod", "pom.xml", "build.gradle", "build.gradle.kts", "composer.json",
  "Gemfile", "mix.exs", "Package.swift", "CMakeLists.txt", "*.sln"
]);
const colors = ["#73F0C2", "#788BFF", "#FFB86B", "#F18EBC", "#8BD3FF", "#B8A1FF"];

function rootOf(path: string) {
  const parts = path.split("/");
  return parts.length > 1 ? parts.slice(0, -1).join("/") : "";
}

function projectLabel(root: string, repoName: string) {
  if (!root) return repoName.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const leaf = root.split("/").filter(Boolean).pop() || root;
  return leaf.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function organizeProjects(repo: GitHubRepo, entries: RepoFile[], commitCount = 0): Project[] {
  const files = entries.filter((entry) => entry.type === "blob");
  const roots = new Set<string>();

  for (const file of files) {
    const name = file.path.split("/").pop() || "";
    if (manifestNames.has(name) || name.endsWith(".sln")) roots.add(rootOf(file.path));
  }

  // A repository without clear package boundaries starts as one company.
  const selectedRoots = roots.size ? [...roots].sort((a, b) => a.split("/").length - b.split("/").length) : [""];
  const deduped = selectedRoots.filter((root, index) => !selectedRoots.slice(0, index).some((parent) => parent === "" || root.startsWith(parent + "/")));
  const finalRoots = deduped.length ? deduped : [""];

  return finalRoots.map((root, index) => {
    const scoped = files.filter((file) => root ? file.path === root || file.path.startsWith(root + "/") : true);
    const primary = repo.language || "Mixed stack";
    return {
      id: `${repo.id}-${index}`,
      name: projectLabel(root, repo.name),
      root: root || "/",
      files: scoped,
      language: primary,
      commits: commitCount,
      stars: repo.stargazers_count,
      color: colors[index % colors.length],
    };
  });
}

export async function getRepoSnapshot(repo: GitHubRepo) {
  const tree = await github<{ tree: RepoFile[]; truncated: boolean }>(
    `${API}/repos/${repo.full_name}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`
  );
  let commits = 0;
  try {
    const response = await fetch(`${API}/repos/${repo.full_name}/commits?per_page=1`, { headers });
    const link = response.headers.get("link") || "";
    const last = link.match(/[?&]page=(\d+)>; rel="last"/);
    commits = last ? Number(last[1]) : response.ok ? (await response.json()).length : 0;
  } catch {
    commits = 0;
  }
  const projects = organizeProjects(repo, tree.tree || [], commits);
  return { files: tree.tree || [], projects, commits, truncated: tree.truncated };
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value > 999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}
