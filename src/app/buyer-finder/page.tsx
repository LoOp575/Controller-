"use client";

import { useState } from "react";
import { Buyer, BUYER_CATEGORIES, BuyerCategory } from "@/types";
import { Search, Save, MessageSquare, Copy, Loader2 } from "lucide-react";

export default function BuyerFinderPage() {
  const [commodity, setCommodity] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState<BuyerCategory | "">("");
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState("kg");
  const [results, setResults] = useState<Buyer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mode, setMode] = useState<"live" | "mock" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [msgLoadingId, setMsgLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleSearch() {
    if (!commodity.trim() || !city.trim()) { setError("Komoditas dan kota wajib diisi."); return; }
    setError(null); setIsSearching(true);
    try {
      const res = await fetch("/api/buyer-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ commodity, city, category, stock, price, unit }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.buyers || []); setMode(data.mode);
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal mencari buyer."); }
    setIsSearching(false);
  }

  async function handleSaveLead(buyer: Buyer) {
    setSavingId(buyer.id);
    try { await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buyer) }); } catch {}
    setSavingId(null);
  }

  async function handleGenerateMsg(buyer: Buyer) {
    setMsgLoadingId(buyer.id);
    try {
      const res = await fetch("/api/generate-outreach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ buyer_name: buyer.name, buyer_category: buyer.category.replace(/_/g," "), commodity, stock, unit, price, city }) });
      const data = await res.json();
      setResults(prev => prev.map(b => b.id === buyer.id ? { ...b, outreach_message: data.message } : b));
    } catch {}
    setMsgLoadingId(null);
  }

  function handleCopy(buyer: Buyer) {
    navigator.clipboard.writeText(buyer.outreach_message);
    setCopiedId(buyer.id); setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-bold text-gray-800">Buyer Finder</h1>
      <p className="text-sm text-gray-500">Cari calon buyer untuk komoditas Anda</p>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Inp label="Komoditas *" value={commodity} onChange={setCommodity} placeholder="Jahe, Beras..." />
          <Inp label="Kota/Wilayah *" value={city} onChange={setCity} placeholder="Jakarta, Bandung..." />
          <div><label className="mb-1 block text-xs font-medium text-gray-600">Kategori</label>
            <select value={category} onChange={e=>setCategory(e.target.value as BuyerCategory|"")} className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-400">
              <option value="">Semua</option>
              {BUYER_CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
            </select></div>
          <Inp label="Stok" value={stock?stock.toString():""} onChange={v=>setStock(Number(v)||0)} placeholder="500" type="number" />
          <Inp label="Harga/unit (Rp)" value={price?price.toString():""} onChange={v=>setPrice(Number(v)||0)} placeholder="35000" type="number" />
          <Inp label="Satuan" value={unit} onChange={setUnit} placeholder="kg" />
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        <button onClick={handleSearch} disabled={isSearching} className="mt-3 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>} Cari Buyer
        </button>
        {mode && <p className="mt-2 text-[10px] text-gray-400">Mode: {mode==="live"?"🟢 Google Places":"🟡 Mock Data"}</p>}
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm divide-y">
          <div className="px-4 py-3"><p className="text-sm font-semibold text-gray-700">{results.length} buyer ditemukan</p></div>
          {results.map(buyer=>(
            <div key={buyer.id} className="px-4 py-3 hover:bg-gray-50/50">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{buyer.name}</p>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${buyer.buyer_score>=75?"bg-green-100 text-green-700":buyer.buyer_score>=50?"bg-yellow-100 text-yellow-700":"bg-gray-100 text-gray-600"}`}>{buyer.buyer_score}</span>
                  </div>
                  <p className="text-xs text-gray-500">{buyer.category.replace(/_/g," ")} · {buyer.city}</p>
                  {buyer.phone!=="kontak tidak tersedia"&&<p className="text-xs text-green-700">{buyer.phone}</p>}
                  <p className="mt-1 text-[11px] text-gray-500 italic">{buyer.ai_notes}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button onClick={()=>handleSaveLead(buyer)} disabled={savingId===buyer.id} className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50">
                    {savingId===buyer.id?<Loader2 className="h-3 w-3 animate-spin"/>:<Save className="h-3 w-3"/>} Simpan
                  </button>
                  <button onClick={()=>handleGenerateMsg(buyer)} disabled={msgLoadingId===buyer.id} className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100 disabled:opacity-50">
                    {msgLoadingId===buyer.id?<Loader2 className="h-3 w-3 animate-spin"/>:<MessageSquare className="h-3 w-3"/>} WA
                  </button>
                  {buyer.outreach_message&&<button onClick={()=>handleCopy(buyer)} className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-700"><Copy className="h-3 w-3"/>{copiedId===buyer.id?"Copied!":"Copy"}</button>}
                </div>
              </div>
              {buyer.outreach_message&&<div className="mt-2 rounded-lg bg-green-50 p-2 text-xs text-green-800 whitespace-pre-wrap border border-green-100">{buyer.outreach_message}</div>}
            </div>
          ))}
        </div>
      )}

      {!isSearching && results.length===0 && !mode && (
        <div className="rounded-xl border border-dashed bg-white p-8 text-center">
          <Search className="mx-auto mb-2 h-8 w-8 text-gray-300"/>
          <p className="text-sm text-gray-400">Isi form di atas dan klik Cari Buyer</p>
        </div>
      )}
    </div>
  );
}

function Inp({label,value,onChange,placeholder,type="text"}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string;type?:string}) {
  return <div><label className="mb-1 block text-xs font-medium text-gray-600">{label}</label><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-400"/></div>;
}
