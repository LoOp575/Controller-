import { AgentResult } from "@/types";
import { GptTask } from "@/lib/ai/gptOrchestrator";

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function runMockAgent(command: string, task: GptTask, reason?: string): AgentResult {
  const note = reason
    ? `\n\nFallback reason: ${reason}`
    : "";

  return {
    agentId: task.agent,
    title: `${task.agent.replace(/_/g, " ")} - Mock Result`,
    content: `Mock agent menerima task: ${task.title}.\n\nAction: ${task.action}\nReason: ${task.reason}\nUser command: ${command}${note}`,
    timestamp: formatTime(),
    status: reason ? "error" : "success",
  };
}
