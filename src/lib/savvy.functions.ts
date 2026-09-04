import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  CHAT_SYSTEM_PROMPT,
  EMAIL_SYSTEM_PROMPT,
  RESEARCH_SYSTEM_PROMPT,
} from "./savvy-prompts";
import type { EmailDraft, ResearchBrief } from "./savvy-types";

const toneSchema = z.enum(["formal", "friendly", "persuasive"]);
const depthSchema = z.enum(["quick", "standard", "detailed"]);

const emailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().default(""),
  context: z.string().default(""),
  tone: toneSchema,
  refinement: z.string().default(""),
  previousDraft: z.string().default(""),
});

const researchInput = z.object({
  question: z.string().min(1),
  material: z.string().default(""),
  url: z.string().default(""),
  depth: depthSchema,
});

const chatInput = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1),
});

const toneGuidance: Record<z.infer<typeof toneSchema>, string> = {
  formal:
    "Tone: formal. Use precise, respectful business language, full sentences, no contractions, no slang, no exclamation marks.",
  friendly:
    "Tone: friendly. Use warm, approachable, conversational language while staying professional. Contractions are welcome.",
  persuasive:
    "Tone: persuasive. Lead with the benefit, make a clear and confident case, and close with a specific call to action.",
};

const depthGuidance: Record<z.infer<typeof depthSchema>, string> = {
  quick: "Depth: quick. Keep each section tight - 2 to 3 items maximum.",
  standard: "Depth: standard. Provide 3 to 5 substantive items per section.",
  detailed: "Depth: detailed. Provide 5 to 7 thorough items per section with reasoning.",
};

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }): Promise<EmailDraft> => {
    const { callSavvy, extractJson, hasAiKey } = await import("./ai-gateway.server");

    if (!hasAiKey()) {
      return { ...demoEmail(data.purpose, data.recipient, data.tone), demo: true };
    }

    const instructions = [
      `Purpose / instruction: ${data.purpose}`,
      data.recipient ? `Recipient: ${data.recipient}` : "Recipient: not specified",
      data.context ? `Supporting context: ${data.context}` : "Supporting context: none supplied",
      toneGuidance[data.tone],
      "Sender: Tokologo Tefu. Sign off with that name.",
      data.previousDraft ? `Existing draft to revise:\n${data.previousDraft}` : "",
      data.refinement ? `Revision instruction: ${data.refinement}` : "",
      'Respond with JSON only, shaped as {"subject": string, "body": string}. Use \\n for line breaks in the body.',
    ]
      .filter(Boolean)
      .join("\n\n");

    const raw = await callSavvy([
      { role: "system", content: EMAIL_SYSTEM_PROMPT },
      { role: "user", content: instructions },
    ]);

    const parsed = extractJson<{ subject?: string; body?: string }>(raw);
    return {
      subject: parsed?.subject?.trim() || "Draft for your review",
      body: parsed?.body?.trim() || raw,
      demo: false,
    };
  });

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => researchInput.parse(data))
  .handler(async ({ data }): Promise<ResearchBrief> => {
    const { callSavvy, extractJson, hasAiKey } = await import("./ai-gateway.server");

    if (!hasAiKey()) {
      return demoResearch(data.question, data.url);
    }

    const instructions = [
      `Research question or topic: ${data.question}`,
      data.material ? `Supplied source material:\n${data.material}` : "Supplied source material: none",
      data.url
        ? `Reference URL supplied by the user: ${data.url}. You cannot open links, so treat it only as a pointer the user must verify, and never invent its contents.`
        : "",
      depthGuidance[data.depth],
      "Only list a source under 'sources' if the user supplied it or it is explicitly present in the supplied material. Never invent citations. If there are none, return an empty array.",
      'Respond with JSON only: {"title": string, "executiveSummary": string, "keyFindings": string[], "insights": string[], "assumptions": string[], "risks": string[], "recommendations": string[], "nextSteps": string[], "sources": string[]}',
    ]
      .filter(Boolean)
      .join("\n\n");

    const raw = await callSavvy([
      { role: "system", content: RESEARCH_SYSTEM_PROMPT },
      { role: "user", content: instructions },
    ]);

    const parsed = extractJson<Partial<ResearchBrief>>(raw);
    const list = (value: unknown): string[] =>
      Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

    return {
      title: parsed?.title?.trim() || data.question,
      executiveSummary: parsed?.executiveSummary?.trim() || raw,
      keyFindings: list(parsed?.keyFindings),
      insights: list(parsed?.insights),
      assumptions: list(parsed?.assumptions),
      risks: list(parsed?.risks),
      recommendations: list(parsed?.recommendations),
      nextSteps: list(parsed?.nextSteps),
      sources: list(parsed?.sources),
      demo: false,
    };
  });

export const chatWithSavvy = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => chatInput.parse(data))
  .handler(async ({ data }): Promise<{ reply: string; demo: boolean }> => {
    const { callSavvy, hasAiKey } = await import("./ai-gateway.server");

    if (!hasAiKey()) {
      const last = data.messages[data.messages.length - 1]?.content ?? "";
      return { reply: demoChatReply(last), demo: true };
    }

    const reply = await callSavvy([
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      ...data.messages,
    ]);
    return { reply, demo: false };
  });

/* ------------------------------------------------------------------ */
/* Demonstration mode: clearly-labelled deterministic sample responses. */
/* ------------------------------------------------------------------ */

function demoEmail(purpose: string, recipient: string, tone: string) {
  const greeting = recipient ? `Dear ${recipient},` : "Hello,";
  return {
    subject: `Demo mode - ${purpose.slice(0, 60)}`,
    body: [
      greeting,
      "",
      `This is a demonstration draft (no AI service is configured). A live draft would address: ${purpose}`,
      "",
      `Requested tone: ${tone}. Replace this text with the live output once an AI key is configured.`,
      "",
      "Kind regards,",
      "Tokologo Tefu",
    ].join("\n"),
  };
}

function demoResearch(question: string, url: string): ResearchBrief {
  return {
    title: `Demo brief: ${question}`,
    executiveSummary:
      "Demo mode is active because no AI service is configured. This is a deterministic sample structure, not live analysis.",
    keyFindings: ["Sample finding placeholder - no live analysis was performed."],
    insights: ["Sample insight placeholder."],
    assumptions: ["Assumes an AI service will be configured before real use."],
    risks: ["Demo content must never be used for a real decision."],
    recommendations: ["Configure an AI service to receive live research output."],
    nextSteps: ["Add an AI key, then re-run this brief."],
    sources: url ? [`User-supplied link (unverified): ${url}`] : [],
    demo: true,
  };
}

function demoChatReply(lastMessage: string): string {
  return [
    "Demo mode is active - no AI service is configured, so this is a deterministic sample reply rather than live AI.",
    "",
    `You said: "${lastMessage.slice(0, 200)}"`,
    "",
    "Once an AI service is configured I can draft communication, structure research, or work through a decision with you.",
  ].join("\n");
}
