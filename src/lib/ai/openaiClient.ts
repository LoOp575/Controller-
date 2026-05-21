/**
 * OpenAI-compatible client for server-side use only.
 *
 * Never import this file from client components.
 * Supports both official OpenAI env vars and OpenAI-compatible providers.
 */

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIChoice {
  index: number;
  message: {
    role: string;
    content: string | null;
  };
  finish_reason: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

function readEnv(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === "") return null;
  return value.trim();
}

export function getOpenAIApiKey(): string | null {
  return readEnv("OPENAI_API_KEY") ?? readEnv("OPENAI_COMPATIBLE_API_KEY");
}

export function getOpenAIBaseUrl(): string {
  return (
    readEnv("OPENAI_BASE_URL") ??
    readEnv("OPENAI_COMPATIBLE_BASE_URL") ??
    "https://api.openai.com/v1"
  ).replace(/\/$/, "");
}

export function getOpenAIModel(): string {
  return (
    readEnv("OPENAI_MODEL") ??
    readEnv("OPENAI_COMPATIBLE_MODEL") ??
    "gpt-4o-mini"
  );
}

export function isOpenAIConfigured(): boolean {
  return getOpenAIApiKey() !== null;
}

export async function callOpenAI(params: {
  messages: OpenAIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" | "text" };
}): Promise<{ success: true; content: string } | { success: false; error: string }> {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    return {
      success: false,
      error:
        "AI API key belum diset. Gunakan OPENAI_API_KEY atau OPENAI_COMPATIBLE_API_KEY.",
    };
  }

  const {
    messages,
    model = getOpenAIModel(),
    temperature = 0.3,
    maxTokens = 2000,
    responseFormat,
  } = params;

  try {
    const body: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (responseFormat) {
      body.response_format = responseFormat;
    }

    const response = await fetch(`${getOpenAIBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `AI API error (${response.status}): ${errorText.substring(0, 300)}`,
      };
    }

    const data: OpenAIResponse = await response.json();

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, error: "AI provider returned empty response." };
    }

    return { success: true, content };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `AI request failed: ${message}` };
  }
}
