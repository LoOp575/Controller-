"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Users, Wheat, MessageSquare, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Chat Controller", icon: LayoutDashboard },
  { href: "/buyer-finder", label: "Buyer Finder", icon: Search },
  { href: "/leads", label: "Leads CRM", icon: Users },
  { href: "/commodities", label: "Komoditas", icon: Wheat },
  { href: "/outreach", label: "AI Outreach", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-[60] flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-md border border-gray-200 lg:hidden"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Overlay */}
      {open && <div className="fixed inset-0 z-[55] bg-black/20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-[55] h-full w-52 bg-white border-r border-gray-100 shadow-sm transition-transform lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-500">
            <LayoutDashboard className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800 leading-tight">NodeAI + NusaTani</p>
            <p className="text-[9px] text-gray-400">Controller & Buyer AI</p>
          </div>
        </div>

        <nav className="mt-2 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-sky-50 text-sky-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-sky-600" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
