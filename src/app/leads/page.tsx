"use client";

import { useEffect, useState } from "react";
import { Buyer, LEAD_STATUSES, LeadStatus } from "@/types";
import { Users, RefreshCw } from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | "">("");

  async function loadLeads() {
    setLoading(true);
    try { const res = await fetch("/api/leads"); const data = await res.json(); setLeads(data.leads||[]); } catch {}
    setLoading(false);
  }
  useEffect(() => { loadLeads(); }, []);

  async function handleStatusChange(buyerId: string, status: string) {
    try {
      await fetch("/api/leads", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({buyer_id:buyerId,status}) });
      setLeads(prev=>prev.map(l=>l.id===buyerId?{...l,status:status as LeadStatus}:l));
    } catch {}
  }

  const filtered = filter ? leads.filter(l=>l.status===filter) : leads;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-bold text-gray-800">Leads CRM</h1><p className="text-sm text-gray-500">{leads.length} total leads</p></div>
        <button onClick={loadLeads} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"><RefreshCw className="h-3 w-3"/> Refresh</button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={()=>setFilter("")} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${!filter?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>Semua ({leads.length})</button>
        {LEAD_STATUSES.map(s=>{const c=leads.filter(l=>l.status===s.value).length;if(!c)return null;return<button key={s.value} onClick={()=>setFilter(s.value)} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${filter===s.value?s.color:"bg-gray-50 text-gray-500"}`}>{s.label} ({c})</button>;})}
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-green-500 border-t-transparent"/></div>
      : filtered.length===0 ? <div className="rounded-xl border border-dashed bg-white p-8 text-center"><Users className="mx-auto mb-2 h-8 w-8 text-gray-300"/><p className="text-sm text-gray-400">{leads.length===0?"Belum ada lead. Simpan buyer dari Buyer Finder.":"Tidak ada lead untuk filter ini."}</p></div>
      : <div className="rounded-xl border bg-white shadow-sm divide-y">{filtered.map(lead=>(
        <div key={lead.id} className="px-4 py-3 hover:bg-gray-50/50">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-semibold text-gray-800">{lead.name}</p><p className="text-xs text-gray-500">{lead.category.replace(/_/g," ")} · {lead.city} · {lead.commodity}</p>{lead.phone!=="kontak tidak tersedia"&&<p className="text-xs text-green-700">{lead.phone}</p>}</div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Score: {lead.buyer_score}</span>
              <select value={lead.status} onChange={e=>handleStatusChange(lead.id,e.target.value)} className="rounded-md border bg-gray-50 px-2 py-1 text-[11px] outline-none focus:border-green-400">
                {LEAD_STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          {lead.ai_notes&&<p className="mt-1 text-[11px] text-gray-500 italic">{lead.ai_notes}</p>}
        </div>))}</div>}
    </div>
  );
}
