import { notFound } from "next/navigation";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  Panel,
  SearchInput,
  Skeleton,
} from "@/components/ui";
export default function Design() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="shell">
      <div className="page">
        <div className="page-head">
          <span className="label">Internal component gallery</span>
          <h1>Design system</h1>
        </div>
        <Panel className="placeholder">
          <h2>Actions</h2>
          <p>
            <Button>Primary action</Button>{" "}
            <Button variant="secondary">Secondary</Button>{" "}
            <Button variant="ghost">Ghost</Button>{" "}
            <Button variant="danger">Danger</Button>
          </p>
          <h2>Inputs</h2>
          <p>
            <Input placeholder="Repository name" />
          </p>
          <p>
            <SearchInput placeholder="Search" />
          </p>
          <h2>Status</h2>
          <p>
            <Badge>Neutral</Badge> <Badge tone="success">Connected</Badge>{" "}
            <Badge tone="warning">Waiting</Badge>{" "}
            <Badge tone="error">Failed</Badge>
          </p>
          <Skeleton />
          <EmptyState
            title="Nothing here"
            body="Choose a repository to continue."
          />
          <ErrorState
            title="Connection failed"
            body="Check the service and try again."
          />
        </Panel>
      </div>
    </main>
  );
}
