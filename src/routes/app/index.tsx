import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, MessageChatCircle, Plus } from "@untitledui/icons";

import { AppShell, PageHeading, StatusPill } from "@/components/app/AppShell";
import { listBots } from "@/lib/bots.functions";
import { getDeviceId } from "@/lib/device";

export const Route = createFileRoute("/app/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My bots — BotForge" },
      { name: "description", content: "Every Telegram bot you have built, with live status." },
      { property: "og:title", content: "My bots — BotForge" },
      {
        property: "og:description",
        content: "Every Telegram bot you have built, with live status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BotsPage,
});

function BotsPage() {
  const run = useServerFn(listBots);
  const { data: bots, isLoading } = useQuery({
    queryKey: ["bots"],
    queryFn: async () => run({ data: { deviceId: getDeviceId() } }),
  });

  return (
    <AppShell>
      <PageHeading
        eyebrow="Dashboard"
        title="My bots"
        description="Build a bot from a sentence, connect your BotFather token, and switch it live on Telegram."
        action={
          <Link
            to="/app/new"
            search={{ template: undefined }}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground ring-soft transition-all hover:brightness-110"
          >
            <Plus className="size-4" /> New bot
          </Link>
        }
      />

      {isLoading ? (
        <p className="mt-12 font-mono text-sm text-muted-foreground">Loading your bots…</p>
      ) : !bots?.length ? (
        <div className="mt-12 rounded-3xl border border-border bg-panel p-12 text-center">
          <MessageChatCircle className="mx-auto size-8 text-accent" />
          <h2 className="mt-5 text-xl font-semibold">No bots yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Describe the Telegram bot you want and BotForge writes its commands, replies and
            personality for you.
          </p>
          <Link
            to="/app/new"
            search={{ template: undefined }}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground ring-soft"
          >
            Build your first bot <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => {
            const spec = (bot.spec ?? {}) as { tagline?: string };
            return (
              <Link
                key={bot.id}
                to="/app/bots/$botId"
                params={{ botId: bot.id }}
                className="rounded-2xl border border-border bg-panel p-6 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold">{bot.name}</h2>
                  <StatusPill status={bot.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {spec.tagline ?? "Telegram bot"}
                </p>
                <p className="mt-5 font-mono text-xs text-muted-foreground">
                  {bot.telegram_username ? `@${bot.telegram_username}` : "No token connected"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
