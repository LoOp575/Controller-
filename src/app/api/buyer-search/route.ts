import { NextRequest, NextResponse } from "next/server";
import { BuyerSearchParamsSchema } from "@/schemas/nusataniSchema";
import { searchBuyers } from "@/lib/tools/buyerSearchTool";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commodity = searchParams.get("commodity");
  const city = searchParams.get("city");

  if (!commodity || !city) {
    return NextResponse.json({
      ok: true,
      message: "Buyer Search API aktif. Untuk test dari browser, pakai query ?commodity=jahe&city=Bandung. Untuk app utama, gunakan POST.",
      example: "/api/buyer-search?commodity=jahe&city=Bandung",
      omkar_configured: Boolean(process.env.OMKAR_API_KEY),
      google_places_configured: Boolean(process.env.GOOGLE_PLACES_API_KEY),
    }, { status: 200 });
  }

  const parsed = BuyerSearchParamsSchema.safeParse({
    commodity,
    city,
    province: searchParams.get("province") || "",
    category: searchParams.get("category") || "",
    stock: Number(searchParams.get("stock") || 0),
    price: Number(searchParams.get("price") || 0),
    unit: searchParams.get("unit") || "kg",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const result = await searchBuyers(parsed.data);
  return NextResponse.json(result, { status: 200 });
}

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
