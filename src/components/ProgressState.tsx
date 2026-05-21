"use client";

import { cn } from "@/lib/utils";

interface ProgressStateProps {
  progress: number;
  size?: "sm" | "md";
}

export function ProgressState({ progress, size = "sm" }: ProgressStateProps) {
  return (
    <div className={cn("w-full rounded-full bg-gray-100", size === "sm" ? "h-1.5" : "h-2.5")}>
      <div
        className={cn(
          "rounded-full transition-all duration-500 ease-out",
          size === "sm" ? "h-1.5" : "h-2.5",
          progress === 100 ? "bg-emerald-500" : "bg-cyan-500"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
