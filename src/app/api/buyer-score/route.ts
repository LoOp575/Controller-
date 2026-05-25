import { NextRequest, NextResponse } from "next/server";
import { getBuyerScoreResult } from "@/lib/tools/buyerScoreTool";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { buyer, params } = body;

    if (!buyer || !params || !params.commodity || !params.city) {
      return NextResponse.json({ error: "buyer and params (commodity, city) are required" }, { status: 400 });
    }

    const result = getBuyerScoreResult(buyer, params);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal menghitung buyer score." }, { status: 500 });
  }
}
