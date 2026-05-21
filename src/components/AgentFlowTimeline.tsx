"use client";

import { useControllerStore } from "@/store/useControllerStore";
import { cn } from "@/lib/utils";
import { GitBranch, ArrowDown } from "lucide-react";

const flowSteps = [
  { id: "user", label: "User Command", phase: "idle" },
  { id: "orchestrator", label: "GPT Orchestrator", phase: "planning" },
  { id: "router", label: "Task Router", phase: "routing" },
  { id: "agents", label: "Multi-Agent Execution", phase: "executing" },
  { id: "aggregator", label: "Result Aggregator", phase: "aggregating" },
  { id: "final", label: "GPT Final Answer", phase: "completed" },
];

export function AgentFlowTimeline() {
  const controllerStatus = useControllerStore((s) => s.controllerStatus);

  const getStepState = (phase: string) => {
    const statusOrder = [
      "idle",
      "planning",
      "routing",
      "executing",
      "aggregating",
      "completed",
    ];
    const currentIndex = statusOrder.indexOf(controllerStatus);
    const stepIndex = statusOrder.indexOf(phase);

    if (currentIndex > stepIndex) return "done";
    if (currentIndex === stepIndex) return "active";
    return "pending";
  };

  return (
    <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-[#18BEEA]" />
        <h2 className="text-sm font-semibold text-[#0F172A]">Agent Flow</h2>
      </div>

      <div className="flex flex-col items-center gap-1 py-2">
        {flowSteps.map((step, index) => {
          const state = getStepState(step.phase);
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-medium transition-all",
                  state === "done" &&
                    "bg-emerald-50 text-emerald-700 border border-emerald-200",
                  state === "active" &&
                    "bg-cyan-50 text-cyan-700 border border-cyan-300 shadow-sm animate-pulse",
                  state === "pending" &&
                    "bg-gray-50 text-gray-400 border border-gray-200"
                )}
              >
                {step.label}
              </div>
              {index < flowSteps.length - 1 && (
                <ArrowDown
                  className={cn(
                    "my-1 h-3 w-3",
                    state === "done" || state === "active"
                      ? "text-cyan-400"
                      : "text-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
