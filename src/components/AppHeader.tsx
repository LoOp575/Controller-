"use client";

import { Activity, Settings, Zap, TestTube } from "lucide-react";
import { useControllerStore } from "@/store/useControllerStore";
import { StatusBadge } from "./StatusBadge";

export function AppHeader() {
  const controllerStatus = useControllerStore((s) => s.controllerStatus);
  const apiMode = useControllerStore((s) => s.apiMode);
  const fallbackReason = useControllerStore((s) => s.fallbackReason);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#DDEFF0] bg-white/90 backdrop-blur-sm shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-500 shadow-sm">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#0F172A] leading-tight">
              NodeAI Controller
            </h1>
            <p className="text-xs text-[#94A3B8]">Multi-Agent Task Router</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Badge */}
          {apiMode === "live" ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
              <Zap className="h-3 w-3" />
              Live GPT
            </span>
          ) : apiMode === "mock" ? (
            <span
              className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200"
              title={fallbackReason || "Using mock data"}
            >
              <TestTube className="h-3 w-3" />
              Mock Mode
            </span>
          ) : (
            <span className="rounded-full bg-[#DCEEFF] px-2.5 py-0.5 text-xs font-medium text-sky-700">
              Ready
            </span>
          )}

          {controllerStatus !== "idle" && (
            <StatusBadge
              status={
                controllerStatus === "completed"
                  ? "done"
                  : controllerStatus === "error"
                  ? "error"
                  : "running"
              }
              size="sm"
            />
          )}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#F1FBFB] hover:text-[#0EA5E9]">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
