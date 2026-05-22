interface CompatibleMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CompatibleChoice {
  message?: {
    role?: string;
    content?: string | null;
  };
}

interface CompatibleResponse {
  choices?: CompatibleChoice[];
}

export interface CompatibleAIParams {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: CompatibleMessage[];
  temperature?: number;
  maxTokens?: number;
}

export type CompatibleAIResult =
  | { success: true; content: string; model: string; baseUrl: string }
  | { success: false; error: string; model: string; baseUrl: string };

export async function callCompatibleAI({
  apiKey,
  baseUrl,
  model,
  messages,
  temperature = 0.3,
  maxTokens = 1200,
}: CompatibleAIParams): Promise<CompatibleAIResult> {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const requestUrl = `${cleanBaseUrl}/chat/completions`;

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        model,
        baseUrl: cleanBaseUrl,
        error: `Provider error (${response.status}) using ${model} at ${requestUrl}: ${errorText.substring(0, 300)}`,
      };
    }

    const data: CompatibleResponse = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        model,
        baseUrl: cleanBaseUrl,
        error: `Provider returned empty response using ${model}.`,
      };
    }

    return { success: true, content, model, baseUrl: cleanBaseUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      model,
      baseUrl: cleanBaseUrl,
      error: `Provider request failed: ${message}`,
    };
  }
}
