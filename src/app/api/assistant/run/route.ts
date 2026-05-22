import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callOpenAI } from "@/lib/ai/openaiClient";
import { runGptOrchestrator, GptOrchestratorPlan } from "@/lib/ai/gptOrchestrator";
import { runAgentTasks } from "@/lib/agents/agentRunner";
import { generateControllerMockResponse } from "@/lib/controllerMockResponse";
import { isCryptoAnalysisRequest, runCryptoAnalysisJob } from "@/lib/crypto/cryptoAnalysisRouter";
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

function cryptoResponse(message: string, cryptoJob: Awaited<ReturnType<typeof runCryptoAnalysisJob>>): ControllerRunResponse {
  const timestamp = now();

  return {
    status: "completed",
    controllerStatus: "completed",
    orchestratorPlan: {
      intent: "crypto_analysis_job",
      priority: "high",
      controller: "crypto_router",
      tasks: [
        { id: "crypto_1", agent: "mexc_market_worker", action: "fetch_ohlcv_ticker_funding", status: "done" },
        { id: "crypto_2", agent: "cryptorank_context_worker", action: "fetch_market_context", status: "done" },
        { id: "crypto_3", agent: "technical_calculator", action: "calculate_ema_rsi_support_resistance", status: "done" },
        { id: "crypto_4", agent: "chart_renderer", action: "build_entry_tp_sl_chart_payload", status: "done" },
      ],
    },
    tasks: [
      {
        id: "crypto_1",
        title: "Fetch MEXC market data",
        assignedTo: "mexc_market_worker",
        status: "done",
        progress: 100,
        dependsOn: [],
        outputPreview: `Fetched ${cryptoJob.symbol} ${cryptoJob.interval} candles, ticker and funding data`,
      },
      {
        id: "crypto_2",
        title: "Fetch CryptoRank context",
        assignedTo: "cryptorank_context_worker",
        status: "done",
        progress: 100,
        dependsOn: [],
        outputPreview: "Fetched token context if CryptoRank env is configured",
      },
      {
        id: "crypto_3",
        title: "Calculate technical setup",
        assignedTo: "technical_calculator",
        status: "done",
        progress: 100,
        dependsOn: ["crypto_1"],
        outputPreview: `Score ${cryptoJob.technical.score}/100, trend ${cryptoJob.technical.trend}`,
      },
      {
        id: "crypto_4",
        title: "Build chart entry plan",
        assignedTo: "chart_renderer",
        status: "done",
        progress: 100,
        dependsOn: ["crypto_3"],
        outputPreview: `Entry ${cryptoJob.technical.entryLow}-${cryptoJob.technical.entryHigh}, TP ${cryptoJob.technical.tp1}/${cryptoJob.technical.tp2}, SL ${cryptoJob.technical.stopLoss}`,
      },
    ],
    agentResults: [
      {
        agentId: "crypto_router",
        title: `${cryptoJob.symbol} Crypto Analysis Result`,
        content: cryptoJob.report,
        timestamp,
        status: "success",
      },
    ],
    activityLogs: [
      { id: "crypto_log_1", timestamp, level: "info", message: "Crypto Analysis Router selected" },
      { id: "crypto_log_2", timestamp, level: "success", message: `MEXC data fetched for ${cryptoJob.symbol}` },
      { id: "crypto_log_3", timestamp, level: "success", message: `Technical score calculated: ${cryptoJob.technical.score}/100` },
      { id: "crypto_log_4", timestamp, level: "success", message: "Chart annotation payload generated" },
    ],
    finalAnswer: cryptoJob.report,
    artifacts: cryptoJob.artifacts,
    _meta: { mode: "live" },
  };
}

function controllerBaseResponse(command: string, plan: GptOrchestratorPlan): ControllerRunResponse {
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
    const selectedMode = mode === "auto" ? (isCryptoAnalysisRequest(message) ? "controller" : shouldRunController(message) ? "controller" : "chat") : mode;

    if (selectedMode !== "chat" && isCryptoAnalysisRequest(message)) {
      const cryptoJob = await runCryptoAnalysisJob(message);
      return NextResponse.json(cryptoResponse(message, cryptoJob), { status: 200 });
    }

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
