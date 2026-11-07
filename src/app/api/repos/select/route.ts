import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/session";
import { userQuery } from "@/lib/db";
import { clientIp, rateLimit, requireCsrf } from "@/lib/security";
const schema = z.object({
  id: z.number(),
  fullName: z.string(),
  owner: z.string(),
  name: z.string(),
  private: z.boolean(),
  defaultBranch: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  pushedAt: z.string().nullable(),
});
export async function POST(req: NextRequest) {
  const denied = await requireCsrf(req);
  if (denied) return denied;
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const limited = await rateLimit(
    `repo:select:${user.id}:${clientIp(req)}`,
    30,
    60,
  );
  if (limited) return limited;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid repository." }, { status: 400 });
  const r = parsed.data,
    { rows } = await userQuery<{ id: string }>(
      user.id,
      "insert into repositories(user_id,github_repo_id,full_name,owner,name,private,default_branch,description,language,pushed_at,selected_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now()) on conflict(user_id,github_repo_id) do update set selected_at=now(),pushed_at=excluded.pushed_at returning id",
      [
        user.id,
        r.id,
        r.fullName,
        r.owner,
        r.name,
        r.private,
        r.defaultBranch,
        r.description,
        r.language,
        r.pushedAt,
      ],
    );
  return NextResponse.json(rows[0]);
}
