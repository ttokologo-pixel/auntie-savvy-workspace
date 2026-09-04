import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Copy, Mail, MessageCircleHeart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DemoBadge, EmptyState, ErrorState, Notice, Panel } from "@/components/workspace/primitives";
import { AI_DISCLAIMER, VERIFICATION_NOTICE } from "@/lib/savvy-prompts";
import { runResearch } from "@/lib/savvy.functions";
import type { ResearchBrief, ResearchDepth } from "@/lib/savvy-types";
import { useWorkspace } from "@/lib/workspace-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Desk | Auntie Savvy AI Workspace" },
      {
        name: "description",
        content:
          "Turn a question or pasted source material into a structured research brief with findings, risks and next steps.",
      },
      { property: "og:title", content: "Research Desk | Auntie Savvy AI Workspace" },
      {
        property: "og:description",
        content: "Structured, decision-useful research briefs that separate facts, analysis and assumptions.",
      },
    ],
  }),
  component: ResearchDesk,
});

const DEPTHS: { value: ResearchDepth; label: string }[] = [
  { value: "quick", label: "Quick" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
];

function briefToText(brief: ResearchBrief): string {
  const section = (heading: string, items: string[]) =>
    items.length ? `${heading}\n${items.map((item) => `- ${item}`).join("\n")}\n` : "";
  return [
    brief.title,
    "",
    `Executive summary\n${brief.executiveSummary}`,
    "",
    section("Key findings (from supplied sources)", brief.keyFindings),
    section("Insights (AI analysis)", brief.insights),
    section("Assumptions", brief.assumptions),
    section("Risks and limitations", brief.risks),
    section("Recommendations", brief.recommendations),
    section("Recommended next steps", brief.nextSteps),
    section("Sources", brief.sources),
    VERIFICATION_NOTICE,
  ]
    .filter(Boolean)
    .join("\n");
}

function ListSection({
  title,
  items,
  note,
  accent,
}: {
  title: string;
  items: string[];
  note?: string;
  accent: string;
}) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-cream p-4">
      <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        {title}
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", accent)}>{note}</span>
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span className="min-w-0 break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResearchDesk() {
  const navigate = useNavigate();
  const { research, setResearch, sendToEmail, pushToChat } = useWorkspace();
  const research_ = useServerFn(runResearch);

  const [question, setQuestion] = useState("");
  const [material, setMaterial] = useState("");
  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState<ResearchDepth>("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!question.trim()) {
      toast.error("Add a topic or research question first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const brief = await research_({ data: { question, material, url, depth } });
      setResearch(brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The brief could not be produced. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <Panel
        title="Research request"
        description="Auntie Savvy analyses what you provide and flags what still needs verification."
        icon={<BookOpen className="size-4 text-primary" aria-hidden="true" />}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="question">Topic or research question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Should we move our team's weekly reporting from spreadsheets to a shared dashboard?"
              className="min-h-24 rounded-2xl bg-cream"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="material">Pasted article or source text</Label>
            <Textarea
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Paste the report, policy or article you want analysed."
              className="min-h-40 rounded-2xl bg-cream"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url">Reference URL (optional)</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.org/report"
              className="rounded-2xl bg-cream"
            />
            <p className="text-[11px] text-muted-foreground">
              Links are not opened. A URL is recorded as an unverified pointer only — paste the text for analysis.
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Depth</legend>
            <div className="flex flex-wrap gap-2">
              {DEPTHS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={depth === option.value}
                  onClick={() => setDepth(option.value)}
                  className={cn(
                    "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
                    depth === option.value
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
            Do not paste confidential or personal information you are not permitted to share.
          </Notice>

          <Button type="submit" disabled={loading} className="w-full rounded-2xl">
            {loading ? "Building the brief…" : "Build research brief"}
          </Button>
        </form>
      </Panel>

      <Panel
        title="Research brief"
        description="Facts, analysis, assumptions and recommendations are labelled separately."
        actions={research?.demo ? <DemoBadge /> : null}
      >
        {error && <ErrorState message={error} />}

        {!research && !loading && !error && (
          <EmptyState
            title="No brief yet"
            hint="Add a question — and any source text you already have — and Auntie Savvy will structure it for you."
          />
        )}

        {loading && (
          <div className="space-y-3" aria-live="polite">
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-pale-pink" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-pale-pink" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-pale-lavender" />
          </div>
        )}

        {research && !loading && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{research.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{research.executiveSummary}</p>
            </div>

            <ListSection
              title="Key findings"
              items={research.keyFindings}
              note="From supplied sources"
              accent="bg-mint"
            />
            <ListSection title="Important insights" items={research.insights} note="AI analysis" accent="bg-powder" />
            <ListSection title="Assumptions" items={research.assumptions} note="Unconfirmed" accent="bg-pale-lavender" />
            <ListSection title="Risks and limitations" items={research.risks} note="Caution" accent="bg-pale-pink" />
            <ListSection
              title="Recommendations"
              items={research.recommendations}
              note="AI suggestion"
              accent="bg-pale-lavender"
            />
            <ListSection title="Recommended next steps" items={research.nextSteps} note="Action" accent="bg-mint" />
            <ListSection title="Sources" items={research.sources} note="User supplied" accent="bg-powder" />

            {!research.sources.length && (
              <p className="text-xs text-muted-foreground">
                No sources were supplied, so none are cited. Auntie Savvy does not invent citations.
              </p>
            )}

            <Notice tone="care">{VERIFICATION_NOTICE}</Notice>
            <Notice>{AI_DISCLAIMER}</Notice>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                onClick={async () => {
                  await navigator.clipboard.writeText(briefToText(research));
                  toast.success("Brief copied to your clipboard");
                }}
              >
                <Copy className="size-4" aria-hidden="true" /> Copy brief
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                onClick={() => {
                  sendToEmail({
                    purpose: `Share the findings of this research with the team: ${research.title}`,
                    recipient: "",
                    context: briefToText(research),
                  });
                  void navigate({ to: "/" });
                }}
              >
                <Mail className="size-4" aria-hidden="true" /> Turn into email
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                onClick={() => {
                  pushToChat(`Let's discuss this research brief:\n\n${briefToText(research)}`);
                  void navigate({ to: "/chat" });
                }}
              >
                <MessageCircleHeart className="size-4" aria-hidden="true" /> Send to Auntie Savvy
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
