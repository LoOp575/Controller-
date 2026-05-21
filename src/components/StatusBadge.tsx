"use client";

import { cn } from "@/lib/utils";
import { AgentStatus, TaskStatus } from "@/types";

interface StatusBadgeProps {
  status: AgentStatus | TaskStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; pulse?: boolean }> = {
  online: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  running: { bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500", pulse: true },
  standby: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  offline: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
  error: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  queued: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" },
  done: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  ready: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.offline;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium capitalize",
        config.bg,
        config.text,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span
        className={cn(
          "rounded-full",
          config.dot,
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
          config.pulse && "animate-pulse"
        )}
      />
      {status}
    </span>
  );
}
