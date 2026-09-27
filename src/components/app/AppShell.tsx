import { ThemeToggle } from "@/components/site/ThemeToggle";
import { Link, useNavigate } from "@tanstack/react-router";
import { Code02, Grid01, MessageSmileCircle, Plus } from "@untitledui/icons";
import { useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

import { cn } from "@/lib/utils";

const nav = [
  { to: "/app", label: "My bots", icon: MessageSmileCircle },
  { to: "/app/new", label: "AI builder", icon: Plus },
  { to: "/app/templates", label: "Templates", icon: Grid01 },
  { to: "/app/assistant", label: "Coding assistant", icon: Code02 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/auth" });
      else setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate({ to: "/auth" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);
  if (!ready)
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-6 py-16">
        <div className="h-8 w-48 animate-pulse rounded bg-surface" />
        <div className="h-32 animate-pulse rounded-xl bg-surface" />
        <div className="h-32 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-10">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSmileCircle className="size-4.5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">BotForge</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/app" }}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-surface data-[status=active]:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/app/new"
            search={{ template: undefined }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
          >
            <Plus className="size-4" /> New bot
          </Link>
          </div>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/app" }}
            className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground data-[status=active]:bg-surface data-[status=active]:text-accent"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">{children}</main>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    live: "border-accent/50 bg-accent/10 text-accent",
    paused: "border-amber/40 bg-amber/10 text-amber",
    draft: "border-border bg-surface text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest",
        map[status] ?? map["draft"],
      )}
    >
      {status}
    </span>
  );
}
