"use client";

import { useControllerStore } from "@/store/useControllerStore";
import { FileJson } from "lucide-react";

export function OrchestratorPlanView() {
  const orchestratorPlan = useControllerStore((s) => s.orchestratorPlan);

  if (!orchestratorPlan) return null;

  return (
    <div className="rounded-xl border border-[#DDEFF0] bg-[#F8FCFC] p-3">
      <div className="mb-2 flex items-center gap-2">
        <FileJson className="h-3.5 w-3.5 text-[#0EA5E9]" />
        <p className="text-xs font-semibold text-[#0F172A]">
          Orchestrator JSON Plan
        </p>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs text-[#334155] border border-[#DDEFF0]">
        <code>{JSON.stringify(orchestratorPlan, null, 2)}</code>
      </pre>
    </div>
  );
}
