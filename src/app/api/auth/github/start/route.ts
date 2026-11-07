import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
export async function GET() {
  const env = serverEnv(),
    state = randomBytes(24).toString("base64url"),
    url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("scope", "read:user user:email repo");
  url.searchParams.set("state", state);
  const res = NextResponse.redirect(url);
  res.cookies.set("coc_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
