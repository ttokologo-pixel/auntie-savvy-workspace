import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { SAVVY_GREETING } from "./savvy-prompts";
import type { ChatMessage, EmailDraft, ResearchBrief } from "./savvy-types";

export type EmailSeed = {
  purpose: string;
  recipient: string;
  context: string;
};

type WorkspaceState = {
  emailSeed: EmailSeed | null;
  consumeEmailSeed: () => EmailSeed | null;
  sendToEmail: (seed: EmailSeed) => void;

  research: ResearchBrief | null;
  setResearch: (brief: ResearchBrief | null) => void;

  emailDraft: EmailDraft | null;
  setEmailDraft: (draft: EmailDraft | null) => void;

  chatMessages: ChatMessage[];
  setChatMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  resetChat: () => void;
  pushToChat: (content: string) => void;
  pendingChatPrompt: string | null;
  consumeChatPrompt: () => string | null;
};

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export const createGreeting = (): ChatMessage => ({
  id: "greeting",
  role: "assistant",
  content: SAVVY_GREETING,
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [emailSeed, setEmailSeed] = useState<EmailSeed | null>(null);
  const [research, setResearch] = useState<ResearchBrief | null>(null);
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [chatMessages, setChatMessagesState] = useState<ChatMessage[]>([createGreeting()]);
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null);

  const consumeEmailSeed = useCallback(() => {
    let seed: EmailSeed | null = null;
    setEmailSeed((current) => {
      seed = current;
      return null;
    });
    return seed;
  }, []);

  const consumeChatPrompt = useCallback(() => {
    let prompt: string | null = null;
    setPendingChatPrompt((current) => {
      prompt = current;
      return null;
    });
    return prompt;
  }, []);

  const value = useMemo<WorkspaceState>(
    () => ({
      emailSeed,
      consumeEmailSeed,
      sendToEmail: (seed) => setEmailSeed(seed),
      research,
      setResearch,
      emailDraft,
      setEmailDraft,
      chatMessages,
      setChatMessages: (updater) => setChatMessagesState((prev) => updater(prev)),
      resetChat: () => setChatMessagesState([createGreeting()]),
      pushToChat: (content) => setPendingChatPrompt(content),
      pendingChatPrompt,
      consumeChatPrompt,
    }),
    [emailSeed, research, emailDraft, chatMessages, pendingChatPrompt, consumeEmailSeed, consumeChatPrompt],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceState {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
