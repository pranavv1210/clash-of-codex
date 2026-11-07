import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  let database = {
    configured: Boolean(process.env.DATABASE_URL),
    working: false,
    message: "DATABASE_URL is not configured.",
  };
  if (process.env.DATABASE_URL) {
    try {
      await db().query("select 1");
      database = {
        configured: true,
        working: true,
        message: "Database round trip passed.",
      };
    } catch {
      database = {
        configured: true,
        working: false,
        message: "Database round trip failed.",
      };
    }
  }
  return NextResponse.json(
    {
      database,
      codex: {
        implemented: false,
        working: false,
        message: "Codex execution is not implemented until Phase 5.",
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
