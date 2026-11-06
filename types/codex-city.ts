export type CityEventType =
  | "SESSION_STARTED" | "AGENT_STATUS_CHANGED" | "TOOL_STARTED" | "TOOL_COMPLETED"
  | "FILE_READ" | "FILE_CREATED" | "FILE_MODIFIED" | "FILE_DELETED"
  | "PERMISSION_REQUESTED" | "PERMISSION_APPROVED" | "PERMISSION_DENIED"
  | "TEST_STARTED" | "TEST_PASSED" | "TEST_FAILED"
  | "TASK_STARTED" | "TASK_COMPLETED" | "TASK_FAILED" | "SESSION_COMPLETED";

export type CityExecutionEvent = {
  id: string;
  sessionId: string;
  repositoryId: string;
  agentId: string;
  timestamp: string;
  type: CityEventType;
  filePath?: string;
  toolName?: string;
  metadata?: Record<string, string | number | boolean | null>;
  permissionState?: "pending" | "approved" | "denied";
};

export type PermissionMode = "ask-mayor" | "auto-safe" | "manual";
export type MissionState = "queued" | "planning" | "exploring" | "building" | "awaiting-approval" | "testing" | "reviewing" | "completed" | "failed" | "halted";

export type RuntimeDiagnostics = {
  codex: { configured: boolean; reachable: boolean; mode: "app-server" | "agents-api" | "unconfigured"; message: string };
  github: { oauthConfigured: boolean; publicDiscovery: boolean };
  persistence: { configured: boolean; driver: string };
};
