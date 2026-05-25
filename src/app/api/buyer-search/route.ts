import { NextRequest, NextResponse } from "next/server";
import { BuyerSearchParamsSchema } from "@/schemas/nusataniSchema";
import { searchBuyers } from "@/lib/tools/buyerSearchTool";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = BuyerSearchParamsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Input tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const result = await searchBuyers(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal mencari buyer." }, { status: 500 });
  }
}
