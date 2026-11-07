import { describe, expect, it } from "vitest";
import { Pool } from "pg";
const enabled = Boolean(process.env.TEST_DATABASE_URL);
describe.skipIf(!enabled)("real database RLS", () => {
  it("isolates every tenant table", async () => {
    const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const a = crypto.randomUUID(),
      b = crypto.randomUUID();
    try {
      await pool.query(
        "insert into users(id,github_id,login,avatar_url) values($1,$2,'a','a'),($3,$4,'b','b')",
        [a, Date.now(), b, Date.now() + 1],
      );
      await pool.query(
        "insert into repositories(user_id,github_repo_id,full_name,owner,name,private,default_branch) values($1,1,'a/repo','a','repo',false,'main'),($2,2,'b/repo','b','repo',false,'main')",
        [a, b],
      );
      const client = await pool.connect();
      try {
        await client.query("begin");
        await client.query("set local role coc_tenant");
        await client.query("select set_config('app.user_id',$1,true)", [a]);
        for (const table of [
          "users",
          "github_accounts",
          "repositories",
          "sessions",
        ]) {
          const column = table === "users" ? "id" : "user_id";
          const visible = await client.query(
            `select * from ${table} where ${column}=$1`,
            [b],
          );
          expect(visible.rowCount).toBe(0);
          const deleted = await client.query(
            `delete from ${table} where ${column}=$1`,
            [b],
          );
          expect(deleted.rowCount).toBe(0);
        }
        await client.query("rollback");
      } finally {
        client.release();
      }
    } finally {
      await pool.query("delete from users where id=any($1)", [[a, b]]);
      await pool.end();
    }
  });
});
