import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callCompatibleAI } from "@/lib/ai/compatibleClient";

const RequestSchema = z.object({
  agent: z.enum(["all", "deepseek", "hermes", "nemotron"]).optional().default("all"),
});

function readEnv(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === "") return null;
  return value.trim();
}

type AgentName = "deepseek" | "hermes" | "nemotron";

const AGENTS: Record<AgentName, { prefix: string; displayName: string }> = {
  deepseek: { prefix: "DEEPSEEK", displayName: "DeepSeek" },
  hermes: { prefix: "HERMES", displayName: "Hermes" },
  nemotron: { prefix: "NEMOTRON", displayName: "Nemotron" },
};

async function testAgent(agent: AgentName) {
  const config = AGENTS[agent];
  const apiKey = readEnv(`${config.prefix}_API_KEY`);
  const baseUrl = readEnv(`${config.prefix}_BASE_URL`);
  const model = readEnv(`${config.prefix}_MODEL`);

  if (!apiKey || !baseUrl || !model) {
    return {
      agent,
      displayName: config.displayName,
      ok: false,
      configured: false,
      status: "missing_env",
      baseUrl,
      model,
      message: `Env belum lengkap. Butuh ${config.prefix}_API_KEY, ${config.prefix}_BASE_URL, dan ${config.prefix}_MODEL.`,
    };
  }

  const startedAt = Date.now();
  const result = await callCompatibleAI({
    apiKey,
    baseUrl,
    model,
    temperature: 0,
    maxTokens: 80,
    messages: [
      {
        role: "system",
        content: "You are a health-check endpoint. Reply with one short sentence only.",
      },
      {
        role: "user",
        content: `Health check for ${config.displayName}. Reply: ${config.displayName} agent online.`,
      },
    ],
  });
  const latencyMs = Date.now() - startedAt;

  if (!result.success) {
    return {
      agent,
      displayName: config.displayName,
      ok: false,
      configured: true,
      status: result.error.includes("429") ? "rate_limited" : "provider_error",
      baseUrl,
      model,
      latencyMs,
      message: result.error,
    };
  }

  return {
    agent,
    displayName: config.displayName,
    ok: true,
    configured: true,
    status: "online",
    baseUrl,
    model,
    latencyMs,
    message: result.content,
  };
}

export async function GET() {
  const results = await Promise.all([
    testAgent("deepseek"),
    testAgent("hermes"),
    testAgent("nemotron"),
  ]);

  return NextResponse.json({
    ok: results.every((result) => result.ok),
    results,
    note: "This endpoint sends a tiny live request to each configured agent. Secret API keys are never returned.",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid request", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { agent } = parsed.data;
    const agents: AgentName[] = agent === "all" ? ["deepseek", "hermes", "nemotron"] : [agent];
    const results = await Promise.all(agents.map((item) => testAgent(item)));

    return NextResponse.json({
      ok: results.every((result) => result.ok),
      results,
      note: "This endpoint sends a tiny live request to the selected agent(s). Secret API keys are never returned.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
