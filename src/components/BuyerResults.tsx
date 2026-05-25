"use client";

import { useControllerStore } from "@/store/useControllerStore";
import { Buyer } from "@/types";
import { useState } from "react";
import { Save, MessageSquare, Copy, Loader2, Users } from "lucide-react";

export function BuyerResults() {
  const { artifacts, finalAnswer } = useControllerStore();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msgLoadingId, setMsgLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract buyers from artifacts JSON
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

  async function handleSaveLead(buyer: Buyer) {
    setSavingId(buyer.id);
    try {
      await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buyer) });
    } catch { /* ignore */ }
    setSavingId(null);
  }

  async function handleGenerateMsg(buyer: Buyer) {
    setMsgLoadingId(buyer.id);
    try {
      const res = await fetch("/api/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: buyer.name,
          buyer_category: buyer.category.replace(/_/g, " "),
          commodity: buyer.commodity,
          stock: 500,
          unit: "kg",
          price: 30000,
          city: buyer.city,
        }),
      });
      const data = await res.json();
      if (data.message) {
        // Store message locally in component
        buyer.outreach_message = data.message;
        setMsgLoadingId(null);
        // Force re-render
        setCopiedId(null);
        return;
      }
    } catch { /* ignore */ }
    setMsgLoadingId(null);
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // If no buyers but we have a finalAnswer, show it as text
  if (buyers.length === 0 && finalAnswer) {
    return (
      <div className="rounded-2xl border border-[#DDEFF0] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-[#0F172A]">Buyer Results</h2>
        </div>
        <div className="rounded-xl bg-[#F1FBFB] p-4 text-sm text-[#334155] whitespace-pre-wrap leading-relaxed">
          {finalAnswer.replace(/\*\*/g, "")}
        </div>
      </div>
    );
  }

  if (buyers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#DDEFF0] bg-white p-8 text-center">
        <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-400">Buyer Results akan tampil di sini</p>
        <p className="mt-1 text-xs text-gray-300">Ketik perintah seperti &quot;Cari buyer jahe di Bandung&quot;</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#DDEFF0] bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#DDEFF0] flex items-center gap-2">
        <Users className="h-4 w-4 text-emerald-600" />
        <h2 className="text-sm font-semibold text-[#0F172A]">Buyer Results</h2>
        <span className="ml-auto text-xs text-[#94A3B8]">{buyers.length} buyer</span>
      </div>
      <div className="divide-y divide-gray-50">
        {buyers.map((buyer) => (
          <div key={buyer.id} className="px-4 py-3 hover:bg-[#F8FCFC] transition-colors">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800">{buyer.name}</p>
                  <ScoreBadge score={buyer.buyer_score} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {buyer.category.replace(/_/g, " ")} · {buyer.commodity}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{buyer.address || buyer.city}</p>
                <div className="mt-1 space-y-0.5 text-xs">
                  <p className="text-gray-500">Tel: {buyer.phone && buyer.phone !== "kontak tidak tersedia" ? buyer.phone : <span className="text-gray-400 italic">Tidak tersedia</span>}</p>
                  <p className="text-gray-500">Website: {buyer.website && buyer.website !== "-" ? buyer.website : <span className="text-gray-400 italic">Tidak tersedia</span>}</p>
                </div>
                {buyer.ai_notes && (
                  <p className="mt-1.5 text-[11px] text-emerald-700 italic bg-emerald-50 rounded px-2 py-1 inline-block">
                    {buyer.ai_notes}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1.5 mt-1 sm:mt-0">
                <button
                  onClick={() => handleSaveLead(buyer)}
                  disabled={savingId === buyer.id}
                  className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                >
                  {savingId === buyer.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Simpan
                </button>
                <button
                  onClick={() => handleGenerateMsg(buyer)}
                  disabled={msgLoadingId === buyer.id}
                  className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                >
                  {msgLoadingId === buyer.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />} WA
                </button>
                {buyer.outreach_message && (
                  <button
                    onClick={() => handleCopy(buyer.outreach_message, buyer.id)}
                    className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-700 hover:bg-gray-200"
                  >
                    <Copy className="h-3 w-3" /> {copiedId === buyer.id ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
            </div>
            {buyer.outreach_message && (
              <div className="mt-2 rounded-lg bg-green-50 p-2 text-xs text-green-800 whitespace-pre-wrap border border-green-100">
                {buyer.outreach_message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "bg-green-100 text-green-700" : score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600";
  return <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${color}`}>{score}</span>;
}
