import { Pool, type QueryResultRow } from "pg";
let pool: Pool | undefined;
export function db() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is required for authenticated features.");
  return (pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  }));
}
export async function userQuery<T extends QueryResultRow>(
  userId: string,
  text: string,
  values: unknown[] = [],
) {
  const client = await db().connect();
  try {
    await client.query("begin");
    await client.query("select set_config('app.user_id',$1,true)", [userId]);
    const result = await client.query<T>(text, values);
    await client.query("commit");
    return result;
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}
