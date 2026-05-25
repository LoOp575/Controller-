"use client";

import { AppHeader } from "@/components/AppHeader";
import { ControllerChat } from "@/components/ControllerChat";
import { BuyerResults } from "@/components/BuyerResults";
import { useControllerStore } from "@/store/useControllerStore";
import { Leaf, ArrowDown } from "lucide-react";

export default function Home() {
  const controllerStatus = useControllerStore((s) => s.controllerStatus);

  return (
    <div className="min-h-screen bg-[#EAF8F8]">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left Column - Chat + Agent Card + Flow */}
          <div className="space-y-4 lg:col-span-5">
            <ControllerChat />

            {/* Single Agent Card */}
            <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-sm">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0F172A]">NusaTani Buyer Agent</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">Single AI controller for buyer finding</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Cari buyer pangan", "Analisis relevansi", "Buyer scoring", "Generate pesan WA", "Simpan lead CRM"].map((cap) => (
                  <span key={cap} className="rounded-md bg-[#F1FBFB] px-2 py-0.5 text-[10px] text-[#334155] border border-[#DDEFF0]">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Simplified Agent Flow */}
            <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-[#0F172A] mb-3">Agent Flow</h3>
              <div className="flex flex-col items-center gap-1">
                <FlowStep label="User Command" active={controllerStatus !== "idle"} done={controllerStatus === "completed"} />
                <ArrowDown className="h-3 w-3 text-gray-300" />
                <FlowStep label="NusaTani Buyer Agent" active={controllerStatus === "planning" || controllerStatus === "routing"} done={controllerStatus === "completed"} />
                <ArrowDown className="h-3 w-3 text-gray-300" />
                <FlowStep label="Buyer Search" active={controllerStatus === "executing"} done={controllerStatus === "completed" || controllerStatus === "aggregating"} />
                <ArrowDown className="h-3 w-3 text-gray-300" />
                <FlowStep label="Buyer Score" active={controllerStatus === "aggregating"} done={controllerStatus === "completed"} />
                <ArrowDown className="h-3 w-3 text-gray-300" />
                <FlowStep label="Buyer Results" active={false} done={controllerStatus === "completed"} />
              </div>
            </div>
          </div>

          {/* Right Column - Buyer Results */}
          <div className="space-y-4 lg:col-span-7">
            <BuyerResults />
          </div>
        </div>
      </main>
    </div>
  );
}

function FlowStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div
      className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
        done
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : active
          ? "bg-cyan-50 text-cyan-700 border border-cyan-300 animate-pulse"
          : "bg-gray-50 text-gray-400 border border-gray-200"
      }`}
    >
      {label}
    </div>
  );
}
