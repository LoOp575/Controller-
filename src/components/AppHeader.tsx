"use client";

import { Activity, Settings } from "lucide-react";
import { useControllerStore } from "@/store/useControllerStore";
import { StatusBadge } from "./StatusBadge";

export function AppHeader() {
  const controllerStatus = useControllerStore((s) => s.controllerStatus);

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
          <span className="rounded-full bg-[#DCEEFF] px-2.5 py-0.5 text-xs font-medium text-sky-700">
            Demo Mode
          </span>
          {controllerStatus !== "idle" && (
            <StatusBadge status={controllerStatus === "completed" ? "done" : "running"} size="sm" />
          )}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#F1FBFB] hover:text-[#0EA5E9]">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
