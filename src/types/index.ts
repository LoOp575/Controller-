export type AgentStatus =
  | "offline"
  | "online"
  | "standby"
  | "queued"
  | "running"
  | "done"
  | "error";

export type ControllerStatus =
  | "idle"
  | "planning"
  | "routing"
  | "executing"
  | "aggregating"
  | "completed"
  | "error";

export type TaskStatus = "queued" | "running" | "done" | "error";

export interface AIProvider {
  id: string;
  name: string;
  role: string;
  model: string;
  status: AgentStatus;
  capabilities: string[];
  lastActive: string;
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: TaskStatus;
  progress: number;
  dependsOn: string[];
  outputPreview: string;
}

export interface AgentResult {
  agentId: string;
  title: string;
  content: string;
  timestamp: string;
  status: "success" | "error" | "pending";
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

export interface OrchestratorPlanTask {
  id: string;
  agent: string;
  action: string;
  status: string;
}

export interface OrchestratorPlan {
  intent: string;
  priority: string;
  controller: string;
  tasks: OrchestratorPlanTask[];
}

export interface Artifact {
  type: "json" | "code" | "report" | "chart";
  title: string;
  content: string;
  language?: string;
}

export interface ControllerRunResponse {
  status: "completed" | "error";
  controllerStatus: "completed" | "error";
  orchestratorPlan: OrchestratorPlan;
  tasks: Task[];
  agentResults: AgentResult[];
  activityLogs: ActivityLog[];
  finalAnswer: string;
  artifacts: Artifact[];
  _meta?: {
    mode: "live" | "mock";
    model?: string;
    fallbackReason?: string;
  };
}
