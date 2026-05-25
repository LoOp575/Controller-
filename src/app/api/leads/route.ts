import { NextRequest, NextResponse } from "next/server";
import { Buyer } from "@/types";
import { saveLead, getMemoryLeads, updateLeadStatus } from "@/lib/tools/saveLeadTool";

export async function GET() {
  const leads = getMemoryLeads();
  return NextResponse.json({ leads, total: leads.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const buyer: Buyer = {
      ...body,
      id: body.id || Math.random().toString(36).substring(2, 11),
      province: body.province || "",
      email: body.email || "Tidak tersedia",
      status: body.status || "baru_ditemukan",
      created_at: body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await saveLead(buyer);
    return NextResponse.json({ success: result.success, lead: buyer, mode: result.mode });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan lead." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { buyer_id, status } = await request.json();
    const updated = updateLeadStatus(buyer_id, status);
    if (!updated) {
      return NextResponse.json({ error: "Lead tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ success: true, lead: updated });
  } catch {
    return NextResponse.json({ error: "Gagal update lead." }, { status: 500 });
  }
}
