import { ArrowRight, Stars02 } from "@untitledui/icons";
import { ActionLink, Eyebrow, StatusDot } from "./primitives";

const stats = [
  { value: "12K+", label: "Bots deployed" },
  { value: "43M", label: "Events processed" },
  { value: "60s", label: "Prompt to running bot" },
  { value: "99.9%", label: "Uptime" },
];

export function Hero() {
  return (
    <div id="top" className="relative overflow-hidden bg-hero">
      <div className="absolute inset-0 grid-lines opacity-60" aria-hidden />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-24 md:px-10 md:pt-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-rise">
            <Eyebrow>
              <Stars02 className="size-3.5" /> AI Telegram bot platform
            </Eyebrow>
            <h1 className="mt-6 text-5xl leading-[1.02] tracking-tight md:text-7xl">
              Build Telegram bots <span className="text-gradient italic">with AI</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Describe what you want. BotForge writes the bot, wires up your BotFather token,
              deploys it, and gives you one dashboard for commands, automations and logs.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ActionLink href="/app">
                Create your bot <ArrowRight className="size-4" />
              </ActionLink>
              <ActionLink href="#templates" variant="ghost">
                Explore templates
              </ActionLink>
            </div>
            <p className="mt-5 font-mono text-xs text-muted-foreground">
              No server setup. No boilerplate. Tokens stored encrypted.
            </p>
          </div>

          <PromptPanel />
        </div>

        <dl className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface px-6 py-6">
              <dt className="font-display text-2xl font-semibold text-mint">{s.value}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function PromptPanel() {
  return (
    <div className="animate-rise rounded-3xl border border-border bg-panel p-2 shadow-panel [animation-delay:120ms]">
      <div className="rounded-[1.25rem] border border-border bg-background/60 p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            AI builder
          </span>
          <span className="flex items-center gap-2 font-mono text-xs text-accent">
            <StatusDot /> generating
          </span>
        </div>

        <p className="mt-5 rounded-xl border border-input bg-surface px-4 py-3 text-sm text-foreground">
          Create a Telegram bot that lets users upload images and convert them to PDF.
        </p>

        <div className="mt-4 space-y-2 font-mono text-xs text-muted-foreground">
          {[
            "✓ Requirement parser — 4 features detected",
            "✓ Architecture planner — handlers, services, storage",
            "✓ Code generator — main.py, handlers/, Dockerfile",
            "✓ Security check — token stored in vault",
          ].map((line) => (
            <p key={line} className="rounded-lg bg-surface/60 px-3 py-2">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-accent/30 bg-surface p-4">
          <p className="font-mono text-xs text-accent">/start</p>
          <p className="mt-2 text-sm">
            Welcome to <strong className="font-semibold">ImageToPDF Bot</strong>! Upload your images
            below.
          </p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              Convert to PDF
            </span>
            <span className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground">
              Help
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
