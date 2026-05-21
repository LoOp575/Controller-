import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runGptOrchestrator, GptOrchestratorPlan } from "@/lib/ai/gptOrchestrator";
import { generateControllerMockResponse } from "@/lib/controllerMockResponse";
import {
  Task,
  AgentResult,
  ActivityLog,
  OrchestratorPlan,
  Artifact,
  ControllerRunResponse,
} from "@/types";

const RequestSchema = z.object({
  command: z.string().min(1, "Command cannot be empty"),
});

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Convert GPT orchestrator plan into the full ControllerRunResponse
 * that the frontend expects.
 */
function buildResponseFromGptPlan(
  command: string,
  plan: GptOrchestratorPlan
): ControllerRunResponse {
  const now = formatTime();

  // Convert GPT tasks to dashboard Task format
  const tasks: Task[] = plan.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    assignedTo: t.agent,
    status: "queued" as const,
    progress: 0,
    dependsOn: t.dependsOn,
    outputPreview: t.reason,
  }));

  // Convert to OrchestratorPlan format (dashboard display)
  const orchestratorPlan: OrchestratorPlan = {
    intent: plan.intent,
    priority: plan.priority,
    controller: plan.controller,
    tasks: plan.tasks.map((t) => ({
      id: t.id,
      agent: t.agent,
      action: t.action,
      status: t.status,
    })),
  };

  // Generate activity logs
  const activityLogs: ActivityLog[] = [
    { id: "log_1", timestamp: now, level: "info", message: "GPT Orchestrator received user command" },
    { id: "log_2", timestamp: now, level: "info", message: `Command: "${command.substring(0, 60)}${command.length > 60 ? "..." : ""}"` },
    { id: "log_3", timestamp: now, level: "success", message: `Intent classified: ${plan.intent}` },
    { id: "log_4", timestamp: now, level: "info", message: `Priority: ${plan.priority}` },
    { id: "log_5", timestamp: now, level: "success", message: `Task plan generated with ${plan.tasks.length} tasks` },
    ...plan.tasks.map((t, idx) => ({
      id: `log_task_${idx}`,
      timestamp: now,
      level: "info" as const,
      message: `Task assigned: ${t.title} → ${t.agent}`,
    })),
    { id: "log_final", timestamp: now, level: "success", message: "GPT Orchestrator plan ready. Awaiting execution." },
  ];

  // GPT result as the orchestrator's own output
  const agentResults: AgentResult[] = [
    {
      agentId: "gpt_orchestrator",
      title: "GPT Orchestrator - Task Plan",
      content: plan.summary,
      timestamp: now,
      status: "success",
    },
  ];

  // Final answer is the summary + final response plan
  const finalAnswer = `**GPT Orchestrator Plan Ready**

**Summary:**
${plan.summary}

**Intent:** ${plan.intent}
**Priority:** ${plan.priority}
**Tasks:** ${plan.tasks.length} tasks assigned

**Task Assignments:**
${plan.tasks.map((t) => `- ${t.title} → ${t.agent.replace(/_/g, " ")}`).join("\n")}

**Final Response Plan:**
${plan.finalResponsePlan}

${plan.tasks.some((t) => t.needsApproval) ? "\n⚠️ Beberapa task membutuhkan approval sebelum dieksekusi." : ""}`;

  // Artifacts
  const artifacts: Artifact[] = [
    {
      type: "json",
      title: "GPT Orchestrator Plan (Live)",
      content: JSON.stringify(plan, null, 2),
      language: "json",
    },
    {
      type: "report",
      title: "Task Assignment Report",
      content: `## Task Plan Report (Live GPT)

**Intent:** ${plan.intent}
**Priority:** ${plan.priority}
**Total Tasks:** ${plan.tasks.length}
**Needs Approval:** ${plan.tasks.filter((t) => t.needsApproval).length}

### Task Breakdown:
${plan.tasks.map((t) => `| ${t.id} | ${t.title} | ${t.agent} | ${t.action} | ${t.needsApproval ? "⚠️ Approval" : "Auto"} |`).join("\n")}

### Final Response Plan:
${plan.finalResponsePlan}`,
      language: "markdown",
    },
  ];

  return {
    status: "completed",
    controllerStatus: "completed",
    orchestratorPlan,
    tasks,
    agentResults,
    activityLogs,
    finalAnswer,
    artifacts,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid request: command is required and cannot be empty.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { command } = parsed.data;

    // Try real GPT Orchestrator
    const gptResult = await runGptOrchestrator(command);

    if (gptResult.success) {
      // Real GPT response - build full response from plan
      const response = buildResponseFromGptPlan(command, gptResult.plan);

      return NextResponse.json(
        {
          ...response,
          _meta: { mode: "live", model: "gpt-4o-mini" },
        },
        { status: 200 }
      );
    }

    // Fallback to mock response
    const mockResponse = generateControllerMockResponse(command);

    return NextResponse.json(
      {
        ...mockResponse,
        _meta: {
          mode: "mock",
          fallbackReason: gptResult.error,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error. Failed to process controller command.",
      },
      { status: 500 }
    );
  }
}
