import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { COOKIE, cookieOptions, createSession } from "@/lib/session";
const same = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export async function GET(req: NextRequest) {
  const home = new URL("/", req.url),
    state = req.nextUrl.searchParams.get("state") || "",
    expected = req.cookies.get("coc_oauth_state")?.value || "",
    code = req.nextUrl.searchParams.get("code");
  if (!code || !same(state, expected)) {
    home.searchParams.set("auth", "state");
    return NextResponse.redirect(home);
  }
  try {
    const env = serverEnv(),
      tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }),
      token = (await tokenRes.json()) as {
        access_token?: string;
        token_type?: string;
        scope?: string;
      };
    if (!token.access_token) throw new Error("exchange");
    const profileRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: "application/vnd.github+json",
        },
      }),
      profile = (await profileRes.json()) as {
        id: number;
        login: string;
        name: string | null;
        avatar_url: string;
      };
    const client = await db().connect();
    let userId: string;
    try {
      await client.query("begin");
      const user = await client.query(
        "insert into users(github_id,login,name,avatar_url,last_login_at) values($1,$2,$3,$4,now()) on conflict(github_id) do update set login=excluded.login,name=excluded.name,avatar_url=excluded.avatar_url,last_login_at=now() returning id",
        [profile.id, profile.login, profile.name, profile.avatar_url],
      );
      userId = user.rows[0].id;
      await client.query(
        "insert into github_accounts(user_id,access_token_encrypted,token_type,scopes) values($1,$2,$3,$4) on conflict(user_id) do update set access_token_encrypted=excluded.access_token_encrypted,token_type=excluded.token_type,scopes=excluded.scopes,updated_at=now()",
        [
          userId,
          encrypt(token.access_token, env.SESSION_SECRET),
          token.token_type,
          token.scope,
        ],
      );
      await client.query("commit");
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
    const session = await createSession(userId, req.headers.get("user-agent")),
      res = NextResponse.redirect(new URL("/repos", req.url));
    res.cookies.set(COOKIE, session, cookieOptions);
    res.cookies.delete("coc_oauth_state");
    return res;
  } catch {
    home.searchParams.set("auth", "failed");
    return NextResponse.redirect(home);
  }
}
