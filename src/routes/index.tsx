import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Mail, MessageCircleHeart, RefreshCw, Send, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DemoBadge, EmptyState, ErrorState, Notice, Panel } from "@/components/workspace/primitives";
import { AI_DISCLAIMER } from "@/lib/savvy-prompts";
import { generateEmail } from "@/lib/savvy.functions";
import type { EmailTone } from "@/lib/savvy-types";
import { useWorkspace } from "@/lib/workspace-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Email Studio | Auntie Savvy AI Workspace" },
      {
        name: "description",
        content:
          "Draft complete workplace email with a chosen tone, refine it, and carry the result into research or chat.",
      },
      { property: "og:title", content: "Email Studio | Auntie Savvy AI Workspace" },
      {
        property: "og:description",
        content: "Draft complete workplace email with a chosen tone and refine it in seconds.",
      },
    ],
  }),
  component: EmailStudio,
});

const TONES: { value: EmailTone; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "persuasive", label: "Persuasive" },
];

const REFINEMENTS = [
  { label: "Make shorter", instruction: "Make the email noticeably shorter without losing key facts." },
  { label: "Add urgency", instruction: "Add a respectful sense of urgency and a clear deadline framing." },
  { label: "Improve clarity", instruction: "Improve clarity and structure; simplify complex sentences." },
  { label: "Make friendlier", instruction: "Make the email warmer and friendlier while staying professional." },
  { label: "Make more persuasive", instruction: "Make the email more persuasive with a stronger call to action." },
];

function EmailStudio() {
  const navigate = useNavigate();
  const { consumeEmailSeed, emailDraft, setEmailDraft, pushToChat } = useWorkspace();
  const generate = useServerFn(generateEmail);

  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<EmailTone>("formal");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const seed = consumeEmailSeed();
    if (seed) {
      setPurpose(seed.purpose);
      setRecipient(seed.recipient);
      setContext(seed.context);
      toast.success("Context brought into Email Studio");
    }
  }, [consumeEmailSeed]);

  useEffect(() => {
    if (emailDraft) {
      setSubject(emailDraft.subject);
      setBody(emailDraft.body);
      setDemo(emailDraft.demo);
    }
  }, [emailDraft]);

  const run = async (refinement: string, label: string) => {
    if (!purpose.trim()) {
      toast.error("Tell Auntie Savvy what the email needs to achieve.");
      return;
    }
    setLoading(true);
    setBusyLabel(label);
    setError(null);
    try {
      const draft = await generate({
        data: {
          purpose,
          recipient,
          context,
          tone,
          refinement,
          previousDraft: refinement ? `Subject: ${subject}\n\n${body}` : "",
        },
      });
      setSubject(draft.subject);
      setBody(draft.body);
      setDemo(draft.demo);
      setEmailDraft(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The email could not be generated. Please try again.");
    } finally {
      setLoading(false);
      setBusyLabel("");
    }
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    toast.success("Email copied to your clipboard");
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-2">
      <Panel
        title="Brief Auntie Savvy"
        description="Only the facts you supply are used. Nothing is invented and nothing is sent."
        icon={<Mail className="size-4 text-primary" aria-hidden="true" />}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void run("", "Generating");
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="purpose">Purpose or instruction</Label>
            <Textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Ask the supplier to confirm the revised delivery date for the March order."
              className="min-h-28 rounded-2xl bg-cream"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Ms Naledi Mokoena, Operations Lead"
              className="rounded-2xl bg-cream"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="context">Context or supporting information</Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Dates, figures, decisions already made, anything the recipient must know."
              className="min-h-24 rounded-2xl bg-cream"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Tone</legend>
            <div className="flex flex-wrap gap-2">
              {TONES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={tone === option.value}
                  onClick={() => setTone(option.value)}
                  className={cn(
                    "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
                    tone === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-cream text-foreground hover:bg-pale-pink",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <Notice tone="privacy">
            Avoid pasting confidential personal data. Nothing you type here is stored in your browser.
          </Notice>

          <Button type="submit" disabled={loading} className="w-full rounded-2xl">
            {loading && busyLabel === "Generating" ? "Drafting…" : "Generate Email"}
          </Button>
        </form>
      </Panel>

      <Panel
        title="Generated email"
        description="Editable draft. Auntie Savvy never sends anything on your behalf."
        actions={
          demo ? (
            <DemoBadge />
          ) : subject || body ? (
            <span className="rounded-full border border-border bg-mint px-3 py-1 text-[11px] font-semibold">
              Ready to review
            </span>
          ) : null
        }
      >
        {error && <ErrorState message={error} />}

        {!subject && !body && !loading && !error && (
          <EmptyState
            title="No draft yet"
            hint="Describe the purpose of your email on the left and Auntie Savvy will draft a subject line and full body."
          />
        )}

        {loading && !subject && (
          <div className="space-y-3" aria-live="polite">
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-pale-pink" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-pale-pink" />
          </div>
        )}

        {(subject || body) && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Suggested subject line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-2xl bg-cream font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Email body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-72 rounded-2xl bg-cream leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" className="rounded-2xl" onClick={copyAll}>
                <Copy className="size-4" aria-hidden="true" /> Copy
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                disabled={loading}
                onClick={() => void run("", "Generating")}
              >
                <RefreshCw className="size-4" aria-hidden="true" /> Regenerate
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                onClick={() => {
                  pushToChat(`Please review this draft email and suggest improvements:\n\nSubject: ${subject}\n\n${body}`);
                  void navigate({ to: "/chat" });
                }}
              >
                <MessageCircleHeart className="size-4" aria-hidden="true" /> Review with Auntie Savvy
              </Button>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Wand2 className="size-4 text-primary" aria-hidden="true" /> Refine
              </p>
              <div className="flex flex-wrap gap-2">
                {REFINEMENTS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={loading}
                    onClick={() => void run(item.instruction, item.label)}
                    className="rounded-full border border-border bg-cream px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-pale-pink disabled:opacity-50"
                  >
                    {busyLabel === item.label ? "Working…" : item.label}
                  </button>
                ))}
              </div>
            </div>

            <Notice tone="care">
              <strong className="font-semibold text-foreground">Review before you send. </strong>
              {AI_DISCLAIMER} Auntie Savvy never sends email for you — copy the draft into your own mail
              client after checking it.
            </Notice>

            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Send className="size-3.5" aria-hidden="true" /> Sender used in drafts: Tokologo Tefu
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}
