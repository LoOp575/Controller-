import { AgentResult } from "@/types";
import { GptTask } from "@/lib/ai/gptOrchestrator";
import { runProviderAgent } from "./providerAgent";

export function runNemotronAgent(command: string, task: GptTask): Promise<AgentResult> {
  return runProviderAgent(command, task, {
    prefix: "NEMOTRON",
    agentId: "nemotron_agent",
    displayName: "Nemotron Agent",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
  });
}
