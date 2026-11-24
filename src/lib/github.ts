import { Octokit } from "octokit";
import { decrypt } from "./crypto";
import { db, userQuery } from "./db";

export type Repo = {
  id: number;
  fullName: string;
  owner: string;
  name: string;
  private: boolean;
  defaultBranch: string;
  description: string | null;
  language: string | null;
  pushedAt: string | null;
};

export async function reposFor(userId: string, page = 1) {
  const { rows } = await db().query(
    "select access_token_encrypted from github_accounts where user_id=$1",
    [userId],
  );
  if (!rows[0]) throw new Error("GitHub account is not connected.");
  const token = decrypt(
    rows[0].access_token_encrypted,
    process.env.SESSION_SECRET!,
  );
  const api = new Octokit({ auth: token });
  const response = await api.rest.repos.listForAuthenticatedUser({
    per_page: 100,
    page,
    sort: "pushed",
    direction: "desc",
    affiliation: "owner,collaborator,organization_member",
  });
  return response.data.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    owner: r.owner.login,
    name: r.name,
    private: r.private,
    defaultBranch: r.default_branch,
    description: r.description,
    language: r.language,
    pushedAt: r.pushed_at,
  })) satisfies Repo[];
}

export type CityFile = { path: string; size: number; extension: string };
export type CityDistrict = {
  name: string;
  files: number;
  bytes: number;
  kinds: string[];
};
export type RepositoryCity = {
  id: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  visibility: "Private" | "Public";
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  fileCount: number;
  directoryCount: number;
  totalBytes: number;
  truncated: boolean;
  scannedAt: string;
  languages: { name: string; bytes: number; percent: number }[];
  districts: CityDistrict[];
  files: CityFile[];
};

export async function repositoryCityFor(userId: string, repositoryId: string) {
  const { rows: selected } = await userQuery<{
    github_repo_id: string;
    owner: string;
    name: string;
    full_name: string;
    default_branch: string;
    private: boolean;
    description: string | null;
    language: string | null;
  }>(
    userId,
    "select github_repo_id,owner,name,full_name,default_branch,private,description,language from repositories where id=$1",
    [repositoryId],
  );
  if (!selected[0]) return null;

  const { rows: accounts } = await db().query(
    "select access_token_encrypted from github_accounts where user_id=$1",
    [userId],
  );
  if (!accounts[0]) throw new Error("Reconnect your GitHub account to scan this repository.");
  const token = decrypt(
    accounts[0].access_token_encrypted,
    process.env.SESSION_SECRET!,
  );
  const api = new Octokit({ auth: token });
  const repo = selected[0];
  const [details, tree, languageResponse] = await Promise.all([
    api.rest.repos.get({ owner: repo.owner, repo: repo.name }),
    api.rest.git.getTree({
      owner: repo.owner,
      repo: repo.name,
      tree_sha: repo.default_branch,
      recursive: "true",
    }),
    api.rest.repos.listLanguages({ owner: repo.owner, repo: repo.name }),
  ]);

  const entries = tree.data.tree.filter((entry) => entry.type === "blob" && entry.path);
  const extensionOf = (path: string) => {
    const name = path.split("/").pop() || path;
    const dot = name.lastIndexOf(".");
    return dot > 0 ? name.slice(dot + 1).toLowerCase() : "(no extension)";
  };
  const files = entries.map((entry) => ({
    path: entry.path!,
    size: entry.size || 0,
    extension: extensionOf(entry.path!),
  }));
  const districts = new Map<string, { files: number; bytes: number; kinds: Set<string> }>();
  for (const file of files) {
    const district = file.path.includes("/") ? file.path.split("/")[0] : "Root";
    const current = districts.get(district) || { files: 0, bytes: 0, kinds: new Set<string>() };
    current.files += 1;
    current.bytes += file.size;
    current.kinds.add(file.extension);
    districts.set(district, current);
  }
  const languageEntries = Object.entries(languageResponse.data).sort((a, b) => b[1] - a[1]);
  const languageTotal = languageEntries.reduce((sum, [, bytes]) => sum + bytes, 0);
  return {
    id: repositoryId,
    fullName: repo.full_name,
    description: repo.description,
    defaultBranch: repo.default_branch,
    visibility: repo.private ? "Private" : "Public",
    language: repo.language,
    stars: details.data.stargazers_count,
    forks: details.data.forks_count,
    openIssues: details.data.open_issues_count,
    fileCount: files.length,
    directoryCount: districts.size,
    totalBytes: files.reduce((sum, file) => sum + file.size, 0),
    truncated: tree.data.truncated,
    scannedAt: new Date().toISOString(),
    languages: languageEntries.map(([name, bytes]) => ({
      name,
      bytes,
      percent: languageTotal ? Math.round((bytes / languageTotal) * 1000) / 10 : 0,
    })),
    districts: [...districts.entries()]
      .map(([name, value]) => ({
        name,
        files: value.files,
        bytes: value.bytes,
        kinds: [...value.kinds].slice(0, 4),
      }))
      .sort((a, b) => b.files - a.files)
      .slice(0, 12),
    files: files.sort((a, b) => a.path.localeCompare(b.path)).slice(0, 300),
  } satisfies RepositoryCity;
}
