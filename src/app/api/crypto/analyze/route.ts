import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runCryptoAnalysisJob } from "@/lib/crypto/cryptoAnalysisRouter";

const RequestSchema = z.object({
  message: z.string().min(1).optional(),
  symbol: z.string().min(2).optional(),
  interval: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid request", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message, symbol, interval } = parsed.data;
    const command = message ?? `Analisis ${symbol ?? "BTCUSDT"} ${interval ?? "15m"}`;
    const result = await runCryptoAnalysisJob(command);

    return NextResponse.json({ status: "success", ...result }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
