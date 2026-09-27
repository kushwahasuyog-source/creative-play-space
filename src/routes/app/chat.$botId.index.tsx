import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { createChatThread, listChatThreads } from "@/lib/botChat.functions";
import { getDeviceId } from "@/lib/device";

export const Route = createFileRoute("/app/chat/$botId/")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "Chat with your bot — BotForge" },
      { name: "description", content: "Test your Telegram bot in a live chat before going live." },
      { property: "og:title", content: "Chat with your bot — BotForge" },
      { property: "og:description", content: "Test your Telegram bot in a live chat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatStart,
});

function ChatStart() {
  const { botId } = Route.useParams();
  const navigate = useNavigate();
  const list = useServerFn(listChatThreads);
  const create = useServerFn(createChatThread);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const deviceId = getDeviceId();
        const { threads } = await list({ data: { deviceId, botId } });
        const id = threads[0]?.id ?? (await create({ data: { deviceId, botId } })).id;
        navigate({ to: "/app/chat/$botId/$threadId", params: { botId, threadId: id }, replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not open the chat.");
      }
    })();
  }, [botId, list, create, navigate]);

  return (
    <AppShell>
      <p className="text-sm text-muted-foreground">{error ?? "Opening chat…"}</p>
    </AppShell>
  );
}
