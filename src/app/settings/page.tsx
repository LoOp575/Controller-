"use client";

import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-bold text-gray-800">Settings</h1>
      <p className="text-sm text-gray-500">Konfigurasi NusaTani AI & Controller</p>
      <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Environment Variables</h2>
        <div className="space-y-2 text-xs text-gray-600">
          <EnvRow name="OPENAI_API_KEY" desc="GPT Orchestrator & outreach" />
          <EnvRow name="GOOGLE_PLACES_API_KEY" desc="Live buyer search" />
          <EnvRow name="NEXT_PUBLIC_SUPABASE_URL" desc="Database (coming soon)" />
          <EnvRow name="NEXT_PUBLIC_SUPABASE_ANON_KEY" desc="Supabase anon (coming soon)" />
          <EnvRow name="SUPABASE_SERVICE_ROLE_KEY" desc="Server-side Supabase (coming soon)" />
        </div>
      </div>
      <div className="rounded-xl border border-dashed bg-white p-8 text-center">
        <SettingsIcon className="mx-auto mb-2 h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-400">Fitur settings lengkap akan tersedia di versi berikutnya.</p>
      </div>
    </div>
  );
}
function EnvRow({name,desc}:{name:string;desc:string}) {
  return <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2"><code className="shrink-0 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-mono text-gray-700">{name}</code><span className="text-[11px] text-gray-500">{desc}</span></div>;
}
