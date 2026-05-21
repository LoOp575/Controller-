"use client";

import { useControllerStore } from "@/store/useControllerStore";
import { OrchestratorPlanView } from "./OrchestratorPlan";
import { Layers, FileCode, FileText } from "lucide-react";

export function ArtifactPreview() {
  const artifacts = useControllerStore((s) => s.artifacts);
  const orchestratorPlan = useControllerStore((s) => s.orchestratorPlan);

  if (!orchestratorPlan && artifacts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Layers className="h-4 w-4 text-[#18BEEA]" />
        <h2 className="text-sm font-semibold text-[#0F172A]">
          Artifact Preview
        </h2>
      </div>

      <div className="space-y-3">
        {orchestratorPlan && <OrchestratorPlanView />}

        {artifacts
          .filter((a) => a.type !== "json")
          .map((artifact, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#DDEFF0] bg-[#F8FCFC] p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                {artifact.type === "code" ? (
                  <FileCode className="h-3.5 w-3.5 text-[#0EA5E9]" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-[#0EA5E9]" />
                )}
                <p className="text-xs font-semibold text-[#0F172A]">
                  {artifact.title}
                </p>
                <span className="ml-auto rounded-full bg-[#DCEEFF] px-2 py-0.5 text-xs text-sky-700">
                  {artifact.type}
                </span>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs text-[#334155] border border-[#DDEFF0]">
                <code>{artifact.content}</code>
              </pre>
            </div>
          ))}
      </div>
    </div>
  );
}
