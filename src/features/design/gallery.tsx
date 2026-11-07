"use client";
import { useState } from "react";
import { Bell, Settings } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  Kbd,
  Panel,
  SearchInput,
  Select,
  Sheet,
  Skeleton,
  Tabs,
  Toast,
  Tooltip,
} from "@/components/ui";
export default function Gallery() {
  const [toast, setToast] = useState(false);
  return (
    <Panel className="placeholder">
      <h2>Actions</h2>
      <p>
        <Button>Primary</Button> <Button variant="secondary">Secondary</Button>{" "}
        <Button variant="ghost">Ghost</Button>{" "}
        <Button variant="danger">Danger</Button>{" "}
        <Button loading>Loading</Button>{" "}
        <IconButton label="Notifications">
          <Bell size={15} />
        </IconButton>
      </p>
      <h2>Inputs</h2>
      <p>
        <Input placeholder="Repository name" />
      </p>
      <p>
        <SearchInput placeholder="Search repositories" />
      </p>
      <p>
        <Select aria-label="Quality">
          <option>High quality</option>
          <option>Low quality</option>
        </Select>
      </p>
      <h2>Navigation and status</h2>
      <Tabs
        items={[
          { value: "city", label: "City", content: "City controls" },
          { value: "crew", label: "Crew", content: "Crew controls" },
        ]}
      />
      <p>
        <Badge>Neutral</Badge> <Badge tone="success">Connected</Badge>{" "}
        <Badge tone="warning">Waiting</Badge> <Badge tone="error">Failed</Badge>{" "}
        <Kbd>Ctrl K</Kbd> <Avatar fallback="PV" />
      </p>
      <h2>Overlays</h2>
      <p>
        <Tooltip label="Open settings">
          <IconButton label="Settings">
            <Settings size={15} />
          </IconButton>
        </Tooltip>{" "}
        <Dialog
          trigger={<Button variant="secondary">Open dialog</Button>}
          title="Confirm selection"
        >
          <p>Dialog content uses the shared panel language.</p>
        </Dialog>{" "}
        <Sheet
          trigger={<Button variant="secondary">Open sheet</Button>}
          title="Repository details"
        >
          <p>On mobile this becomes a bottom sheet.</p>
        </Sheet>{" "}
        <Button onClick={() => setToast(true)}>Show toast</Button>
      </p>
      <Toast open={toast} onOpenChange={setToast} title="Repository selected" />
      <h2>Async states</h2>
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
  );
}
