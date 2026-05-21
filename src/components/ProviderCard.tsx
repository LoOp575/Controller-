"use client";

import { AIProvider } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Bot, Brain, Cpu, Code2, Server, Palette } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  gpt_orchestrator: <Brain className="h-4 w-4" />,
  claude_agent: <Bot className="h-4 w-4" />,
  deepseek_agent: <Cpu className="h-4 w-4" />,
  kiro_dev_agent: <Code2 className="h-4 w-4" />,
  local_node_worker: <Server className="h-4 w-4" />,
  artifact_renderer: <Palette className="h-4 w-4" />,
};

interface ProviderCardProps {
  provider: AIProvider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#DDEFF0] bg-white p-3 shadow-soft transition-all hover:shadow-card">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF8F8] text-[#0EA5E9]">
        {iconMap[provider.id] || <Bot className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold text-[#0F172A]">
            {provider.name}
          </p>
          <StatusBadge status={provider.status} />
        </div>
        <p className="mt-0.5 truncate text-xs text-[#94A3B8]">{provider.role}</p>
      </div>
    </div>
  );
}
