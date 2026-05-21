"use client";

import { Send, Sparkles, Loader2 } from "lucide-react";
import { useControllerStore } from "@/store/useControllerStore";

const exampleCommands = [
  "Cek error project frontend saya",
  "Bagi tugas ke Claude dan DeepSeek",
  "Suruh Kiro rapihin komponen dashboard",
  "Analisis output dari node worker",
];

export function ControllerChat() {
  const { commandText, setCommandText, isRunning, error, runController } =
    useControllerStore();

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
        <h2 className="text-sm font-semibold text-[#0F172A]">
          Controller Command
        </h2>
        {isRunning && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#18BEEA]">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing...
          </span>
        )}
      </div>

      <div className="relative">
        <textarea
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis perintah untuk GPT Controller..."
          className="w-full resize-none rounded-xl border border-[#DDEFF0] bg-[#F1FBFB] px-4 py-3 pr-12 text-sm text-[#334155] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#18BEEA] focus:ring-2 focus:ring-[#18BEEA]/20"
          rows={3}
          disabled={isRunning}
        />
        <button
          onClick={handleSend}
          disabled={isRunning || !commandText.trim()}
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#18BEEA] text-white shadow-sm transition-all hover:bg-[#0EA5E9] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {error && (
        <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-200">
          {error}
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
