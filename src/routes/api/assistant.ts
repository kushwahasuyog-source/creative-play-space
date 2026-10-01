import { createOpenAI } from "@ai-sdk/openai";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM = [
  "You are the BotForge coding assistant. You help people write and debug Telegram bot code.",
  "Default to TypeScript with the Telegram Bot API over fetch (or node-telegram-bot-api / telegraf when the user asks).",
  "Always return complete, runnable code in fenced blocks with the language tag, and keep explanations short and practical.",
  "Point out where a bot token or webhook secret belongs, but never invent real credentials.",
  "When the request is vague, make a sensible assumption, say what you assumed, and still give working code.",
].join(" ");

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("The AI assistant is not configured.", { status: 500 });
        }

        const body = (await request.json()) as { messages?: UIMessage[] };
        const messages = body.messages ?? [];

        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key,
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        const result = streamText({
          model: lovable.chat("google/gemini-3-flash-preview"),
          system: SYSTEM,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
        });

        return result.toUIMessageStreamResponse({
          sendReasoning: false,
          originalMessages: messages,
        });
      },
    },
  },
});
