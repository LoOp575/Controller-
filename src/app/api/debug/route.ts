import { NextResponse } from "next/server";
import { getAIProviderDebugInfo } from "@/lib/ai/openaiClient";

function readEnv(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === "") return null;
  return value.trim();
}

function agentConfig(apiKeyName: string, baseUrlName: string, modelName: string) {
  return {
    configured: readEnv(apiKeyName) !== null,
    baseUrl: readEnv(baseUrlName),
    model: readEnv(modelName),
  };
}

export async function GET() {
  const info = getAIProviderDebugInfo();

  return NextResponse.json({
    ok: true,
    provider: info,
    agents: {
      deepseek: agentConfig("DEEPSEEK_API_KEY", "DEEPSEEK_BASE_URL", "DEEPSEEK_MODEL"),
      hermes: agentConfig("HERMES_API_KEY", "HERMES_BASE_URL", "HERMES_MODEL"),
      nemotron: agentConfig("NEMOTRON_API_KEY", "NEMOTRON_BASE_URL", "NEMOTRON_MODEL"),
      kiro: agentConfig("KIRO_API_KEY", "KIRO_BASE_URL", "KIRO_MODEL"),
    },
    note: "Shows active provider config and agent env status without exposing secret values.",
  });
}
