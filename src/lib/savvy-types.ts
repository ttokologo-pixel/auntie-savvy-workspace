export type EmailTone = "formal" | "friendly" | "persuasive";
export type ResearchDepth = "quick" | "standard" | "detailed";

export type EmailDraft = {
  subject: string;
  body: string;
  demo: boolean;
};

export type ResearchBrief = {
  title: string;
  executiveSummary: string;
  keyFindings: string[];
  insights: string[];
  assumptions: string[];
  risks: string[];
  recommendations: string[];
  nextSteps: string[];
  sources: string[];
  demo: boolean;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  demo?: boolean;
};
