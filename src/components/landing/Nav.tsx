import { useState } from "react";
import { MessageSmileCircle } from "@untitledui/icons";
import { ActionLink } from "./primitives";

const links = [
  { label: "How it works", href: "#how" },
  { label: "Builder", href: "#builder" },
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl print:static">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:px-10">
        <a href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageSmileCircle className="size-4.5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">BotForge</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/app" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
            My bots
          </a>
          <ActionLink href="/app" className="whitespace-nowrap px-3 py-2 sm:px-4">
            Create your bot
          </ActionLink>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
            className="flex size-11 items-center justify-center rounded-lg border border-border md:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col border-t border-border px-4 py-2 md:hidden">
          {[...links, { label: "My bots", href: "/app" }].map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
