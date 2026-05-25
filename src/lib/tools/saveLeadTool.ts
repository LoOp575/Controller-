/**
 * Save Lead Tool
 * Saves buyer data to Supabase if configured, otherwise uses in-memory store.
 */

import { Buyer } from "@/types";

// In-memory fallback store
let memoryLeads: Buyer[] = [];

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function saveToSupabase(buyer: Buyer): Promise<{ success: boolean; error?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { success: false, error: "Supabase not configured" };

  try {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        name: buyer.name,
        commodity: buyer.commodity,
        category: buyer.category,
        address: buyer.address,
        city: buyer.city,
        province: buyer.province,
        phone: buyer.phone,
        email: buyer.email,
        website: buyer.website,
        rating: buyer.rating,
        source: buyer.source,
        buyer_score: buyer.buyer_score,
        ai_notes: buyer.ai_notes,
        status: buyer.status,
        created_at: buyer.created_at,
        updated_at: buyer.updated_at,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Supabase error: ${errText.substring(0, 100)}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

function saveToMemory(buyer: Buyer): { success: boolean } {
  const idx = memoryLeads.findIndex(l => l.id === buyer.id);
  if (idx >= 0) {
    memoryLeads[idx] = buyer;
  } else {
    memoryLeads.push(buyer);
  }
  return { success: true };
}

export async function saveLead(buyer: Buyer): Promise<{ success: boolean; mode: "supabase" | "memory"; error?: string }> {
  if (isSupabaseConfigured()) {
    const result = await saveToSupabase(buyer);
    if (result.success) return { success: true, mode: "supabase" };
    // Fallback to memory if Supabase fails
    saveToMemory(buyer);
    return { success: true, mode: "memory", error: result.error };
  }

  saveToMemory(buyer);
  return { success: true, mode: "memory" };
}

export function getMemoryLeads(): Buyer[] {
  return memoryLeads;
}

export function updateLeadStatus(buyerId: string, status: string): Buyer | null {
  const idx = memoryLeads.findIndex(l => l.id === buyerId);
  if (idx < 0) return null;
  memoryLeads[idx] = { ...memoryLeads[idx], status: status as Buyer["status"], updated_at: new Date().toISOString() };
  return memoryLeads[idx];
}
