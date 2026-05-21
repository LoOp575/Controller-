import { z } from "zod";

export const AgentStatusSchema = z.enum([
  "offline",
  "online",
  "standby",
  "queued",
  "running",
  "done",
  "error",
]);

export const AIProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  model: z.string(),
  status: AgentStatusSchema,
  capabilities: z.array(z.string()),
  lastActive: z.string(),
});

export const TaskStatusSchema = z.enum(["queued", "running", "done", "error"]);

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  assignedTo: z.string(),
  status: TaskStatusSchema,
  progress: z.number().min(0).max(100),
  dependsOn: z.array(z.string()),
  outputPreview: z.string(),
});

export const AgentResultSchema = z.object({
  agentId: z.string(),
  title: z.string(),
  content: z.string(),
  timestamp: z.string(),
  status: z.enum(["success", "error", "pending"]),
});

export const OrchestratorPlanTaskSchema = z.object({
  id: z.string(),
  agent: z.string(),
  action: z.string(),
  status: z.string(),
});

export const OrchestratorPlanSchema = z.object({
  intent: z.string(),
  priority: z.string(),
  controller: z.string(),
  tasks: z.array(OrchestratorPlanTaskSchema),
});

export const ArtifactSchema = z.object({
  type: z.enum(["json", "code", "report", "chart"]),
  title: z.string(),
  content: z.string(),
  language: z.string().optional(),
});
