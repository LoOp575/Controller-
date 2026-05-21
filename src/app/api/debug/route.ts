import { NextResponse } from "next/server";
import { getAIProviderDebugInfo } from "@/lib/ai/openaiClient";

export async function GET() {
  const info = getAIProviderDebugInfo();

  return NextResponse.json({
    ok: true,
    provider: info,
    note: "Shows active provider config without exposing secret values.",
  });
}
