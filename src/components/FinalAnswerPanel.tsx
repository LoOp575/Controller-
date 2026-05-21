"use client";

import { useControllerStore } from "@/store/useControllerStore";
import { MessageSquareText } from "lucide-react";

export function FinalAnswerPanel() {
  const finalAnswer = useControllerStore((s) => s.finalAnswer);

  if (!finalAnswer) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquareText className="h-4 w-4 text-emerald-600" />
        <h2 className="text-sm font-semibold text-[#0F172A]">
          GPT Final Answer
        </h2>
      </div>
      <div className="rounded-xl bg-white/80 p-4">
        <div className="prose prose-sm max-w-none">
          {finalAnswer.split("\n").map((line, i) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={i} className="mt-2 text-xs font-bold text-[#0F172A]">
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            if (line.startsWith("- ") || line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.")) {
              return (
                <p key={i} className="ml-3 text-xs text-[#334155]">
                  {line}
                </p>
              );
            }
            if (line.trim() === "") return <br key={i} />;
            return (
              <p key={i} className="text-xs leading-relaxed text-[#334155]">
                {line.replace(/\*\*/g, "")}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
