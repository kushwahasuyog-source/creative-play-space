import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Stars02 } from "@untitledui/icons";
import { useEffect, useState } from "react";

import { AppShell, PageHeading } from "@/components/app/AppShell";
import { generateBot, listTemplates } from "@/lib/bots.functions";
import { getDeviceId } from "@/lib/device";
import { takeHandoff } from "@/lib/handoff";

const stages = [
  "Requirement parser",
  "Specification generator",
  "Architecture planner",
  "Command generator",
  "Reply writer",
  "Safety review",
];

export const Route = createFileRoute("/app/new")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    template: typeof search["template"] === "string" ? (search["template"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "AI bot builder — BotForge" },
      {
        name: "description",
        content: "Describe a Telegram bot in plain language and let BotForge build it.",
      },
      { property: "og:title", content: "AI bot builder — BotForge" },
      {
        property: "og:description",
        content: "Describe a Telegram bot in plain language and let BotForge build it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewBotPage,
});

function NewBotPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/app/new" });
  const run = useServerFn(generateBot);
  const fetchTemplates = useServerFn(listTemplates);

  const [prompt, setPrompt] = useState("");
  const [fromAssistant, setFromAssistant] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { data: templates } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => fetchTemplates({}),
  });

  useEffect(() => {
    const handoff = takeHandoff();
    if (handoff) {
      setPrompt(handoff);
      setFromAssistant(true);
    }
  }, []);

  useEffect(() => {
    if (!search.template || !templates) return;
    const match = templates.find((t) => t.slug === search.template);
    if (match) setPrompt(match.starter_prompt);
  }, [search.template, templates]);

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, stages.length - 1)), 2600);
    return () => clearInterval(timer);
  }, [busy]);

  async function build() {
    setBusy(true);
    setStage(0);
    setError(null);
    try {
      const result = await run({
        data: {
          deviceId: getDeviceId(),
          prompt,
          ...(search.template ? { templateSlug: search.template } : {}),
        },
      });
      navigate({ to: "/app/bots/$botId", params: { botId: result.botId } });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The builder could not finish. Try again.",
      );
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <PageHeading
        eyebrow="AI builder"
        title="Describe your bot"
        description="One or two sentences is enough. BotForge decides the commands, replies and personality."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-border bg-panel p-6">
          {fromAssistant ? (
            <p className="mb-3 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-xs text-accent">
              Brought over from the coding assistant — edit anything before building.
            </p>
          ) : null}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={busy}
            rows={7}
            placeholder="A Telegram bot that answers questions about my coffee shop, shares today's menu on /menu and takes orders."
            className="w-full resize-none rounded-2xl border border-input bg-surface px-4 py-4 text-sm leading-relaxed outline-none focus:border-accent disabled:opacity-60"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={build}
              disabled={busy || prompt.trim().length < 10}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground ring-soft transition-all hover:brightness-110 disabled:opacity-50"
            >
              <Stars02 className="size-4" />
              {busy ? "Building your bot…" : "Build my bot"}
            </button>
            <span className="font-mono text-xs text-muted-foreground">
              Takes about 20–40 seconds
            </span>
          </div>
          {error ? <p className="mt-4 text-sm text-urgent">{error}</p> : null}
        </div>

        <div className="rounded-3xl border border-border bg-panel p-6">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Build pipeline
          </span>
          <ol className="mt-4 space-y-2">
            {stages.map((s, i) => {
              const done = busy && i < stage;
              const active = busy && i === stage;
              return (
                <li
                  key={s}
                  className="flex items-center gap-3 rounded-lg bg-background/50 px-3 py-2 font-mono text-xs"
                >
                  <span className="text-accent">
                    {done ? <Check className="size-3.5" /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={active ? "text-accent" : "text-muted-foreground"}>
                    {s}
                    {active ? " …" : ""}
                  </span>
                </li>
              );
            })}
          </ol>

          {templates?.length ? (
            <div className="mt-6 border-t border-border pt-5">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Start from a template
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    disabled={busy}
                    onClick={() => setPrompt(t.starter_prompt)}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-50"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
