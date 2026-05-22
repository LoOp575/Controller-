import { ActivityLog, AgentResult } from "@/types";
import { GptTask } from "@/lib/ai/gptOrchestrator";
import { runDeepSeekAgent } from "./deepseekAgent";
import { runHermesAgent } from "./hermesAgent";
import { runNemotronAgent } from "./nemotronAgent";
import { runMockAgent } from "./mockAgent";
import { aggregateAgentResults } from "./resultAggregator";

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function log(id: string, level: ActivityLog["level"], message: string): ActivityLog {
  return { id, timestamp: formatTime(), level, message };
}

async function runSingleAgent(command: string, task: GptTask): Promise<AgentResult> {
  switch (task.agent) {
    case "deepseek_agent":
      return runDeepSeekAgent(command, task);
    case "hermes_agent":
      return runHermesAgent(command, task);
    case "nemotron_agent":
      return runNemotronAgent(command, task);
    default:
      return runMockAgent(command, task, `${task.agent} belum punya live runner. Menggunakan mock result.`);
  }
}

export async function runAgentTasks(command: string, tasks: GptTask[]) {
  const results: AgentResult[] = [];
  const activityLogs: ActivityLog[] = [
    log("agent_runner_start", "info", `Agent Runner started with ${tasks.length} task(s)`),
  ];

  for (const task of tasks) {
    activityLogs.push(
      log(`agent_${task.id}_start`, "info", `Running ${task.title} on ${task.agent}`)
    );

    const result = await runSingleAgent(command, task);
    results.push(result);

    activityLogs.push(
      log(
        `agent_${task.id}_done`,
        result.status === "success" ? "success" : "error",
        `${task.agent} finished ${task.title} with status ${result.status}`
      )
    );
  }

  activityLogs.push(log("agent_runner_done", "success", "Agent Runner completed"));

  return {
    results,
    activityLogs,
    finalAnswer: aggregateAgentResults(command, results),
  };
}
