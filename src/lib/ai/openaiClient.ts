/**
 * OpenAI Client for server-side use only.
 * Never import this file from client components.
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
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function getOpenAIApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === "") return null;
  return key.trim();
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
    return { success: false, error: "OPENAI_API_KEY belum diset." };
  }

  const {
    messages,
    model = "gpt-4o-mini",
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
        error: `OpenAI API error (${response.status}): ${errorText.substring(0, 200)}`,
      };
    }

    const data: OpenAIResponse = await response.json();

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { success: false, error: "OpenAI returned empty response." };
    }

    return { success: true, content };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `OpenAI request failed: ${message}` };
  }
}
