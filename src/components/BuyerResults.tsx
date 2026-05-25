"use client";

import { useControllerStore } from "@/store/useControllerStore";
import { Buyer } from "@/types";
import { useState } from "react";
import { Save, MessageSquare, Copy, Loader2, Users, Bot } from "lucide-react";

export function BuyerResults() {
  const { artifacts, finalAnswer, isRunning, controllerStatus } = useControllerStore();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msgLoadingId, setMsgLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  const buyers: Buyer[] = (() => {
    const jsonArtifact = artifacts.find(a => a.title === "Buyer Search Results");
    if (jsonArtifact) {
      try {
        const data = JSON.parse(jsonArtifact.content);
        return data.top5 || data.buyers || [];
      } catch { return []; }
    }
    return [];
  })();

  const agentReply = finalAnswer ? finalAnswer.replace(/\*\*/g, "") : "";

  async function handleSaveLead(buyer: Buyer) {
    setSavingId(buyer.id);
    try { await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buyer) }); } catch {}
    setSavingId(null);
  }

  async function handleGenerateMsg(buyer: Buyer) {
    setMsgLoadingId(buyer.id);
    try {
      const res = await fetch("/api/generate-outreach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ buyer_name: buyer.name, buyer_category: buyer.category.replace(/_/g, " "), commodity: buyer.commodity, stock: 500, unit: "kg", price: 30000, city: buyer.city }) });
      const data = await res.json();
      if (data.message) setMessages(prev => ({ ...prev, [buyer.id]: data.message }));
    } catch {}
    setMsgLoadingId(null);
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (isRunning) {
    return (
      <div className="rounded-2xl border border-[#DDEFF0] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-[#0F172A]">NusaTani Buyer Agent sedang bekerja...</p>
        </div>
        <LoadingSteps status={controllerStatus} />
      </div>
    );
  }

  if (!agentReply && buyers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#DDEFF0] bg-white p-8 text-center">
        <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-400">Buyer Results akan tampil di sini</p>
        <p className="mt-1 text-xs text-gray-300">Ketik perintah seperti &quot;Cari buyer jahe di Bandung&quot;</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {agentReply && (
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <Bot className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-emerald-800 mb-1">NusaTani Buyer Agent</p>
              <div className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">{agentReply}</div>
              {buyers.length === 0 && <p className="mt-2 text-[11px] text-gray-400 italic">Ini contoh hasil awal/demo data, nanti bisa diganti data real dari API.</p>}
            </div>
          </div>
        </div>
      )}

      {buyers.length > 0 && (
        <div className="rounded-2xl border border-[#DDEFF0] bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#DDEFF0] flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-[#0F172A]">Buyer Results</h2>
            <span className="ml-auto text-xs text-[#94A3B8]">{buyers.length} buyer</span>
          </div>
          <div className="divide-y divide-gray-50">
            {buyers.map((buyer) => {
              const msg = messages[buyer.id] || buyer.outreach_message || "";
              return (
                <div key={buyer.id} className="px-4 py-3 hover:bg-[#F8FCFC] transition-colors">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">{buyer.name}</p>
                        <ScoreBadge score={buyer.buyer_score} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{buyer.category.replace(/_/g, " ")} · {buyer.commodity}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{buyer.address || buyer.city}</p>
                      <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                        <p className="text-gray-500">Tel: {buyer.phone && buyer.phone !== "kontak tidak tersedia" ? <span className="text-emerald-700">{buyer.phone}</span> : <span className="text-gray-400 italic">Tidak tersedia</span>}</p>
                        <p className="text-gray-500">Email: <span className="text-gray-400 italic">Tidak tersedia</span></p>
                        <p className="text-gray-500">Website: {buyer.website && buyer.website !== "-" ? buyer.website : <span className="text-gray-400 italic">Tidak tersedia</span>}</p>
                        <p className="text-gray-500">Rating: {buyer.rating > 0 ? `⭐ ${buyer.rating}` : <span className="text-gray-400 italic">-</span>}</p>
                      </div>
                      {buyer.ai_notes && <p className="mt-1.5 text-[11px] text-emerald-700 italic bg-emerald-50 rounded px-2 py-1 inline-block">{buyer.ai_notes}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1.5 mt-1 sm:mt-0">
                      <button onClick={() => handleSaveLead(buyer)} disabled={savingId === buyer.id} className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 border border-blue-100">
                        {savingId === buyer.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Simpan Lead
                      </button>
                      <button onClick={() => handleGenerateMsg(buyer)} disabled={msgLoadingId === buyer.id} className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100 disabled:opacity-50 border border-green-100">
                        {msgLoadingId === buyer.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />} Buat Pesan WA
                      </button>
                      {msg && <button onClick={() => handleCopy(msg, buyer.id)} className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-700 hover:bg-gray-200 border border-gray-200"><Copy className="h-3 w-3" /> {copiedId === buyer.id ? "Copied!" : "Copy"}</button>}
                    </div>
                  </div>
                  {msg && <div className="mt-2 rounded-lg bg-green-50 p-2.5 text-xs text-green-800 whitespace-pre-wrap border border-green-100">{msg}</div>}
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2 border-t border-[#DDEFF0] bg-[#F8FCFC]">
            <p className="text-[10px] text-gray-400 italic">Ini contoh hasil awal/demo data, nanti bisa diganti data real dari API.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSteps({ status }: { status: string }) {
  const steps = [
    { label: "Membaca perintah...", done: true },
    { label: "Menganalisis komoditas...", done: status !== "idle" && status !== "planning" },
    { label: "Mencari buyer cocok...", done: status === "executing" || status === "aggregating" || status === "completed" },
    { label: "Menghitung Buyer Score...", done: status === "aggregating" || status === "completed" },
    { label: "Menyiapkan hasil...", done: status === "completed" },
  ];
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          {step.done ? <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> : <div className="h-2 w-2 rounded-full bg-gray-200" />}
          <p className={`text-xs ${step.done ? "text-[#334155]" : "text-gray-300"}`}>{step.label}</p>
        </div>
      ))}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "bg-green-100 text-green-700 border-green-200" : score >= 50 ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-gray-100 text-gray-600 border-gray-200";
  return <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold border ${color}`}>{score}</span>;
}
