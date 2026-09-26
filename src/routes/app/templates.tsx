import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Zap } from "@untitledui/icons";

import { AppShell, PageHeading } from "@/components/app/AppShell";
import { listTemplates } from "@/lib/bots.functions";

export const Route = createFileRoute("/app/templates")({
  head: () => ({
    meta: [
      { title: "Bot templates — BotForge" },
      {
        name: "description",
        content: "Fork a proven Telegram bot template and customise it in the AI builder.",
      },
      { property: "og:title", content: "Bot templates — BotForge" },
      {
        property: "og:description",
        content: "Fork a proven Telegram bot template and customise it in the AI builder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const fetchTemplates = useServerFn(listTemplates);
  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => fetchTemplates({}),
  });

  return (
    <AppShell>
      <PageHeading
        eyebrow="Templates"
        title="Fork a proven bot"
        description="Each template fills the AI builder with a starting description you can edit before building."
      />

      {isLoading ? (
        <p className="mt-12 font-mono text-sm text-muted-foreground">Loading templates…</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates?.map((t) => (
            <div key={t.slug} className="rounded-2xl border border-border bg-panel p-6">
              <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
                {t.category}
              </span>
              <h2 className="mt-3 text-base font-semibold">{t.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.description}</p>
              <Link
                to="/app/new"
                search={{ template: t.slug }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Zap className="size-3.5 text-accent" /> Use this template
              </Link>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
