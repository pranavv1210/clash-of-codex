import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "codex_city_session";
export const OAUTH_STATE_COOKIE = "codex_city_oauth_state";

export type GitHubViewer = {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  profileUrl: string;
};

type AuthSession = { accessToken: string; user: GitHubViewer; createdAt: number };

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured.");
  return createHash("sha256").update(secret).digest();
}

export function sealSession(session: AuthSession) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function openSession(value: string): AuthSession | null {
  try {
    const payload = Buffer.from(value, "base64url");
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as AuthSession;
  } catch {
    return null;
  }
}

export async function getSession() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value ? openSession(value) : null;
}

export const secureCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function githubApi<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Clash-of-Codex",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}
