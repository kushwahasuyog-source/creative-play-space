import { createFileRoute } from "@tanstack/react-router";

async function safeEqual(a: string, b: string) {
  const { timingSafeEqual } = await import("node:crypto");
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export const Route = createFileRoute("/api/public/telegram/webhook/$botId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { webhookSecretForBot, decryptToken } = await import("@/lib/botCrypto.server");
        const botId = params.botId;

        let expected: string;
        try {
          expected = webhookSecretForBot(botId);
        } catch {
          return new Response("Not configured", { status: 500 });
        }
        const provided = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(provided, expected)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const update = (await request.json().catch(() => null)) as {
          message?: {
            chat?: { id?: number };
            from?: { username?: string; first_name?: string };
            text?: string;
          };
          edited_message?: unknown;
        } | null;
        const message = update?.message;
        const chatId = message?.chat?.id;
        const text = (message?.text ?? "").trim();
        if (!chatId) return Response.json({ ok: true, ignored: true });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: bot } = await supabaseAdmin
          .from("bots")
          .select("id, owner_id, status, spec, token_cipher")
          .eq("id", botId)
          .maybeSingle();
        if (!bot || bot.status !== "live" || !bot.token_cipher) {
          return Response.json({ ok: true, inactive: true });
        }

        const spec = (bot.spec ?? {}) as {
          systemPrompt?: string;
          fallbackReply?: string;
        };
        const who = message?.from?.username ?? message?.from?.first_name ?? "unknown";

        await supabaseAdmin.from("bot_messages").insert({
          bot_id: bot.id,
          owner_id: bot.owner_id,
          telegram_chat_id: chatId,
          telegram_user: who,
          direction: "in",
          text,
        });

        let reply = "";
        const commandName = text.startsWith("/")
          ? (text.split(/\s+/)[0] ?? "").toLowerCase()
          : null;

        if (commandName) {
          const { data: cmd } = await supabaseAdmin
            .from("bot_commands")
            .select("reply, use_ai")
            .eq("bot_id", bot.id)
            .eq("command", commandName)
            .maybeSingle();
          if (cmd && !cmd.use_ai && cmd.reply) reply = cmd.reply;
          else if (cmd?.use_ai) reply = "";
          else if (!cmd) reply = spec.fallbackReply ?? "I don't know that command yet.";
        }

        if (!reply) {
          try {
            const { generateChatReply } = await import("@/lib/aiBot.server");
            const { data: recent } = await supabaseAdmin
              .from("bot_messages")
              .select("direction, text")
              .eq("bot_id", bot.id)
              .eq("telegram_chat_id", chatId)
              .order("created_at", { ascending: false })
              .limit(8);
            const history = (recent ?? [])
              .slice(1)
              .reverse()
              .filter((m) => m.text)
              .map((m) => ({
                role: (m.direction === "out" ? "assistant" : "user") as "assistant" | "user",
                content: m.text as string,
              }));
            reply = await generateChatReply(
              spec.systemPrompt ?? "You are a helpful Telegram bot.",
              text || "(the user sent a non-text message)",
              history,
            );
          } catch (error) {
            console.error("AI reply failed", error);
            reply = spec.fallbackReply ?? "Sorry, I couldn't answer that just now.";
          }
        }

        try {
          const { sendMessage } = await import("@/lib/telegram.server");
          await sendMessage(decryptToken(bot.token_cipher), chatId, reply);
          await supabaseAdmin.from("bot_messages").insert({
            bot_id: bot.id,
            owner_id: bot.owner_id,
            telegram_chat_id: chatId,
            telegram_user: "bot",
            direction: "out",
            text: reply,
          });
        } catch (error) {
          console.error("sendMessage failed", error);
        }

        await supabaseAdmin
          .from("bots")
          .update({ last_activity_at: new Date().toISOString() })
          .eq("id", bot.id);

        return Response.json({ ok: true });
      },
    },
  },
});
