import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";

export const BotSpecSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  persona: z.string(),
  systemPrompt: z.string(),
  fallbackReply: z.string(),
  commands: z.array(
    z.object({
      command: z.string(),
      description: z.string(),
      reply: z.string(),
      useAi: z.boolean(),
    }),
  ),
});

export type BotSpec = z.infer<typeof BotSpecSchema>;

function gateway() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
}


export async function generateBotSpec(prompt: string): Promise<BotSpec> {
  const result = streamText({
    model: gateway().chat("google/gemini-3-flash-preview"),
    system: [
      "You design Telegram bots. Given a plain-language description, produce a complete bot specification.",
      "Always include a /start and a /help command. Add other commands the description implies (lowercase, no spaces, with the leading slash).",
      "reply is the exact static text Telegram sends. When a command needs a live AI answer instead, set useAi true and leave reply as a short holding sentence.",
      "systemPrompt instructs the AI that answers free-form messages: give it the bot's purpose, tone and boundaries.",
      "Keep replies friendly, concise and free of markdown.",
    ].join(" "),
    prompt,
    output: Output.object({ schema: BotSpecSchema }),
  });
  return (await result.output) as BotSpec;
}

export async function generateChatReply(
  systemPrompt: string,
  userText: string,
  history: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const result = streamText({
    model: gateway().chat("google/gemini-3-flash-preview"),
    system: `${systemPrompt}\n\nReply in at most 80 words. Plain text only.`,
    messages: [...history, { role: "user" as const, content: userText }],
  });
  const text = await result.text;
  return text.trim();
}
