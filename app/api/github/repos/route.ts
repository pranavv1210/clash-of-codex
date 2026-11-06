import { NextResponse } from "next/server";
import { getSession, githubApi } from "@/lib/auth";
import type { GitHubRepo } from "@/types/inceptown";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in with GitHub first." }, { status: 401 });
  try {
    const repos = await githubApi<GitHubRepo[]>("/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member", session.accessToken);
    return NextResponse.json({ repos });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "GitHub request failed." }, { status: 502 });
  }
}
