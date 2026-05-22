import { AgentResult } from "@/types";
import { GptTask } from "@/lib/ai/gptOrchestrator";
import { runProviderAgent } from "./providerAgent";

export function runDeepSeekAgent(command: string, task: GptTask): Promise<AgentResult> {
  return runProviderAgent(command, task, {
    prefix: "DEEPSEEK",
    agentId: "deepseek_agent",
    displayName: "DeepSeek V4 Flash",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "deepseek/deepseek-v4-flash:free",
  });
}
