import { z } from "zod";
const schema = z.object({
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url().optional(),
  SHOWROOM_OWNER_GITHUB_LOGIN: z.string().min(1).optional(),
});
export function serverEnv() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success)
    throw new Error(
      `Server configuration error: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`,
    );
  return parsed.data;
}
