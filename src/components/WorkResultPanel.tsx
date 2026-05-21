"use client";

import { useControllerStore } from "@/store/useControllerStore";
import { FileOutput, CheckCircle2 } from "lucide-react";

export function WorkResultPanel() {
  const results = useControllerStore((s) => s.results);

  return (
    <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <FileOutput className="h-4 w-4 text-[#18BEEA]" />
        <h2 className="text-sm font-semibold text-[#0F172A]">
          Agent Results
        </h2>
        {results.length > 0 && (
          <span className="ml-auto text-xs text-[#94A3B8]">
            {results.length} results
          </span>
        )}
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 rounded-full bg-[#F1FBFB] p-3">
            <FileOutput className="h-5 w-5 text-[#94A3B8]" />
          </div>
          <p className="text-xs text-[#94A3B8]">
            Results will appear here after agents complete tasks.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {results.map((result, idx) => (
            <div
              key={`${result.agentId}-${idx}`}
              className="rounded-xl border border-[#DDEFF0] bg-[#F1FBFB] p-3"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-xs font-semibold text-[#0F172A]">
                  {result.title}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-[#334155]">
                {result.content}
              </p>
              {result.timestamp && (
                <p className="mt-1.5 text-xs text-[#94A3B8]">
                  {result.timestamp}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
