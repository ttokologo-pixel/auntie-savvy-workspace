# Auntie Savvy AI Workspace

An integrated AI productivity workspace for Tokologo Tefu. One application, three connected work
modes: **Email Studio**, **Research Desk** and **Ask Auntie Savvy**.

The app opens straight into the working dashboard — there is no marketing landing page.

## Features

### Email Studio

- Purpose, recipient, context and tone inputs (Formal / Friendly / Persuasive)
- Generated subject line and complete, editable email body
- Copy, regenerate and one-click refinements (shorter, add urgency, improve clarity, friendlier,
  more persuasive)
- Nothing is ever sent automatically — you copy the reviewed draft into your own mail client

### Research Desk

- Topic or question, pasted source text, optional reference URL, and depth (Quick / Standard / Detailed)
- Structured brief: executive summary, key findings, insights, assumptions, risks and limitations,
  recommendations, next steps and sources
- Confirmed source facts, AI analysis, assumptions and recommendations are labelled separately
- Citations are never fabricated; a supplied URL is recorded as an unverified pointer only

### Ask Auntie Savvy

- Multi-turn workplace chat with suggested prompts and conversation clearing
- Enter sends, Shift + Enter adds a new line
- Conversation tools: summarise, extract action items, turn the conversation into an email
- Persistent "Human in the loop" panel

### Shared workflow

Research can be turned into an email or sent to the chatbot, a chat conversation can be turned into
an email, and an email draft can be sent to Auntie Savvy for review — context is carried across.

## Technology stack

- React 19 + TypeScript (strict)
- TanStack Start / TanStack Router (Vite)
- Tailwind CSS v4 with a pastel design-token system in `src/styles.css`
- Lucide React icons, shadcn-style UI primitives, Sonner toasts
- Server-side AI through the Lovable AI Gateway

## Local setup

```bash
bun install     # or npm install
bun run dev     # http://localhost:8080
bun run build
```

## Environment variables

| Variable           | Where       | Purpose                                           |
| ------------------ | ----------- | ------------------------------------------------- |
| `LOVABLE_API_KEY`  | Server only | Authenticates AI Gateway requests                 |

The key is read only inside server function handlers (`src/lib/ai-gateway.server.ts`). It is never
bundled into client code, never placed in a query string, and never written to browser storage.

**Demo mode:** if no key is configured, every feature returns clearly labelled deterministic sample
content marked "Demo mode". Demo output is never presented as live AI.

## Responsible AI approach

- "AI can make mistakes. Check important information before acting." is shown throughout
- Human-in-the-loop panel in the chatbot area
- Privacy reminders beside sensitive input areas
- Verification notice on every research brief
- Explicit loading, empty and error states; failures are surfaced, never hidden
- No fabricated sources, no automatic sending, no false "completed" claims

## Project structure

```
src/
  components/workspace/   shell, navigation and shared panels
  components/ui/          UI primitives
  lib/ai-gateway.server.ts  server-only AI gateway client
  lib/savvy.functions.ts    server functions for email, research and chat
  lib/savvy-prompts.ts      per-mode system prompts
  lib/workspace-context.tsx cross-mode shared context
  routes/                 /, /research, /chat
```

## Deployment

Publish from Lovable, or build with `bun run build` and deploy the output to any host that supports
the TanStack Start server output. Set `LOVABLE_API_KEY` as a server-side secret in the hosting
environment before going live.
