import { NextRequest, NextResponse } from "next/server";
import { fetchBuyerDetail } from "@/lib/tools/buyerDetailTool";

export async function POST(request: NextRequest) {
  try {
    const { place_id } = await request.json();
    if (!place_id) {
      return NextResponse.json({ error: "place_id is required" }, { status: 400 });
    }

    const detail = await fetchBuyerDetail(place_id);
    if (!detail) {
      return NextResponse.json(
        { error: "Detail tidak tersedia. GOOGLE_PLACES_API_KEY belum diset atau place_id tidak valid." },
        { status: 404 }
      );
    }

    return NextResponse.json(detail, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil detail buyer." }, { status: 500 });
  }
}
