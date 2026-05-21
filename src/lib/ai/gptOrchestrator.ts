/**
 * GPT Orchestrator - Server-side only.
 * Sends user command to an OpenAI-compatible provider and returns a validated task plan.
 */

import { z } from "zod";
import { callOpenAI, isOpenAIConfigured } from "./openaiClient";

export const GptTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  agent: z.string(),
  action: z.string(),
  reason: z.string(),
  status: z.string().default("queued"),
  needsApproval: z.boolean().default(false),
  dependsOn: z.array(z.string()).default([]),
});

export const GptOrchestratorPlanSchema = z.object({
  intent: z.string(),
  priority: z.enum(["low", "normal", "high"]),
  controller: z.literal("gpt_orchestrator"),
  summary: z.string(),
  tasks: z.array(GptTaskSchema).min(1),
  finalResponsePlan: z.string(),
});

export type GptTask = z.infer<typeof GptTaskSchema>;
export type GptOrchestratorPlan = z.infer<typeof GptOrchestratorPlanSchema>;

export type OrchestratorResult =
  | { success: true; plan: GptOrchestratorPlan; mode: "live" }
  | { success: false; error: string; mode: "fallback" };

const ORCHESTRATOR_SYSTEM_PROMPT = `Kamu adalah GPT Orchestrator untuk NodeAI Controller.
Tugasmu membaca perintah user dan membuat task plan untuk multi-agent system.

Agent yang tersedia:
1. gpt_orchestrator: planning, routing, final answer
2. claude_agent: deep reasoning, code review, risk analysis, architecture
3. deepseek_agent: fast summary, trend analysis, low-cost reasoning
4. kiro_dev_agent: codebase inspection, UI refactor, project fixes
5. local_node_worker: safe command execution, build check, log reading
6. artifact_renderer: chart, report, code preview, JSON output

Aturan:
- Jangan menjalankan command sungguhan.
- Jangan mengklaim task sudah selesai.
- Buat rencana kerja saja.
- Output wajib JSON valid.
- Jangan output markdown.
- Jangan output penjelasan di luar JSON.
- Kalau task berisiko, tambahkan needsApproval: true.

Format output wajib:
{
  "intent": "string",
  "priority": "low | normal | high",
  "controller": "gpt_orchestrator",
  "summary": "string",
  "tasks": [
    {
      "id": "task_1",
      "title": "string",
      "agent": "string",
      "action": "string",
      "reason": "string",
      "status": "queued",
      "needsApproval": false,
      "dependsOn": []
    }
  ],
  "finalResponsePlan": "string"
}`;

export async function runGptOrchestrator(
  command: string
): Promise<OrchestratorResult> {
  if (!isOpenAIConfigured()) {
    return {
      success: false,
      error: "AI API key belum diset. Gunakan OPENAI_COMPATIBLE_API_KEY atau OPENAI_API_KEY.",
      mode: "fallback",
    };
  }

  const result = await callOpenAI({
    messages: [
      { role: "system", content: ORCHESTRATOR_SYSTEM_PROMPT },
      { role: "user", content: command },
    ],
    temperature: 0.3,
    maxTokens: 2000,
    responseFormat: { type: "json_object" },
  });

  if (!result.success) {
    return { success: false, error: result.error, mode: "fallback" };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(result.content);
  } catch {
    return {
      success: false,
      error: "GPT returned invalid JSON. Menggunakan mock mode.",
      mode: "fallback",
    };
  }

  const validated = GptOrchestratorPlanSchema.safeParse(parsed);

  if (!validated.success) {
    return {
      success: false,
      error: `GPT response validation failed: ${validated.error.issues
        .map((issue) => issue.message)
        .join(", ")}. Menggunakan mock mode.`,
      mode: "fallback",
    };
  }

  return { success: true, plan: validated.data, mode: "live" };
}
