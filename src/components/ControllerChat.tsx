"use client";

import { Send, Sparkles, Loader2, MessageCircle, Workflow, Wand2 } from "lucide-react";
import { AssistantMode, useControllerStore } from "@/store/useControllerStore";

const exampleCommands = [
  "Bro jelaskan status agent saya",
  "Cek error project frontend saya",
  "Bagi tugas ke DeepSeek, Hermes, dan Nemotron",
  "Suruh Kiro analisis masalah berat ini",
];

const modeOptions: { value: AssistantMode; label: string; icon: typeof Wand2; help: string }[] = [
  { value: "auto", label: "Auto", icon: Wand2, help: "Ngobrol bebas atau kerja agent otomatis" },
  { value: "chat", label: "Chat", icon: MessageCircle, help: "Paksa ngobrol bebas" },
  { value: "controller", label: "Controller", icon: Workflow, help: "Paksa jalankan task agent" },
];

export function ControllerChat() {
  const {
    commandText,
    setCommandText,
    assistantMode,
    setAssistantMode,
    isRunning,
    error,
    runController,
    fallbackReason,
    apiMode,
  } = useControllerStore();

  const activeMode = modeOptions.find((mode) => mode.value === assistantMode) ?? modeOptions[0];

  const handleSend = () => {
    if (!commandText.trim() || isRunning) return;
    runController(commandText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (cmd: string) => {
    setCommandText(cmd);
  };

  return (
    <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#18BEEA]" />
        <div>
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Hybrid Assistant
          </h2>
          <p className="text-[11px] text-[#94A3B8]">{activeMode.help}</p>
        </div>
        {isRunning && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#18BEEA]">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing...
          </span>
        )}
      </div>

      <div className="mb-3 grid grid-cols-3 gap-1.5 rounded-xl bg-[#F1FBFB] p-1">
        {modeOptions.map((mode) => {
          const Icon = mode.icon;
          const isActive = assistantMode === mode.value;

          return (
            <button
              key={mode.value}
              onClick={() => setAssistantMode(mode.value)}
              disabled={isRunning}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all disabled:opacity-50 ${
                isActive
                  ? "bg-[#18BEEA] text-white shadow-sm"
                  : "text-[#334155] hover:bg-white"
              }`}
              title={mode.help}
            >
              <Icon className="h-3.5 w-3.5" />
              {mode.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <textarea
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ngobrol bebas atau kasih kerjaan ke agent..."
          className="w-full resize-none rounded-xl border border-[#DDEFF0] bg-[#F1FBFB] px-4 py-3 pr-12 text-sm text-[#334155] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#18BEEA] focus:ring-2 focus:ring-[#18BEEA]/20"
          rows={3}
          disabled={isRunning}
        />
        <button
          onClick={handleSend}
          disabled={isRunning || !commandText.trim()}
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#18BEEA] text-white shadow-sm transition-all hover:bg-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {!error && apiMode === "mock" && fallbackReason && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          ⚠️ {fallbackReason}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {exampleCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleExampleClick(cmd)}
            disabled={isRunning}
            className="rounded-lg bg-[#EAF8F8] px-2.5 py-1 text-xs text-[#0EA5E9] transition-colors hover:bg-[#DCEEFF] disabled:opacity-50"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
