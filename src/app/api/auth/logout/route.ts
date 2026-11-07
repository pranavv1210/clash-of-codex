import { NextRequest, NextResponse } from "next/server";
import { COOKIE, revokeSession } from "@/lib/session";
import { requireCsrf } from "@/lib/security";
export async function POST(req: NextRequest) {
  const denied = await requireCsrf(req);
  if (denied) return denied;
  await revokeSession();
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.delete(COOKIE);
  return res;
}
