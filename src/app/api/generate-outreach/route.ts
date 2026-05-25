import { NextRequest, NextResponse } from "next/server";
import { OutreachRequestSchema } from "@/schemas/nusataniSchema";
import { generateOutreachMessage } from "@/lib/tools/outreachTool";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OutreachRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    }
    const result = await generateOutreachMessage(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat pesan." }, { status: 500 });
  }
}
