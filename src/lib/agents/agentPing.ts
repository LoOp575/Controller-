import { callCompatibleAI } from "@/lib/ai/compatibleClient";
import { AgentResult, ControllerRunResponse } from "@/types";

type PingAgentName = "deepseek" | "hermes" | "nemotron" | "kiro";

const AGENT_CONFIG: Record<
  PingAgentName,
  {
    id: string;
    displayName: string;
    prefix: string;
  }
> = {
  deepseek: {
    id: "deepseek_agent",
    displayName: "DeepSeek",
    prefix: "DEEPSEEK",
  },
  hermes: {
    id: "hermes_agent",
    displayName: "Hermes",
    prefix: "HERMES",
  },
  nemotron: {
    id: "nemotron_agent",
    displayName: "Nemotron",
    prefix: "NEMOTRON",
  },
  kiro: {
    id: "kiro_dev_agent",
    displayName: "Kiro",
    prefix: "KIRO",
  },
};

function readEnv(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === "") return null;
  return value.trim();
}

function now(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function detectAgentPingRequest(message: string): PingAgentName | null {
  const text = message.toLowerCase();

  const hasPingIntent = [
    "panggil",
    "test",
    "tes",
    "ping",
    "cek",
    "siap",
    "aktif",
    "jalan",
    "online",
  ].some((word) => text.includes(word));

  if (!hasPingIntent) return null;

  if (text.includes("deepseek") || text.includes("deepsek") || text.includes("deepsex")) {
    return "deepseek";
  }

  if (text.includes("hermes")) {
    return "hermes";
  }

  if (text.includes("nemotron") || text.includes("nemo")) {
    return "nemotron";
  }

  if (text.includes("kiro")) {
    return "kiro";
  }

  return null;
}

function buildPingResponse(
  agentName: PingAgentName,
  result: AgentResult,
  meta: Record<string, unknown>
): ControllerRunResponse {
  const timestamp = now();
  const config = AGENT_CONFIG[agentName];

  return {
    status: "completed",
    controllerStatus: "completed",
    orchestratorPlan: {
      intent: "agent_live_ping",
      priority: "low",
      controller: "agent_ping_router",
      tasks: [
        {
          id: `ping_${agentName}`,
          agent: config.id,
          action: "direct_live_ping",
          status: result.status === "success" ? "done" : "error",
        },
      ],
    },
    tasks: [
      {
        id: `ping_${agentName}`,
        title: `Ping ${config.displayName}`,
        assignedTo: config.id,
        status: result.status === "success" ? "done" : "error",
        progress: 100,
        dependsOn: [],
        outputPreview: result.content,
      },
    ],
    agentResults: [result],
    activityLogs: [
      { id: "ping_1", timestamp, level: "info", message: `Direct ping router selected for ${config.displayName}` },
      {
        id: "ping_2",
        timestamp,
        level: result.status === "success" ? "success" : "error",
        message: `${config.displayName} ping finished with status ${result.status}`,
      },
    ],
    finalAnswer: result.content,
    artifacts: [
      { type: "report", title: `${config.displayName} Live Ping`, content: result.content, language: "markdown" },
      { type: "json", title: `${config.displayName} Ping Meta`, content: JSON.stringify(meta, null, 2), language: "json" },
    ],
    _meta: { mode: "live" },
  };
}

export async function runAgentPing(message: string, agentName: PingAgentName): Promise<ControllerRunResponse> {
  const config = AGENT_CONFIG[agentName];
  const timestamp = now();
  const apiKey = readEnv(`${config.prefix}_API_KEY`);
  const baseUrl = readEnv(`${config.prefix}_BASE_URL`);
  const model = readEnv(`${config.prefix}_MODEL`);

  if (!apiKey || !baseUrl || !model) {
    const missing = [
      !apiKey ? `${config.prefix}_API_KEY` : null,
      !baseUrl ? `${config.prefix}_BASE_URL` : null,
      !model ? `${config.prefix}_MODEL` : null,
    ].filter(Boolean);

    const content = `**${config.displayName} belum siap.**\n\nEnv yang kurang: ${missing.join(", ")}.\n\nIsi env dulu, redeploy, lalu coba panggil ${config.displayName} lagi.`;

    return buildPingResponse(
      agentName,
      {
        agentId: config.id,
        title: `${config.displayName} - Not Ready`,
        content,
        timestamp,
        status: "error",
      },
      {
        configured: false,
        missing,
        baseUrl,
        model,
      }
    );
  }

  const startedAt = Date.now();
  const ping = await callCompatibleAI({
    apiKey,
    baseUrl,
    model,
    temperature: 0,
    maxTokens: 120,
    messages: [
      {
        role: "system",
        content:
          "Kamu adalah agent health-check. Jawab bahasa Indonesia, singkat, satu kalimat. Jangan minta API key. Jangan beri analisis panjang.",
      },
      {
        role: "user",
        content: `Jawab bahwa ${config.displayName} aktif, siap, dan bisa menerima tugas.`,
      },
    ],
  });
  const latencyMs = Date.now() - startedAt;

  if (!ping.success) {
    const content = `**${config.displayName} belum bisa dipanggil.**\n\n${ping.error}\n\nKalau ada kode 429, artinya model/provider sedang rate limit. Kalau 401, API key salah atau expired.`;

    return buildPingResponse(
      agentName,
      {
        agentId: config.id,
        title: `${config.displayName} - Ping Error`,
        content,
        timestamp,
        status: "error",
      },
      {
        configured: true,
        baseUrl,
        model,
        latencyMs,
        error: ping.error,
      }
    );
  }

  const content = `**${config.displayName} aktif.**\n\n${ping.content}\n\nLatency: ${latencyMs}ms\nModel: ${model}`;

  return buildPingResponse(
    agentName,
    {
      agentId: config.id,
      title: `${config.displayName} - Live Ping Success`,
      content,
      timestamp,
      status: "success",
    },
    {
      configured: true,
      baseUrl,
      model,
      latencyMs,
    }
  );
}
