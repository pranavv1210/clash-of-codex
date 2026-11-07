import { notFound, redirect } from "next/navigation";
import { Panel, Badge } from "@/components/ui";
import { currentUser } from "@/lib/session";
import { userQuery } from "@/lib/db";
export default async function City({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/");
  const { repoId } = await params,
    { rows } = await userQuery<{ full_name: string; default_branch: string }>(
      user.id,
      "select full_name,default_branch from repositories where id=$1",
      [repoId],
    );
  if (!rows[0]) notFound();
  return (
    <main className="shell">
      <div className="page">
        <Panel className="placeholder">
          <span className="label">Selected repository</span>
          <h1>{rows[0].full_name}</h1>
          <Badge>{rows[0].default_branch}</Badge>
          <p>City generation arrives in Phase 3.</p>
          <a className="ui-button ui-secondary" href="/repos">
            Choose another repository
          </a>
        </Panel>
      </div>
    </main>
  );
}
