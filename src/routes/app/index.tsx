import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Edit01, MessageChatCircle, Plus, Trash01 } from "@untitledui/icons";
import { toast } from "sonner";

import { AppShell, PageHeading, StatusPill } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { deleteBot, listBots } from "@/lib/bots.functions";
import { getDeviceId } from "@/lib/device";

export const Route = createFileRoute("/app/")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const run = useServerFn(listBots);
  const remove = useServerFn(deleteBot);
  const { data: bots, isLoading } = useQuery({
    queryKey: ["bots"],
    queryFn: async () => run({ data: { deviceId: getDeviceId() } }),
  });
  const deleteMutation = useMutation({
    mutationFn: (botId: string) => remove({ data: { deviceId: getDeviceId(), botId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot deleted");
    },
    onError: () => toast.error("Could not delete that bot."),
  });

  function confirmDelete(botId: string, name: string) {
    if (!window.confirm(`Delete ${name}? Its chats and message history will also be deleted.`)) return;
    deleteMutation.mutate(botId);
  }

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
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {bots.map((bot) => {
            const spec = (bot.spec ?? {}) as { tagline?: string };
            return (
              <article
                key={bot.id}
                className="rounded-2xl border border-border bg-panel p-6 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">{bot.name}</h2>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {bot.telegram_username ? `@${bot.telegram_username}` : "Telegram not connected"}
                    </p>
                  </div>
                  <StatusPill status={bot.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {spec.tagline ?? "Telegram bot"}
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2 border-y border-border py-4 text-center">
                  <div><p className="text-lg font-semibold">{bot.chat_count}</p><p className="text-xs text-muted-foreground">Chats</p></div>
                  <div><p className="text-lg font-semibold">{bot.message_count}</p><p className="text-xs text-muted-foreground">Messages</p></div>
                  <div><p className="text-sm font-medium">{bot.last_activity_at ? new Date(bot.last_activity_at).toLocaleDateString() : "—"}</p><p className="text-xs text-muted-foreground">Last active</p></div>
                </div>

                <div className="mt-4">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Recent chats</p>
                  {bot.recent_chats.length ? (
                    <div className="mt-2 space-y-1">
                      {bot.recent_chats.map((chat) => (
                        <Link
                          key={chat.id}
                          to="/app/chat/$botId/$threadId"
                          params={{ botId: bot.id, threadId: chat.id }}
                          className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-surface"
                        >
                          <span className="truncate">{chat.title}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{new Date(chat.updated_at).toLocaleDateString()}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No saved chats yet.</p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild size="sm"><Link to="/app/bots/$botId" params={{ botId: bot.id }}>Open bot</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link to="/app/chat/$botId" params={{ botId: bot.id }}><MessageChatCircle /> Chat</Link></Button>
                  <Button size="sm" variant="outline" onClick={() => navigate({ to: "/app/bots/$botId", params: { botId: bot.id }, search: { edit: true } })}><Edit01 /> Edit</Button>
                  <Button size="icon-sm" variant="ghost" aria-label={`Delete ${bot.name}`} disabled={deleteMutation.isPending} onClick={() => confirmDelete(bot.id, bot.name)} className="ml-auto text-destructive hover:text-destructive"><Trash01 /></Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
