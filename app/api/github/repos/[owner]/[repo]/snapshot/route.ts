import { NextRequest, NextResponse } from "next/server";
import { getSession, githubApi } from "@/lib/auth";
import { organizeProjects } from "@/lib/github";
import type { GitHubRepo, RepoFile } from "@/types/inceptown";

export async function GET(_request: NextRequest, context: { params: Promise<{ owner: string; repo: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in with GitHub first." }, { status: 401 });
  const { owner, repo: name } = await context.params;
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(name)) return NextResponse.json({ error: "Invalid repository." }, { status: 400 });
  try {
    const repository = await githubApi<GitHubRepo>(`/repos/${owner}/${name}`, session.accessToken);
    const tree = await githubApi<{ tree: RepoFile[]; truncated: boolean }>(`/repos/${owner}/${name}/git/trees/${encodeURIComponent(repository.default_branch)}?recursive=1`, session.accessToken);
    const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${name}/commits?per_page=1`, { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${session.accessToken}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" });
    const link = commitsResponse.headers.get("link") || "";
    const last = link.match(/[?&]page=(\d+)>; rel="last"/);
    const commits = last ? Number(last[1]) : commitsResponse.ok ? (await commitsResponse.json() as unknown[]).length : 0;
    const files = (tree.tree || []).filter((entry) => !/(^|\/)(node_modules|\.git|dist|build|coverage|\.next|vendor|cache|\.cache)(\/|$)/i.test(entry.path)).sort((a, b) => a.path.localeCompare(b.path));
    return NextResponse.json({ files, projects: organizeProjects(repository, files, commits), commits, truncated: tree.truncated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Repository scan failed." }, { status: 502 });
  }
}
