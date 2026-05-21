"use client";

import { useControllerStore } from "@/store/useControllerStore";
import { ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export function ActivityLogs() {
  const logs = useControllerStore((s) => s.logs);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const levelColor = {
    info: "text-sky-600",
    warn: "text-amber-600",
    error: "text-red-600",
    success: "text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-[#18BEEA]" />
        <h2 className="text-sm font-semibold text-[#0F172A]">Activity Logs</h2>
        {logs.length > 0 && (
          <span className="ml-auto text-xs text-[#94A3B8]">
            {logs.length} entries
          </span>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-xs text-[#94A3B8]">
            Logs will appear here during execution.
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="max-h-[200px] space-y-1 overflow-y-auto rounded-xl bg-[#F8FCFC] p-3"
        >
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2">
              <span className="shrink-0 font-mono text-xs text-[#94A3B8]">
                [{log.timestamp}]
              </span>
              <span className={cn("text-xs font-mono", levelColor[log.level])}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
