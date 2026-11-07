import { redirect } from "next/navigation";
import { Code2, LogOut } from "lucide-react";
import Image from "next/image";
import { cookies } from "next/headers";
import { currentUser } from "@/lib/session";
import { reposFor, type Repo } from "@/lib/github";
import RepoPicker from "@/features/repos/repo-picker";
export default async function Repos() {
  const user = await currentUser();
  if (!user) redirect("/");
  const csrf = (await cookies()).get("coc_csrf")?.value || "";
  let repos: Repo[] = [];
  let message = "";
  try {
    repos = await reposFor(user.id);
  } catch (e) {
    message =
      e instanceof Error ? e.message : "GitHub repositories are unavailable.";
  }
  return (
    <main className="shell">
      <header className="topbar">
        <a className="wordmark" href="/repos">
          <span className="mark">
            <Code2 size={15} />
          </span>
          Clash of Codex
        </a>
        <span className="topbar-spacer" />
        <span>{user.login}</span>
        <Image
          className="avatar"
          src={user.avatar_url}
          alt=""
          width={32}
          height={32}
          unoptimized
        />
        <form action="/api/auth/logout" method="post">
          <input type="hidden" name="csrf" value={csrf} />
          <button className="ui-button ui-ghost" aria-label="Log out">
            <LogOut size={15} />
          </button>
        </form>
      </header>
      <div className="page">
        <div className="page-head">
          <span className="label">Repository access</span>
          <h1>Choose your codebase</h1>
          <p>The repository becomes an archipelago in Phase 3.</p>
        </div>
        {message ? (
          <div className="ui-panel ui-state ui-error">
            <strong>GitHub is unavailable</strong>
            <p>{message}</p>
          </div>
        ) : (
          <RepoPicker initial={repos} />
        )}
      </div>
    </main>
  );
}
