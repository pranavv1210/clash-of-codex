import { readFileSync } from "node:fs";
import pg from "pg";
if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL absent; migration skipped.");
  process.exit(0);
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(
    readFileSync("supabase/migrations/202611070001_phase1.sql", "utf8"),
  );
  console.log("Phase 1 database migration applied.");
} finally {
  await pool.end();
}
