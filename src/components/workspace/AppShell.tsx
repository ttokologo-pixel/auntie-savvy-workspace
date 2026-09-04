import { Link, useRouterState } from "@tanstack/react-router";
import { Plus, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AI_DISCLAIMER } from "@/lib/savvy-prompts";
import { NAV_ITEMS } from "./nav-items";

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav aria-label="Workspace" className="flex flex-col gap-1">
      {!collapsed && (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Workspace
        </p>
      )}
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? "page" : undefined}
            title={item.label}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              active
                ? "bg-surface text-primary shadow-[var(--shadow-soft)]"
                : "text-foreground/80 hover:bg-surface/70 hover:text-foreground",
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV_ITEMS.find((item) => item.to === pathname) ?? NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Desktop / tablet sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col border-r border-border px-3 py-5 md:flex lg:w-[250px] lg:px-4"
        style={{ background: "var(--gradient-sidebar)" }}
      >
        <div className="flex items-center gap-3 px-1 lg:px-2">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-2xl text-primary-foreground shadow-[var(--shadow-card)]"
            style={{ background: "var(--gradient-accent)" }}
          >
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <span className="hidden leading-tight lg:block">
            <span className="block text-base font-semibold">Auntie Savvy</span>
            <span className="block text-xs text-muted-foreground">AI Workspace</span>
          </span>
        </div>

        <Link
          to="/chat"
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition-opacity hover:opacity-90"
          title="New task"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden lg:inline">New Task</span>
        </Link>

        <div className="mt-6 lg:mt-8">
          <div className="hidden lg:block">
            <SidebarNav collapsed={false} />
          </div>
          <div className="lg:hidden">
            <SidebarNav collapsed />
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="hidden rounded-2xl border border-border bg-surface/80 p-3 lg:block">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Responsible AI
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{AI_DISCLAIMER}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface/80 p-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pale-lavender text-plum">
              <UserRound className="size-4" aria-hidden="true" />
            </span>
            <span className="hidden leading-tight lg:block">
              <span className="block text-sm font-medium">Tokologo Tefu</span>
              <span className="block text-[11px] text-muted-foreground">Workspace owner</span>
            </span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-[76px] lg:pl-[250px]">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Productivity suite
              </p>
              <h1 className="truncate text-lg font-semibold sm:text-xl">{current.label}</h1>
            </div>
            <span className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-mint px-3 py-1.5 text-xs font-medium">
              <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
              AI ready
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 md:pb-10">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Workspace"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-surface/95 backdrop-blur md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
