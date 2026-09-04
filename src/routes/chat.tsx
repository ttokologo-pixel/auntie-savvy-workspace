import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ListChecks,
  Mail,
  MessageCircleHeart,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Text,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DemoBadge, ErrorState, Notice, Panel } from "@/components/workspace/primitives";
import { AI_DISCLAIMER } from "@/lib/savvy-prompts";
import { chatWithSavvy } from "@/lib/savvy.functions";
import type { ChatMessage } from "@/lib/savvy-types";
import { useWorkspace } from "@/lib/workspace-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ask Auntie Savvy | AI Workspace" },
      {
        name: "description",
        content:
          "A warm, professional workplace assistant for planning, meeting preparation, decision analysis and message improvement.",
      },
      { property: "og:title", content: "Ask Auntie Savvy | AI Workspace" },
      {
        property: "og:description",
        content: "Plan, prepare and think through workplace decisions with Auntie Savvy.",
      },
    ],
  }),
  component: AskAuntieSavvy;
});

const SUGGESTIONS = [
  "Create an action plan",
  "Prepare for a meeting",
  "Improve a message",
];

const TOOLS = [
  { label: "Summarise conversation", icon: Text, prompt: "Summarise our conversation so far in a short, clear brief." },
  {
    label: "Extract action items",
    icon: ListChecks,
    prompt: "Extract the action items from our conversation as a numbered list with owners and deadlines where known.",
  },
];

function AskAuntieSavvy() {
  const navigate = useNavigate();
  const { chatMessages, setChatMessages, resetChat, consumeChatPrompt, sendToEmail } = useWorkspace();
  const send = useServerFn(chatWithSavvy);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages, loading]);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    const history = [...chatMessages, userMessage];
    setChatMessages(() => history);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const result = await send({
        data: {
          messages: history
            .filter((m) => m.id !== "greeting")
            .map((m) => ({ role: m.role, content: m.content })),
        },
      });
      setChatMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: result.reply, demo: result.demo },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auntie Savvy could not reply. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const pending = consumeChatPrompt();
    if (pending) void submit(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consumeChatPrompt]);

  const transcript = chatMessages
    .filter((m) => m.id !== "greeting")
    .map((m) => `${m.role === "user" ? "Tokologo" : "Auntie Savvy"}: ${m.content}`)
    .join("\n\n");

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
      <Panel
        title="Auntie Savvy"
        description="Multi-turn workplace conversation. Enter sends, Shift + Enter starts a new line."
        icon={<MessageCircleHeart className="size-4 text-primary" aria-hidden="true" />}
        actions={
          <Button
            type="button"
            variant="secondary"
            className="rounded-2xl"
            onClick={() => {
              resetChat();
              setError(null);
              toast.success("Conversation cleared");
            }}
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Clear
          </Button>
        }
      >
        <div
          className="flex max-h-[58vh] min-h-[46vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-border bg-cream p-4"
          aria-live="polite"
        >
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface text-foreground",
                )}
              >
                {message.role === "assistant" && message.demo && (
                  <span className="mb-2 block">
                    <DemoBadge />
                  </span>
                )}
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                Auntie Savvy is thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {error && (
          <div className="mt-3">
            <ErrorState message={error} />
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => void submit(suggestion)}
              className="rounded-full border border-border bg-pale-pink px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-blush disabled:opacity-50"
            >
              <Sparkles className="mr-1 inline size-3" aria-hidden="true" />
              {suggestion}
            </button>
          ))}
        </div>

        <form
          className="mt-3 flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(input);
          }}
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="chat-input" className="sr-only">
              Message Auntie Savvy
            </label>
            <Textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit(input);
                }
              }}
              placeholder="Ask Auntie Savvy anything about your work…"
              className="min-h-[52px] rounded-2xl bg-cream"
            />
          </div>
          <Button type="submit" disabled={loading || !input.trim()} className="h-[52px] rounded-2xl px-5">
            <Send className="size-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Send</span>
          </Button>
        </form>

        <p className="mt-2 text-[11px] text-muted-foreground">{AI_DISCLAIMER}</p>
      </Panel>

      <div className="min-w-0 space-y-5">
        <Panel title="Conversation tools" description="Turn this conversation into something you can use.">
          <div className="space-y-2">
            {TOOLS.map((tool) => (
              <Button
                key={tool.label}
                type="button"
                variant="secondary"
                className="w-full justify-start rounded-2xl"
                disabled={loading || !transcript}
                onClick={() => void submit(tool.prompt)}
              >
                <tool.icon className="size-4" aria-hidden="true" /> {tool.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-start rounded-2xl"
              disabled={!transcript}
              onClick={() => {
                sendToEmail({
                  purpose: "Turn the key points of this conversation into a clear workplace email.",
                  recipient: "",
                  context: transcript,
                });
                void navigate({ to: "/" });
              }}
            >
              <Mail className="size-4" aria-hidden="true" /> Turn into an email
            </Button>
          </div>
          {!transcript && (
            <p className="mt-3 text-xs text-muted-foreground">
              Send a message first — these tools work on the conversation you build together.
            </p>
          )}
        </Panel>

        <Panel
          title="Human in the loop"
          description="You remain responsible for final decisions, approvals and external communication."
          icon={<ShieldCheck className="size-4 text-primary" aria-hidden="true" />}
        >
          <Notice tone="care">Review important outputs before using them. {AI_DISCLAIMER}</Notice>
          <div className="mt-3">
            <Notice tone="privacy">
              Keep confidential details out of the conversation unless you are permitted to share them.
            </Notice>
          </div>
        </Panel>
      </div>
    </div>
  );
}
