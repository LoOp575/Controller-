import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "NusaTani AI Buyer Controller",
    message: "API aktif",
    timestamp: new Date().toISOString(),
    env: {
      omkar_configured: Boolean(process.env.OMKAR_API_KEY),
      omkar_maps_url_configured: Boolean(process.env.OMKAR_GOOGLE_MAPS_API_URL),
      google_places_configured: Boolean(process.env.GOOGLE_PLACES_API_KEY),
      mock_fallback_enabled: process.env.ENABLE_MOCK_FALLBACK !== "false",
    },
  });
}
