import { Panel } from "@/components/ui";
import Link from "next/link";
export default function Privacy() {
  return (
    <main className="shell">
      <div className="page">
        <Panel className="placeholder">
          <span className="label">Privacy</span>
          <h1>Your credentials stay server-side.</h1>
          <p>
            GitHub tokens are encrypted and never sent to the browser. Phase 1
            stores only the account and repository data required to operate the
            product.
          </p>
          <Link className="ui-button ui-secondary" href="/">
            Back
          </Link>
        </Panel>
      </div>
    </main>
  );
}
