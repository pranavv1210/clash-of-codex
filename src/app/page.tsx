import { redirect } from "next/navigation";
import { Code2 } from "lucide-react";
import { currentUser } from "@/lib/session";
export default async function Welcome() {
  if (await currentUser()) redirect("/repos");
  return (
    <main className="welcome shell">
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <section className="hero">
        <div className="wordmark">
          <span className="mark">
            <Code2 size={16} />
          </span>
          Clash of Codex
        </div>
        <h1>Your code has a city. Give it a crew.</h1>
        <p>
          Connect a GitHub repository and turn your engineering workflow into a
          living world.
        </p>
        <a className="ui-button ui-primary" href="/api/auth/github/start">
          Connect GitHub
        </a>
      </section>
      <footer className="footer">
        <span>Clash of Codex v0.1</span>
        <a href="/privacy">Privacy</a>
      </footer>
    </main>
  );
}
