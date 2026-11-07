import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
export const COOKIE = "coc_session";
const days = 7;
const digest = (v: string) => createHash("sha256").update(v).digest("hex");
export async function createSession(userId: string, userAgent: string | null) {
  const token = randomBytes(32).toString("base64url");
  await db().query(
    "insert into sessions(user_id,token_hash,expires_at,user_agent) values($1,$2,now()+interval '7 days',$3)",
    [userId, digest(token), userAgent],
  );
  return token;
}
export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !process.env.DATABASE_URL) return null;
  const { rows } = await db().query(
    "select u.id,u.login,u.name,u.avatar_url from sessions s join users u on u.id=s.user_id where s.token_hash=$1 and s.revoked_at is null and s.expires_at>now()",
    [digest(token)],
  );
  return rows[0] ?? null;
}
export async function revokeSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token && process.env.DATABASE_URL)
    await db().query(
      "update sessions set revoked_at=now() where token_hash=$1",
      [digest(token)],
    );
}
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: days * 86400,
};
