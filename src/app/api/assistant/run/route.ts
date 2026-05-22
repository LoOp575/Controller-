import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callOpenAI } from "@/lib/ai/openaiClient";
import { runGptOrchestrator } from "@/lib/ai/gptOrchestrator";
import { runAgentTasks } from "@/lib/agents/agentRunner";
import { generateControllerMockResponse } from "@/lib/controllerMockResponse";
import { ActivityLog, AgentResult, Artifact, ControllerRunResponse, OrchestratorPlan, Task } from "@/types";

const RequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  mode: z.enum(["auto", "chat", "controller"]).optional().default("auto"),
});

function now(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function shouldRunController(message: string): boolean {
  const text = message.toLowerCase();
  return [
    "bagi tugas",
    "kasih tugas",
    "suruh",
    "jalankan",
    "agent",
    "worker",
    "deepseek",
    "hermes",
    "nemotron",
    "kiro",
    "claude",
    "cek error",
    "debug",
    "deploy",
    "build",
    "frontend",
    "backend",
    "repo",
    "github",
  ].some((keyword) => text.includes(keyword));
}

function chatResponse(message: string, reply: string, fallbackReason?: string): ControllerRunResponse {
  const timestamp = now();
  const result: AgentResult = {
    agentId: "gpt_orchestrator",
    title: "AI Assistant - Free Chat",
    content: reply,
    timestamp,
    status: fallbackReason ? "error" : "success",
  };

  return {
    status: "completed",
    controllerStatus: "completed",
    orchestratorPlan: {
      intent: "free_chat",
      priority: "low",
      controller: "chat_assistant",
      tasks: [],
    },
    tasks: [],
    agentResults: [result],
    activityLogs: [
      { id: "chat_1", timestamp, level: "info", message: "Free Chat Mode" },
      { id: "chat_2", timestamp, level: fallbackReason ? "warn" : "success", message: fallbackReason ? "Chat fallback response returned" : "Chat response generated" },
    ],
    finalAnswer: reply,
    artifacts: [
      { type: "report", title: "Free Chat Reply", content: reply, language: "markdown" },
      { type: "json", title: "Chat Request", content: JSON.stringify({ message }, null, 2), language: "json" },
    ],
    _meta: fallbackReason ? { mode: "mock", fallbackReason } : { mode: "live" },
  };
}

function controllerBaseResponse(command: string, plan: Awaited<ReturnType<typeof runGptOrchestrator>> extends { success: true; plan: infer P } ? P : never): ControllerRunResponse {
  const timestamp = now();
  const tasks: Task[] = plan.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    assignedTo: task.agent,
    status: "done",
    progress: 100,
    dependsOn: task.dependsOn,
    outputPreview: task.reason,
  }));

  const orchestratorPlan: OrchestratorPlan = {
    intent: plan.intent,
    priority: plan.priority,
    controller: plan.controller,
    tasks: plan.tasks.map((task) => ({
      id: task.id,
      agent: task.agent,
      action: task.action,
      status: "done",
    })),
  };

  const logs: ActivityLog[] = [
    { id: "controller_1", timestamp, level: "info", message: "Controller Mode" },
    { id: "controller_2", timestamp, level: "success", message: `GPT generated ${plan.tasks.length} task(s)` },
  ];

  const result: AgentResult = {
    agentId: "gpt_orchestrator",
    title: "GPT Orchestrator - Task Plan",
    content: plan.summary,
    timestamp,
    status: "success",
  };

  const artifacts: Artifact[] = [
    { type: "json", title: "GPT Orchestrator Plan", content: JSON.stringify(plan, null, 2), language: "json" },
  ];

  return {
    status: "completed",
    controllerStatus: "completed",
    orchestratorPlan,
    tasks,
    agentResults: [result],
    activityLogs: logs,
    finalAnswer: plan.finalResponsePlan,
    artifacts,
    _meta: { mode: "live" },
  };
}

async function runFreeChat(message: string) {
  return callOpenAI({
    messages: [
      {
        role: "system",
        content: "Kamu adalah AI assistant pribadi di NodeAI Controller. Kamu bisa ngobrol bebas secara santai dan membantu user memahami project, API, env, deploy, dan coding. Jangan meminta atau menampilkan API key/private key/secret.",
      },
      { role: "user", content: message },
    ],
    temperature: 0.7,
    maxTokens: 1800,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ status: "error", message: "Invalid request", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { message, mode } = parsed.data;
    const selectedMode = mode === "auto" ? (shouldRunController(message) ? "controller" : "chat") : mode;

    if (selectedMode === "chat") {
      const chat = await runFreeChat(message);
      if (!chat.success) return NextResponse.json(chatResponse(message, chat.error, chat.error), { status: 200 });
      return NextResponse.json(chatResponse(message, chat.content), { status: 200 });
    }

    const planResult = await runGptOrchestrator(message);
    if (!planResult.success) {
      const mockResponse = generateControllerMockResponse(message);
      return NextResponse.json({ ...mockResponse, _meta: { mode: "mock", fallbackReason: planResult.error } }, { status: 200 });
    }

    const base = controllerBaseResponse(message, planResult.plan);
    const runner = await runAgentTasks(message, planResult.plan.tasks);

    return NextResponse.json({
      ...base,
      agentResults: [...base.agentResults, ...runner.results],
      activityLogs: [...base.activityLogs, ...runner.activityLogs],
      finalAnswer: runner.finalAnswer,
      artifacts: [
        ...base.artifacts,
        { type: "json", title: "Agent Results", content: JSON.stringify(runner.results, null, 2), language: "json" },
        { type: "report", title: "Aggregated Agent Report", content: runner.finalAnswer, language: "markdown" },
      ],
      _meta: { mode: "live" },
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: "error", message: `Internal server error: ${message}` }, { status: 500 });
  }
}
