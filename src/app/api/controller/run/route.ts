import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateControllerMockResponse } from "@/lib/controllerMockResponse";

const RequestSchema = z.object({
  command: z.string().min(1, "Command cannot be empty"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid request: command is required and cannot be empty.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { command } = parsed.data;

    // Simulate processing delay (mimics real orchestrator latency)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = generateControllerMockResponse(command);

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error. Failed to process controller command.",
      },
      { status: 500 }
    );
  }
}
