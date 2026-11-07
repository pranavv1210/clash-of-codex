import { Octokit } from "octokit";
import { decrypt } from "./crypto";
import { db } from "./db";
export type Repo = {
  id: number;
  fullName: string;
  owner: string;
  name: string;
  private: boolean;
  defaultBranch: string;
  description: string | null;
  language: string | null;
  pushedAt: string | null;
};
export async function reposFor(userId: string, page = 1) {
  const { rows } = await db().query(
    "select access_token_encrypted from github_accounts where user_id=$1",
    [userId],
  );
  if (!rows[0]) throw new Error("GitHub account is not connected.");
  const token = decrypt(
    rows[0].access_token_encrypted,
    process.env.SESSION_SECRET!,
  );
  const api = new Octokit({ auth: token });
  const response = await api.rest.repos.listForAuthenticatedUser({
    per_page: 100,
    page,
    sort: "pushed",
    direction: "desc",
    affiliation: "owner,collaborator,organization_member",
  });
  return response.data.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    owner: r.owner.login,
    name: r.name,
    private: r.private,
    defaultBranch: r.default_branch,
    description: r.description,
    language: r.language,
    pushedAt: r.pushed_at,
  })) satisfies Repo[];
}
