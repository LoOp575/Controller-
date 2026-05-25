import { NextRequest, NextResponse } from "next/server";
import { Buyer } from "@/types";

let leadsStore: Buyer[] = [];

export async function GET() {
  return NextResponse.json({ leads: leadsStore, total: leadsStore.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const buyer: Buyer = {
      ...body,
      id: body.id || Math.random().toString(36).substring(2, 11),
      status: body.status || "baru_ditemukan",
      created_at: body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const idx = leadsStore.findIndex((l) => l.id === buyer.id);
    if (idx >= 0) leadsStore[idx] = buyer; else leadsStore.push(buyer);
    return NextResponse.json({ success: true, lead: buyer });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan lead." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { buyer_id, status } = await request.json();
    const idx = leadsStore.findIndex((l) => l.id === buyer_id);
    if (idx < 0) return NextResponse.json({ error: "Lead tidak ditemukan." }, { status: 404 });
    leadsStore[idx] = { ...leadsStore[idx], status, updated_at: new Date().toISOString() };
    return NextResponse.json({ success: true, lead: leadsStore[idx] });
  } catch {
    return NextResponse.json({ error: "Gagal update lead." }, { status: 500 });
  }
}
