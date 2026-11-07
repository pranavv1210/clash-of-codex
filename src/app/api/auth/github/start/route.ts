import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import {
  clientIp,
  PKCE_COOKIE,
  pkceChallenge,
  randomToken,
  rateLimit,
} from "@/lib/security";
export async function GET(req: NextRequest) {
  const limited = await rateLimit(`auth:start:${clientIp(req)}`, 10, 60);
  if (limited) return limited;
  const env = serverEnv(),
    state = randomToken(24),
    verifier = randomToken(48),
    url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("scope", "read:user user:email repo");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", pkceChallenge(verifier));
  url.searchParams.set("code_challenge_method", "S256");
  const res = NextResponse.redirect(url);
  res.cookies.set("coc_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  res.cookies.set(PKCE_COOKIE, verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
