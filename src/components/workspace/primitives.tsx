import { Info, Lock, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  icon,
  children,
  className,
  actions,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={cn("savvy-card min-w-0 p-5 sm:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            {icon ?? <Sparkles className="size-4 text-primary" aria-hidden="true" />}
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Notice({
  children,
  tone = "info",
  icon,
}: {
  children: ReactNode;
  tone?: "info" | "privacy" | "care";
  icon?: ReactNode;
}) {
  const toneClass =
    tone === "privacy" ? "bg-powder" : tone === "care" ? "bg-pale-lavender" : "bg-pale-pink";
  const defaultIcon =
    tone === "privacy" ? (
      <Lock className="size-4 shrink-0 text-primary" aria-hidden="true" />
    ) : tone === "care" ? (
      <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
    ) : (
      <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
    );

  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-2xl border border-border px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground",
        toneClass,
      )}
    >
      {icon ?? defaultIcon}
      <span className="min-w-0">{children}</span>
    </p>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-pale-lavender px-2.5 py-1 text-[11px] font-semibold">
      Demo mode
    </span>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-cream px-6 py-12 text-center">
      <Sparkles className="size-6 text-primary" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive"
    >
      {message}
    </p>
  );
}
