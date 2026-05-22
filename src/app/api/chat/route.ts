import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callOpenAI } from "@/lib/ai/openaiClient";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  history: z.array(ChatMessageSchema).optional().default([]),
});

const FREE_CHAT_SYSTEM_PROMPT = `Kamu adalah AI assistant pribadi di dalam NodeAI Controller.
Kamu boleh ngobrol bebas dengan user seperti teman teknis yang santai.

Peranmu:
- bantu user memahami dashboard NodeAI Controller
- bantu debugging project/frontend/backend
- bantu menjelaskan task, agent, API, env, deploy
- bantu membuat rencana kerja coding
- jawab natural, ringkas, dan jelas

Aturan:
- Jangan mengklaim sudah menjalankan task kalau tidak ada tool yang benar-benar dijalankan.
- Jangan minta atau menampilkan API key/private key/secret.
- Jangan menjalankan command lokal sungguhan.
- Jika user minta eksekusi multi-agent, arahkan ke Controller Mode.
- Jika user hanya ngobrol, jawab langsung seperti chat biasa.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid request: message is required.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { message, history } = parsed.data;

    const safeHistory = history
      .filter((item) => item.role !== "system")
      .slice(-12);

    const result = await callOpenAI({
      messages: [
        { role: "system", content: FREE_CHAT_SYSTEM_PROMPT },
        ...safeHistory,
        { role: "user", content: message },
      ],
      temperature: 0.7,
      maxTokens: 1800,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          status: "error",
          message: result.error,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      status: "success",
      reply: result.content,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        status: "error",
        message: `Internal server error: ${message}`,
      },
      { status: 500 }
    );
  }
}
