import { NextRequest, NextResponse } from "next/server";
const CSRF_COOKIE = "coc_csrf";
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.has(CSRF_COOKIE))
    res.cookies.set(CSRF_COOKIE, crypto.randomUUID(), {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 604800,
    });
  return res;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
