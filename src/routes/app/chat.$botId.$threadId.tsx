import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Plus, Trash01 } from "@untitledui/icons";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  createChatThread,
  deleteChatThread,
  getChatMessages,
  listChatThreads,
  sendChatMessage,
} from "@/lib/botChat.functions";
import { getDeviceId } from "@/lib/device";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/chat/$botId/$threadId")({
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
  component: ChatPage,
});

type Msg = { id: string; role: string; content: string };

function ChatPage() {
  const { botId, threadId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const deviceId = getDeviceId();
  const list = useServerFn(listChatThreads);
  const load = useServerFn(getChatMessages);
  const send = useServerFn(sendChatMessage);
  const create = useServerFn(createChatThread);
  const remove = useServerFn(deleteChatThread);
  const [text, setText] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const threadsQ = useQuery({
    queryKey: ["chat-threads", botId],
    queryFn: () => list({ data: { deviceId, botId } }),
  });
  const msgsQ = useQuery({
    queryKey: ["chat-msgs", threadId],
    queryFn: () => load({ data: { deviceId, threadId } }),
  });

  const sendM = useMutation({
    mutationFn: (t: string) => send({ data: { deviceId, threadId, text: t } }),
    onMutate: (t) => setPending(t),
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["chat-msgs", threadId] });
      qc.invalidateQueries({ queryKey: ["chat-threads", botId] });
      setPending(null);
    },
    onError: () => toast.error("The bot couldn't reply. Try again."),
  });

  async function newThread() {
    try {
      const { id } = await create({ data: { deviceId, botId } });
      await qc.invalidateQueries({ queryKey: ["chat-threads", botId] });
      navigate({ to: "/app/chat/$botId/$threadId", params: { botId, threadId: id } });
    } catch {
      toast.error("Could not start a new chat.");
    }
  }

  async function deleteThread(id: string) {
    if (!confirm("Delete this chat?")) return;
    try {
      await remove({ data: { deviceId, threadId: id } });
      await qc.invalidateQueries({ queryKey: ["chat-threads", botId] });
      toast.success("Chat deleted");
      if (id === threadId) navigate({ to: "/app/chat/$botId", params: { botId } });
    } catch {
      toast.error("Could not delete that chat.");
    }
  }

  const messages: Msg[] = [
    ...(msgsQ.data ?? []),
    ...(pending ? [{ id: "pending", role: "user", content: pending }] : []),
  ];
  const threads = threadsQ.data?.threads ?? [];
  const botName = threadsQ.data?.bot.name ?? "your bot";

  return (
    <AppShell>
      <Link
        to="/app/bots/$botId"
        params={{ botId }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Back to bot settings
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Chat with {botName}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Replies follow the same commands and AI rules your bot uses on Telegram.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr]">
        <aside className="space-y-2">
          <button
            type="button"
            onClick={newThread}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> New chat
          </button>
          <nav aria-label="Chats" className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {threads.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "flex min-w-40 items-center gap-1 rounded-lg border border-border md:min-w-0",
                  t.id === threadId ? "bg-surface text-accent" : "text-muted-foreground",
                )}
              >
                <Link
                  to="/app/chat/$botId/$threadId"
                  params={{ botId, threadId: t.id }}
                  className="min-w-0 flex-1 truncate px-3 py-2 text-sm hover:text-foreground"
                >
                  {t.title}
                </Link>
                <button
                  type="button"
                  aria-label="Delete chat"
                  onClick={() => deleteThread(t.id)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash01 className="size-4" />
                </button>
              </div>
            ))}
          </nav>
        </aside>

        <section className="flex h-[65vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <Conversation className="flex-1">
            <ConversationContent key={threadId}>
              {messages.length === 0 && !msgsQ.isLoading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Say hi, or try <span className="font-mono text-accent">/start</span> and{" "}
                  <span className="font-mono text-accent">/help</span>.
                </p>
              ) : null}
              {messages.map((m) => (
                <Message key={m.id} from={m.role === "user" ? "user" : "assistant"}>
                  <MessageContent>
                    <MessageResponse>{m.content}</MessageResponse>
                  </MessageContent>
                </Message>
              ))}
              {sendM.isPending ? <Shimmer className="text-sm">{`${botName} is typing…`}</Shimmer> : null}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <div className="border-t border-border p-3">
            <PromptInput
              onSubmit={(_m, e) => {
                e.preventDefault();
                const t = text.trim();
                if (!t || sendM.isPending) return;
                setText("");
                sendM.mutate(t);
              }}
            >
              <PromptInputTextarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Message ${botName}…`}
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit status={sendM.isPending ? "submitted" : undefined} disabled={!text.trim()} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
