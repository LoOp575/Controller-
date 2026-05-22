import { AgentResult } from "@/types";
import { GptTask } from "@/lib/ai/gptOrchestrator";
import { callCompatibleAI } from "@/lib/ai/compatibleClient";
import { runMockAgent } from "./mockAgent";

function readEnv(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === "") return null;
  return value.trim();
}

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface ProviderAgentOptions {
  prefix: "DEEPSEEK" | "HERMES" | "NEMOTRON";
  agentId: string;
  displayName: string;
  defaultBaseUrl?: string;
  defaultModel?: string;
}

export async function runProviderAgent(
  command: string,
  task: GptTask,
  options: ProviderAgentOptions
): Promise<AgentResult> {
  const apiKey = readEnv(`${options.prefix}_API_KEY`);
  const baseUrl = readEnv(`${options.prefix}_BASE_URL`) ?? options.defaultBaseUrl;
  const model = readEnv(`${options.prefix}_MODEL`) ?? options.defaultModel;

  if (!apiKey || !baseUrl || !model) {
    return runMockAgent(
      command,
      task,
      `${options.displayName} env belum lengkap. Pastikan ${options.prefix}_API_KEY, ${options.prefix}_BASE_URL, dan ${options.prefix}_MODEL sudah diset.`
    );
  }

  const result = await callCompatibleAI({
    apiKey,
    baseUrl,
    model,
    temperature: 0.25,
    maxTokens: 1200,
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah agent dalam NodeAI Controller. Jawab singkat, jelas, dan fokus pada task yang diberikan. Jangan mengklaim menjalankan command lokal sungguhan.",
      },
      {
        role: "user",
        content: `User command:\n${command}\n\nAssigned task:\nTitle: ${task.title}\nAction: ${task.action}\nReason: ${task.reason}\n\nBeri hasil kerja agent untuk task ini.`,
      },
    ],
  });

  if (!result.success) {
    return {
      agentId: options.agentId,
      title: `${options.displayName} - Error`,
      content: result.error,
      timestamp: formatTime(),
      status: "error",
    };
  }

  return {
    agentId: options.agentId,
    title: `${options.displayName} - Result`,
    content: result.content,
    timestamp: formatTime(),
    status: "success",
  };
}
