import { NextRequest, NextResponse } from "next/server";
import { Commodity } from "@/types";

let commoditiesStore: Commodity[] = [
  { id: "1", name: "Jahe Merah", stock: 500, unit: "kg", price: 35000, location: "Bogor", notes: "Grade A", created_at: new Date().toISOString() },
  { id: "2", name: "Kunyit", stock: 300, unit: "kg", price: 18000, location: "Bandung", notes: "Segar", created_at: new Date().toISOString() },
  { id: "3", name: "Kencur", stock: 200, unit: "kg", price: 25000, location: "Solo", notes: "", created_at: new Date().toISOString() },
  { id: "4", name: "Singkong", stock: 2000, unit: "kg", price: 3500, location: "Lampung", notes: "Cassesart", created_at: new Date().toISOString() },
  { id: "5", name: "Cabai Rawit", stock: 150, unit: "kg", price: 55000, location: "Bandung", notes: "Merah segar", created_at: new Date().toISOString() },
];

export async function GET() {
  return NextResponse.json({ commodities: commoditiesStore, total: commoditiesStore.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const commodity: Commodity = {
      id: Math.random().toString(36).substring(2, 11),
      name: body.name, stock: body.stock || 0, unit: body.unit || "kg",
      price: body.price || 0, location: body.location || "", notes: body.notes || "",
      created_at: new Date().toISOString(),
    };
    commoditiesStore.push(commodity);
    return NextResponse.json({ success: true, commodity });
  } catch {
    return NextResponse.json({ error: "Gagal menambah komoditas." }, { status: 500 });
  }
}
