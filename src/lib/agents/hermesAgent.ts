import { AgentResult } from "@/types";
import { GptTask } from "@/lib/ai/gptOrchestrator";
import { runProviderAgent } from "./providerAgent";

export function runHermesAgent(command: string, task: GptTask): Promise<AgentResult> {
  return runProviderAgent(command, task, {
    prefix: "HERMES",
    agentId: "hermes_agent",
    displayName: "Hermes Agent",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
  });
}
