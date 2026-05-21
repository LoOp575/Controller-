"use client";

import { useControllerStore } from "@/store/useControllerStore";
import { ProviderCard } from "./ProviderCard";
import { Network } from "lucide-react";

export function ProviderStatusGrid() {
  const agents = useControllerStore((s) => s.agents);

  return (
    <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Network className="h-4 w-4 text-[#18BEEA]" />
        <h2 className="text-sm font-semibold text-[#0F172A]">
          AI Providers / Nodes
        </h2>
        <span className="ml-auto rounded-full bg-[#D8FFF3] px-2 py-0.5 text-xs font-medium text-emerald-700">
          {agents.filter((a) => a.status !== "offline").length}/{agents.length} active
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <ProviderCard key={agent.id} provider={agent} />
        ))}
      </div>
    </div>
  );
}
