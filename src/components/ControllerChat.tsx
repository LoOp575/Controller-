"use client";

import { Send, Leaf, Loader2 } from "lucide-react";
import { useControllerStore } from "@/store/useControllerStore";

const exampleCommands = [
  "Cari buyer jahe di Bandung",
  "Cari pembeli beras di Garut",
  "Cari pabrik jamu untuk kencur",
  "Cari distributor singkong di Jakarta",
  "Buat pesan WA untuk buyer kunyit",
];

export function ControllerChat() {
  const {
    commandText,
    setCommandText,
    isRunning,
    error,
    runController,
    fallbackReason,
    apiMode,
  } = useControllerStore();

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
    <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Leaf className="h-4 w-4 text-emerald-600" />
        <div>
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Buyer Command
          </h2>
          <p className="text-[11px] text-[#94A3B8]">Ketik perintah untuk mencari buyer</p>
        </div>
        {isRunning && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            Mencari...
          </span>
        )}
      </div>

      <div className="relative">
        <textarea
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Contoh: Cari buyer jahe di Bandung"
          className="w-full resize-none rounded-xl border border-[#DDEFF0] bg-[#F1FBFB] px-4 py-3 pr-12 text-sm text-[#334155] placeholder-[#94A3B8] outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          rows={2}
          disabled={isRunning}
        />
        <button
          onClick={handleSend}
          disabled={isRunning || !commandText.trim()}
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
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
            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 border border-emerald-100"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
