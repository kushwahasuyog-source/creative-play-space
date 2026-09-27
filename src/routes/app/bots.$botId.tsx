import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Key01, MessageChatCircle, Zap } from "@untitledui/icons";
import { useState } from "react";

import { AppShell, StatusPill } from "@/components/app/AppShell";
import { connectToken, getBot, setBotLive } from "@/lib/bots.functions";
import { getDeviceId } from "@/lib/device";

export const Route = createFileRoute("/app/bots/$botId")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "Bot settings — BotForge" },
      {
        name: "description",
        content: "Review generated commands, connect Telegram and switch your bot live.",
      },
      { property: "og:title", content: "Bot settings — BotForge" },
      {
        property: "og:description",
        content: "Review generated commands, connect Telegram and switch your bot live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BotDetailPage,
});

function BotDetailPage() {
  const { botId } = Route.useParams();
  const queryClient = useQueryClient();
  const fetchBot = useServerFn(getBot);
  const runConnect = useServerFn(connectToken);
  const runLive = useServerFn(setBotLive);

  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const botQuery = useQuery({
    queryKey: ["bot", botId],
    queryFn: async () => fetchBot({ data: { deviceId: getDeviceId(), botId } }),
    refetchInterval: 8000,
  });

  const connectMutation = useMutation({
    mutationFn: async () => runConnect({ data: { deviceId: getDeviceId(), botId, token } }),
    onSuccess: () => {
      setToken("");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["bot", botId] });
    },
    onError: (caught) =>
      setError(caught instanceof Error ? caught.message : "That token was rejected by Telegram."),
  });

  const liveMutation = useMutation({
    mutationFn: async (live: boolean) => runLive({ data: { deviceId: getDeviceId(), botId, live } }),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["bot", botId] });
    },
    onError: (caught) =>
      setError(caught instanceof Error ? caught.message : "Could not change the bot status."),
  });

  const bot = botQuery.data?.bot;
  const commands = botQuery.data?.commands ?? [];
  const messages = botQuery.data?.messages ?? [];
  const spec = (bot?.spec ?? {}) as {
    tagline?: string;
    persona?: string;
    systemPrompt?: string;
    fallbackReply?: string;
  };
  const isLive = bot?.status === "live";

  return (
    <AppShell>
      <Link
        to="/app"
        className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-3.5" /> All bots
      </Link>

      {botQuery.isLoading ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">Loading bot…</p>
      ) : !bot ? (
        <p className="mt-8 text-sm text-muted-foreground">This bot no longer exists.</p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">{bot.name}</h1>
                <StatusPill status={bot.status} />
              </div>
              <Link
                to="/app/chat/$botId"
                params={{ botId }}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <MessageChatCircle className="size-4" /> Chat with this bot
              </Link>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {spec.tagline ?? bot.prompt}
              </p>
              {bot.telegram_username ? (
                <a
                  href={`https://t.me/${bot.telegram_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block font-mono text-xs text-accent hover:underline"
                >
                  @{bot.telegram_username} on Telegram
                </a>
              ) : null}
            </div>

            <button
              type="button"
              disabled={liveMutation.isPending || !bot.telegram_username}
              onClick={() => liveMutation.mutate(!isLive)}
              className={
                isLive
                  ? "inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:border-accent/50 disabled:opacity-50"
                  : "inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground ring-soft transition-all hover:brightness-110 disabled:opacity-50"
              }
            >
              <Zap className="size-4" />
              {liveMutation.isPending ? "Working…" : isLive ? "Switch off" : "Go live"}
            </button>
          </div>

          {error ? <p className="mt-4 text-sm text-urgent">{error}</p> : null}

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-border bg-panel p-6">
                <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
                  Commands
                </h2>
                <div className="mt-4 space-y-3">
                  {commands.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border bg-surface/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-sm text-accent">{c.command}</p>
                        {c.use_ai ? (
                          <span className="rounded-full border border-accent/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                            AI
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                      {c.reply ? (
                        <p className="mt-3 whitespace-pre-wrap rounded-lg bg-background/60 p-3 text-sm">
                          {c.reply}
                        </p>
                      ) : null}
                    </div>
                  ))}
                  {!commands.length ? (
                    <p className="text-sm text-muted-foreground">No commands generated.</p>
                  ) : null}
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-panel p-6">
                <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
                  <MessageChatCircle className="size-3.5" /> Recent messages
                </h2>
                <div className="mt-4 space-y-2">
                  {messages.length ? (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
                      >
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {m.direction === "out" ? "bot" : (m.telegram_user ?? "user")} ·{" "}
                          {new Date(m.created_at).toLocaleTimeString()}
                        </span>
                        <p className="mt-1 whitespace-pre-wrap">{m.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nothing yet. Once the bot is live, every Telegram message appears here.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-border bg-panel p-6">
                <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
                  <Key01 className="size-3.5" /> Telegram connection
                </h2>
                {bot.token_hint ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Token connected ({bot.token_hint}). Paste a new one to replace it.
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Create a bot with @BotFather on Telegram and paste the token it gives you.
                  </p>
                )}
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="1234567890:AA…"
                  className="mt-4 w-full rounded-xl border border-input bg-surface px-4 py-3 font-mono text-sm outline-none focus:border-accent"
                />
                <button
                  type="button"
                  disabled={connectMutation.isPending || token.trim().length < 20}
                  onClick={() => connectMutation.mutate()}
                  className="mt-3 w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground ring-soft transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {connectMutation.isPending ? "Verifying…" : "Connect token"}
                </button>
                <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                  Stored encrypted. Never sent back to the browser.
                </p>
              </section>

              <section className="rounded-3xl border border-border bg-panel p-6">
                <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
                  Behaviour
                </h2>
                <p className="mt-4 text-sm text-muted-foreground">{spec.persona}</p>
                {spec.systemPrompt ? (
                  <p className="mt-4 whitespace-pre-wrap rounded-lg bg-background/60 p-3 text-xs leading-relaxed text-muted-foreground">
                    {spec.systemPrompt}
                  </p>
                ) : null}
                {spec.fallbackReply ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Fallback: “{spec.fallbackReply}”
                  </p>
                ) : null}
              </section>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
