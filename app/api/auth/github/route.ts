import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { OAUTH_STATE_COOKIE, secureCookie } from "@/lib/auth";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  if (!clientId) return NextResponse.json({ error: "GitHub OAuth is not configured." }, { status: 503 });
  const state = randomBytes(24).toString("base64url");
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("scope", "read:user user:email repo");
  authorize.searchParams.set("state", state);
  const response = NextResponse.redirect(authorize);
  response.cookies.set(OAUTH_STATE_COOKIE, state, { ...secureCookie, maxAge: 10 * 60 });
  return response;
}
