/**
 * GPT Orchestrator - Server-side only.
 * Sends user command to OpenAI and returns a validated task plan.
 */

import { z } from "zod";
import { callOpenAI, isOpenAIConfigured } from "./openaiClient";

// ─── Zod Schema for GPT Orchestrator Response ─────────────────────────────

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

export type GptOrchestratorPlan = z.infer<typeof GptOrchestratorPlanSchema>;
export type GptTask = z.infer<typeof GptTaskSchema>;

// ─── System Prompt ────────────────────────────────────────────────────────

const ORCHESTRATOR_SYSTEM_PROMPT = `Kamu adalah GPT Orchestrator untuk NodeAI Controller.
Tugasmu adalah membaca perintah user dan membuat task plan untuk multi-agent system.

User tidak perlu menentukan agent.
Kamu yang memilih agent terbaik berdasarkan intent.

Agent yang tersedia:

1. gpt_orchestrator
   - role: planning, routing, final answer
2. claude_agent
   - role: deep reasoning, code review, risk analysis, architecture
3. deepseek_agent
   - role: fast summary, trend analysis, low-cost reasoning
4. kiro_dev_agent
   - role: codebase inspection, UI refactor, project fixes
5. local_node_worker
   - role: safe command execution, build check, log reading
6. artifact_renderer
   - role: chart, report, code preview, JSON output

Aturan:

- Jangan menjalankan command sungguhan.
- Jangan mengklaim task sudah selesai.
- Buat rencana kerja saja.
- Output wajib JSON valid.
- Jangan output markdown.
- Jangan output penjelasan di luar JSON.
- Jangan memasukkan secret, API key, private key, atau data sensitif.
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

// ─── Orchestrator Function ────────────────────────────────────────────────

export interface OrchestratorResult {
  success: true;
  plan: GptOrchestratorPlan;
  mode: "live";
} | {
  success: false;
  error: string;
  mode: "fallback";
}

export async function runGptOrchestrator(command: string): Promise<OrchestratorResult> {
  // Check if OpenAI is configured
  if (!isOpenAIConfigured()) {
    return {
      success: false,
      error: "OPENAI_API_KEY belum diset. Menggunakan mock mode.",
      mode: "fallback",
    };
  }

  // Call OpenAI
  const result = await callOpenAI({
    messages: [
      { role: "system", content: ORCHESTRATOR_SYSTEM_PROMPT },
      { role: "user", content: command },
    ],
    model: "gpt-4o-mini",
    temperature: 0.3,
    maxTokens: 2000,
    responseFormat: { type: "json_object" },
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      mode: "fallback",
    };
  }

  // Parse JSON from GPT response
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

  // Validate with Zod
  const validated = GptOrchestratorPlanSchema.safeParse(parsed);

  if (!validated.success) {
    return {
      success: false,
      error: `GPT response validation failed: ${validated.error.issues.map(i => i.message).join(", ")}. Menggunakan mock mode.`,
      mode: "fallback",
    };
  }

  return {
    success: true,
    plan: validated.data,
    mode: "live",
  };
}
