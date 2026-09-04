/**
 * Server-only helper for talking to the Lovable AI Gateway.
 * The API key never leaves the server: it is read inside the request handler
 * and is never returned to the browser.
 */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export type SavvyMessage = { role: "system" | "user" | "assistant"; content: string };

export type SavvyResult = {
  text: string;
  demo: boolean;
};

export class SavvyAiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function hasAiKey(): boolean {
  return Boolean(process.env["LOVABLE_API_KEY"]);
}

export async function callSavvy(messages: SavvyMessage[]): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new SavvyAiError("AI service is not configured.", 503);
  }

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body;
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
      message = parsed.error?.message ?? parsed.message ?? body;
    } catch {
      /* keep raw body */
    }
    if (response.status === 429) {
      throw new SavvyAiError("Auntie Savvy is receiving a lot of requests right now. Please try again shortly.", 429);
    }
    if (response.status === 402) {
      throw new SavvyAiError(message || "AI credits are exhausted for this workspace.", 402);
    }
    throw new SavvyAiError(message || "The AI service returned an error.", response.status);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new SavvyAiError("The AI service returned an empty response.", 502);
  }
  return text;
}

/** Extract the first JSON object from a model response. */
export function extractJson<T>(raw: string): T | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? raw).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
