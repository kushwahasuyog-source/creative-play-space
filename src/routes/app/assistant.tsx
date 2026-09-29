import { useChat } from "@ai-sdk/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Code02, Save01, Stars02 } from "@untitledui/icons";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

import { saveTemplate } from "@/lib/bots.functions";
import { setHandoff } from "@/lib/handoff";

import assistantMark from "@/assets/assistant-mark.png";
import { AppShell, PageHeading } from "@/components/app/AppShell";
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
import { AgentProgress } from "@/components/app/AgentProgress";

const starters = [
  "Write a Telegram bot in TypeScript that replies to /start and /help using webhooks.",
  "Add an inline keyboard with three buttons to my Telegram bot and handle the callbacks.",
  "Show me how to save every incoming Telegram message to Postgres.",
  "My bot stops answering after a few minutes — help me debug the webhook.",
];

export const Route = createFileRoute("/app/assistant")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "AI coding assistant — BotForge" },
      {
        name: "description",
        content:
          "Ask the BotForge coding assistant to write, explain and debug Telegram bot code, with runnable snippets.",
      },
      { property: "og:title", content: "AI coding assistant — BotForge" },
      {
        property: "og:description",
        content: "Ask for Telegram bot code and get runnable snippets back, explained.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const store = useServerFn(saveTemplate);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/assistant" }),
  });

  const busy = status === "submitted" || status === "streaming";

  function textOf(message: (typeof messages)[number]) {
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("\n\n")
      .trim();
  }

  function buildFrom(message: (typeof messages)[number]) {
    setHandoff(textOf(message));
    void navigate({ to: "/app/new", search: { template: undefined } });
  }

  async function saveAsTemplate(message: (typeof messages)[number]) {
    setSaveError(null);
    try {
      await store({
        data: { name: templateName.trim(), starterPrompt: textOf(message) },
      });
      setSavedId(message.id);
      setSavingId(null);
      setTemplateName("");
    } catch (caught) {
      setSaveError(
        caught instanceof Error ? caught.message : "Could not save that as a template.",
      );
    }
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    void sendMessage({ text: trimmed });
  }

  return (
    <AppShell>
      <PageHeading
        eyebrow="Coding assistant"
        title="Ask for Telegram bot code"
        description="Describe what the bot should do, paste an error, or ask for a change. You get runnable code back."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="flex h-[62vh] min-h-[420px] flex-col rounded-3xl border border-border bg-panel">
          <Conversation className="flex-1">
            <ConversationContent className="gap-6">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                  <img
                    src={assistantMark}
                    alt=""
                    loading="lazy"
                    width={816}
                    height={816}
                    className="size-16"
                  />
                  <div>
                    <p className="text-sm font-medium">Your bot code, written on request</p>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Ask a question below, or pick one of the starters to see how it works.
                    </p>
                  </div>
                </div>
              ) : null}

              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <MessageResponse key={index}>{part.text}</MessageResponse>
                      ) : part.type === "reasoning" && part.text ? (
                        <details
                          key={index}
                          className="rounded-lg border border-border bg-surface/60 px-3 py-2"
                        >
                          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                            Thinking
                          </summary>
                          <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                            {part.text}
                          </p>
                        </details>
                      ) : null,
                    )}
                  </MessageContent>
                  {message.role === "assistant" && !busy && textOf(message) ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => buildFrom(message)}
                          className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-all hover:brightness-110"
                        >
                          <Stars02 className="size-3.5" /> Build this bot
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSavedId(null);
                            setSaveError(null);
                            setSavingId(savingId === message.id ? null : message.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
                        >
                          <Save01 className="size-3.5" /> Save as template
                        </button>
                        {savedId === message.id ? (
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-accent">
                            <Check className="size-3.5" /> Saved to templates
                          </span>
                        ) : null}
                      </div>

                      {savingId === message.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Template name, e.g. Pizza order bot"
                            className="w-64 rounded-lg border border-input bg-surface px-3 py-1.5 text-xs outline-none focus:border-accent"
                          />
                          <button
                            type="button"
                            disabled={templateName.trim().length < 2}
                            onClick={() => void saveAsTemplate(message)}
                            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                      ) : null}

                      {saveError && savingId === message.id ? (
                        <p className="text-xs text-urgent">{saveError}</p>
                      ) : null}
                    </div>
                  ) : null}
                </Message>
              ))}

              {busy ? (
                <div className="space-y-3">
                  {status === "submitted" ? (
                    <Shimmer className="text-sm">Reading your request…</Shimmer>
                  ) : null}
                  <AgentProgress
                    steps={[
                      { id: "read", title: "Read your request", status: status === "submitted" ? "in-progress" : "completed" },
                      { id: "code", title: "Write the bot code", status: status === "streaming" ? "in-progress" : "pending" },
                      { id: "explain", title: "Explain how to run it", status: "pending" },
                    ]}
                  />
                </div>
              ) : null}

              {error ? (
                <p className="text-sm text-urgent">
                  The assistant could not answer that. Try sending it again.
                </p>
              ) : null}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t border-border p-4">
            <PromptInput
              onSubmit={(_message, event) => {
                event.preventDefault();
                send(input);
              }}
            >
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                placeholder="e.g. Write a Telegram bot that takes pizza orders and confirms them."
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit
                  status={status}
                  disabled={!input.trim() && !busy}
                  {...(busy ? { onClick: () => void stop() } : {})}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>

        <aside className="rounded-3xl border border-border bg-panel p-5">
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <Code02 className="size-3.5 text-accent" /> Starters
          </span>
          <div className="mt-4 space-y-2">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => send(s)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
            Code is written for you to copy into your own project. Never paste a real bot token into
            the chat.
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
