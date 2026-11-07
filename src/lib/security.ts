import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";

export const CSRF_COOKIE = "coc_csrf";
export const PKCE_COOKIE = "coc_pkce";
export const randomToken = (bytes = 32) =>
  randomBytes(bytes).toString("base64url");
export const pkceChallenge = (verifier: string) =>
  createHash("sha256").update(verifier).digest("base64url");
export function safeEqual(a = "", b = "") {
  const left = Buffer.from(a),
    right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
export async function requireCsrf(req: NextRequest) {
  const origin = req.headers.get("origin"),
    expectedOrigin = req.nextUrl.origin;
  if (!origin || origin !== expectedOrigin)
    return NextResponse.json(
      { error: "Cross-origin request rejected." },
      { status: 403 },
    );
  const cookie = req.cookies.get(CSRF_COOKIE)?.value || "";
  let supplied = req.headers.get("x-csrf-token") || "";
  if (!supplied && req.headers.get("content-type")?.includes("form"))
    supplied = String((await req.clone().formData()).get("csrf") || "");
  return safeEqual(cookie, supplied)
    ? null
    : NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
}
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  const { rows } = await db().query<{ count: number; reset_at: Date }>(
    `insert into rate_limits(key,window_start,count) values($1,now(),1)
     on conflict(key) do update set count=case when rate_limits.window_start < now()-($2*interval '1 second') then 1 else rate_limits.count+1 end,
     window_start=case when rate_limits.window_start < now()-($2*interval '1 second') then now() else rate_limits.window_start end
     returning count,window_start+($2*interval '1 second') as reset_at`,
    [key, windowSeconds],
  );
  const retryAfter = Math.max(
    1,
    Math.ceil((rows[0].reset_at.getTime() - Date.now()) / 1000),
  );
  return rows[0].count > limit
    ? NextResponse.json(
        { error: "Too many requests. Try again shortly." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      )
    : null;
}
