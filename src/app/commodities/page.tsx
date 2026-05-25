"use client";

import { useEffect, useState } from "react";
import { Commodity } from "@/types";
import { Wheat, Plus } from "lucide-react";

export default function CommoditiesPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", stock: 0, unit: "kg", price: 0, location: "", notes: "" });

  useEffect(() => { fetch("/api/commodities").then(r=>r.json()).then(d=>{setCommodities(d.commodities||[]);setLoading(false);}); }, []);

  async function handleAdd() {
    if (!form.name) return;
    const res = await fetch("/api/commodities", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.commodity) setCommodities(prev=>[...prev,data.commodity]);
    setForm({ name: "", stock: 0, unit: "kg", price: 0, location: "", notes: "" }); setShowForm(false);
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-bold text-gray-800">Komoditas</h1><p className="text-sm text-gray-500">Daftar komoditas yang Anda supply</p></div>
        <button onClick={()=>setShowForm(!showForm)} className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"><Plus className="h-3 w-3"/> Tambah</button>
      </div>
      {showForm&&<div className="rounded-xl border bg-white p-4 shadow-sm space-y-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <input placeholder="Nama" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-400"/>
          <input placeholder="Stok" type="number" value={form.stock||""} onChange={e=>setForm({...form,stock:Number(e.target.value)})} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-400"/>
          <input placeholder="Satuan" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-400"/>
          <input placeholder="Harga" type="number" value={form.price||""} onChange={e=>setForm({...form,price:Number(e.target.value)})} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-400"/>
          <input placeholder="Lokasi" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-400"/>
          <input placeholder="Catatan" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-400"/>
        </div>
        <button onClick={handleAdd} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Simpan</button>
      </div>}
      {loading?<div className="flex justify-center py-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-green-500 border-t-transparent"/></div>
      :commodities.length===0?<div className="rounded-xl border border-dashed bg-white p-8 text-center"><Wheat className="mx-auto mb-2 h-8 w-8 text-gray-300"/><p className="text-sm text-gray-400">Belum ada komoditas.</p></div>
      :<div className="rounded-xl border bg-white shadow-sm divide-y">{commodities.map(c=>(
        <div key={c.id} className="flex items-center justify-between px-4 py-3">
          <div><p className="text-sm font-semibold text-gray-800">{c.name}</p><p className="text-xs text-gray-500">{c.location} · {c.notes}</p></div>
          <div className="text-right"><p className="text-sm font-bold text-gray-800">{c.stock.toLocaleString()} {c.unit}</p><p className="text-xs text-green-600">Rp {c.price.toLocaleString()}/{c.unit}</p></div>
        </div>))}</div>}
    </div>
  );
}
