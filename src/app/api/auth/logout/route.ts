import { NextResponse } from "next/server";
import { COOKIE, revokeSession } from "@/lib/session";
export async function POST(req: Request) {
  await revokeSession();
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.delete(COOKIE);
  return res;
}
