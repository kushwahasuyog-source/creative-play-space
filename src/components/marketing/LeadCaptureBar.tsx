import { useState, type FormEvent } from "react";
import { ChevronDown, Send01, X } from "@untitledui/icons";
import { cn } from "@/lib/utils";

export function LeadCaptureBar({
  teaser = "Get the BotForge launch playbook.",
  teaserSub = "Growth tactics for Telegram bots, once a month.",
  successMessage = "You're on the list — check your inbox.",
  className,
}: {
  teaser?: string;
  teaserSub?: string;
  successMessage?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (dismissed) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) setSent(true);
  };

  return (
    <div className={cn("fixed inset-x-0 bottom-0 z-50 px-4 pb-4", className)}>
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-panel backdrop-blur-xl">
        {/* Collapsed teaser / toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
        >
          <span className="size-2 shrink-0 rounded-full bg-accent animate-dot" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-sm">
            <span className="font-semibold">{teaser}</span>{" "}
            <span className="text-muted-foreground">{teaserSub}</span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {/* Expanded form — grid-rows slide */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="flex items-start gap-3 border-t border-border px-5 py-4">
              {sent ? (
                <p className="flex-1 py-2 text-sm text-accent">{successMessage}</p>
              ) : (
                <form onSubmit={submit} className="flex flex-1 flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    aria-label="Email address"
                    className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background/60 px-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-accent/60"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-[filter] hover:brightness-110 ring-soft"
                  >
                    <Send01 className="size-4" />
                    Subscribe
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss"
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
