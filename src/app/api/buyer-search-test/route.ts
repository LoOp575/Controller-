import { NextResponse } from "next/server";
import { searchBuyers } from "@/lib/tools/buyerSearchTool";

export async function GET() {
  try {
    const result = await searchBuyers({
      commodity: "jahe",
      city: "Bandung",
      province: "Jawa Barat",
      category: "",
      stock: 0,
      price: 0,
      unit: "kg",
    });

    return NextResponse.json({
      ok: true,
      test: "buyer-search-test",
      query: "jahe Bandung",
      mode: result.mode,
      total: result.buyers.length,
      buyers: result.buyers.slice(0, 5),
      env: {
        omkar_configured: Boolean(process.env.OMKAR_API_KEY),
        omkar_maps_url_configured: Boolean(process.env.OMKAR_GOOGLE_MAPS_API_URL),
        google_places_configured: Boolean(process.env.GOOGLE_PLACES_API_KEY),
      },
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "buyer-search-test gagal",
      detail: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
