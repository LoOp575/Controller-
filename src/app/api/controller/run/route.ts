import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runGptOrchestrator, GptOrchestratorPlan } from "@/lib/ai/gptOrchestrator";
import { generateControllerMockResponse } from "@/lib/controllerMockResponse";
import { runAgentTasks } from "@/lib/agents/agentRunner";
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

function buildBaseResponseFromGptPlan(
  command: string,
  plan: GptOrchestratorPlan
): ControllerRunResponse {
  const now = formatTime();

  const tasks: Task[] = plan.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    assignedTo: t.agent,
    status: "done" as const,
    progress: 100,
    dependsOn: t.dependsOn,
    outputPreview: t.reason,
  }));

  const orchestratorPlan: OrchestratorPlan = {
    intent: plan.intent,
    priority: plan.priority,
    controller: plan.controller,
    tasks: plan.tasks.map((t) => ({
      id: t.id,
      agent: t.agent,
      action: t.action,
      status: "done",
    })),
  };

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
  ];

  const agentResults: AgentResult[] = [
    {
      agentId: "gpt_orchestrator",
      title: "GPT Orchestrator - Task Plan",
      content: plan.summary,
      timestamp: now,
      status: "success",
    },
  ];

  const artifacts: Artifact[] = [
    {
      type: "json",
      title: "GPT Orchestrator Plan (Live)",
      content: JSON.stringify(plan, null, 2),
      language: "json",
    },
  ];

  return {
    status: "completed",
    controllerStatus: "completed",
    orchestratorPlan,
    tasks,
    agentResults,
    activityLogs,
    finalAnswer: plan.finalResponsePlan,
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
    const gptResult = await runGptOrchestrator(command);

    if (gptResult.success) {
      const baseResponse = buildBaseResponseFromGptPlan(command, gptResult.plan);
      const runner = await runAgentTasks(command, gptResult.plan.tasks);

      const artifacts: Artifact[] = [
        ...baseResponse.artifacts,
        {
          type: "json",
          title: "Agent Results (Live)",
          content: JSON.stringify(runner.results, null, 2),
          language: "json",
        },
        {
          type: "report",
          title: "Aggregated Agent Report",
          content: runner.finalAnswer,
          language: "markdown",
        },
      ];

      return NextResponse.json(
        {
          ...baseResponse,
          agentResults: [...baseResponse.agentResults, ...runner.results],
          activityLogs: [...baseResponse.activityLogs, ...runner.activityLogs],
          finalAnswer: runner.finalAnswer,
          artifacts,
          _meta: { mode: "live" },
        },
        { status: 200 }
      );
    }

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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        status: "error",
        message: `Internal server error. Failed to process controller command: ${message}`,
      },
      { status: 500 }
    );
  }
}
