"use client";

import { MessageSquare } from "lucide-react";

export default function OutreachPage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-bold text-gray-800">AI Outreach</h1>
      <p className="text-sm text-gray-500">Buat pesan WhatsApp otomatis untuk buyer</p>
      <div className="rounded-xl border border-dashed bg-white p-8 text-center">
        <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500 mb-1">Fitur AI Outreach terintegrasi di Buyer Finder</p>
        <p className="text-xs text-gray-400">Klik tombol &quot;WA&quot; pada hasil pencarian untuk generate pesan WhatsApp.</p>
        <p className="text-xs text-gray-400 mt-2">Atau ketik di Chat Controller: &quot;Buat pesan WA untuk buyer jahe&quot;</p>
      </div>
    </div>
  );
}
