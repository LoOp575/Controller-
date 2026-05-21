"use client";

import { Task } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { ProgressState } from "./ProgressState";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  isActive: boolean;
}

export function TaskCard({ task, isActive }: TaskCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-all",
        isActive
          ? "border-[#18BEEA] bg-cyan-50/50 shadow-sm"
          : "border-[#DDEFF0] bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#0F172A]">{task.title}</p>
          <p className="mt-0.5 text-xs text-[#94A3B8]">
            → {task.assignedTo.replace(/_/g, " ")}
          </p>
        </div>
        <StatusBadge status={task.status} />
      </div>
      {(task.status === "running" || task.status === "done") && (
        <div className="mt-2">
          <ProgressState progress={task.progress} />
        </div>
      )}
      {task.outputPreview && (
        <p className="mt-1.5 text-xs text-emerald-600">{task.outputPreview}</p>
      )}
    </div>
  );
}
