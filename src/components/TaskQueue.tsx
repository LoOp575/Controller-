"use client";

import { useControllerStore } from "@/store/useControllerStore";
import { TaskCard } from "./TaskCard";
import { ListChecks } from "lucide-react";

export function TaskQueue() {
  const tasks = useControllerStore((s) => s.tasks);
  const activeTaskId = useControllerStore((s) => s.activeTaskId);

  return (
    <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-[#18BEEA]" />
        <h2 className="text-sm font-semibold text-[#0F172A]">Task Queue</h2>
        {tasks.length > 0 && (
          <span className="ml-auto text-xs text-[#94A3B8]">
            {tasks.filter((t) => t.status === "done").length}/{tasks.length} done
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 rounded-full bg-[#F1FBFB] p-3">
            <ListChecks className="h-5 w-5 text-[#94A3B8]" />
          </div>
          <p className="text-xs text-[#94A3B8]">
            No tasks yet. Send a command to start.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isActive={task.id === activeTaskId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
