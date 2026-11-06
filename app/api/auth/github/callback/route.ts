import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { githubApi, OAUTH_STATE_COOKIE, sealSession, secureCookie, SESSION_COOKIE } from "@/lib/auth";

type GitHubUser = { id: number; login: string; name: string | null; avatar_url: string; html_url: string };

function sameState(actual: string, expected: string) {
  const left = Buffer.from(actual); const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state") || "";
  const cookieStore = await cookies();
  const expected = cookieStore.get(OAUTH_STATE_COOKIE)?.value || "";
  const destination = new URL("/", request.url);
  if (!code || !state || !expected || !sameState(state, expected)) {
    destination.searchParams.set("github", "invalid-state");
    return NextResponse.redirect(destination);
  }
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code }),
      cache: "no-store",
    });
    const token = await tokenResponse.json() as { access_token?: string; error?: string };
    if (!tokenResponse.ok || !token.access_token) throw new Error(token.error || "Token exchange failed.");
    const profile = await githubApi<GitHubUser>("/user", token.access_token);
    const session = sealSession({
      accessToken: token.access_token,
      user: { id: profile.id, login: profile.login, name: profile.name, avatarUrl: profile.avatar_url, profileUrl: profile.html_url },
      createdAt: Date.now(),
    });
    const response = NextResponse.redirect(destination);
    response.cookies.set(SESSION_COOKIE, session, { ...secureCookie, maxAge: 60 * 60 * 24 * 14 });
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  } catch {
    destination.searchParams.set("github", "oauth-failed");
    return NextResponse.redirect(destination);
  }
}
