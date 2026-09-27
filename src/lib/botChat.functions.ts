import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const deviceId = z.string().uuid();
const uuid = z.string().uuid();

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function ownedBot(db: Awaited<ReturnType<typeof admin>>, botId: string, owner: string) {
  const { data } = await db
    .from("bots")
    .select("id, name, spec")
    .eq("id", botId)
    .eq("owner_id", owner)
    .maybeSingle();
  if (!data) throw new Error("Bot not found");
  return data;
}

async function ownedThread(db: Awaited<ReturnType<typeof admin>>, threadId: string, owner: string) {
  const { data } = await db
    .from("bot_chat_threads")
    .select("id, bot_id, title")
    .eq("id", threadId)
    .eq("owner_id", owner)
    .maybeSingle();
  if (!data) throw new Error("Chat not found");
  return data;
}

export const listChatThreads = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ deviceId, botId: uuid }).parse(i))
  .handler(async ({ data }) => {
    const db = await admin();
    const bot = await ownedBot(db, data.botId, data.deviceId);
    const { data: threads, error } = await db
      .from("bot_chat_threads")
      .select("id, title, updated_at")
      .eq("bot_id", bot.id)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { bot: { id: bot.id, name: bot.name }, threads: threads ?? [] };
  });

export const createChatThread = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ deviceId, botId: uuid }).parse(i))
  .handler(async ({ data }) => {
    const db = await admin();
    await ownedBot(db, data.botId, data.deviceId);
    const { data: row, error } = await db
      .from("bot_chat_threads")
      .insert({ bot_id: data.botId, owner_id: data.deviceId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteChatThread = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ deviceId, threadId: uuid }).parse(i))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db
      .from("bot_chat_threads")
      .delete()
      .eq("id", data.threadId)
      .eq("owner_id", data.deviceId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getChatMessages = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ deviceId, threadId: uuid }).parse(i))
  .handler(async ({ data }) => {
    const db = await admin();
    await ownedThread(db, data.threadId, data.deviceId);
    const { data: rows, error } = await db
      .from("bot_chat_messages")
      .select("id, role, content, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Sends a message to the bot and returns its reply, using the same rules as Telegram. */
export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z.object({ deviceId, threadId: uuid, text: z.string().trim().min(1).max(2000) }).parse(i),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const thread = await ownedThread(db, data.threadId, data.deviceId);
    const bot = await ownedBot(db, thread.bot_id, data.deviceId);
    const spec = (bot.spec ?? {}) as { systemPrompt?: string; fallbackReply?: string };

    const { data: prior } = await db
      .from("bot_chat_messages")
      .select("role, content")
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: false })
      .limit(12);

    const { error: inErr } = await db
      .from("bot_chat_messages")
      .insert({ thread_id: thread.id, owner_id: data.deviceId, role: "user", content: data.text });
    if (inErr) throw new Error(inErr.message);

    let reply = "";
    if (data.text.startsWith("/")) {
      const name = (data.text.split(/\s+/)[0] ?? "").toLowerCase();
      const { data: cmd } = await db
        .from("bot_commands")
        .select("reply, use_ai")
        .eq("bot_id", bot.id)
        .eq("command", name)
        .maybeSingle();
      if (cmd && !cmd.use_ai && cmd.reply) reply = cmd.reply;
      else if (!cmd) reply = spec.fallbackReply ?? "I don't know that command yet.";
    }

    if (!reply) {
      try {
        const { generateChatReply } = await import("@/lib/aiBot.server");
        const history = (prior ?? []).reverse().map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        reply = await generateChatReply(
          spec.systemPrompt ?? "You are a helpful Telegram bot.",
          data.text,
          history,
        );
      } catch (error) {
        console.error("Test chat reply failed", error);
        reply = spec.fallbackReply ?? "Sorry, I couldn't answer that just now.";
      }
    }

    const { error: outErr } = await db
      .from("bot_chat_messages")
      .insert({ thread_id: thread.id, owner_id: data.deviceId, role: "assistant", content: reply });
    if (outErr) throw new Error(outErr.message);

    const update: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
    if (thread.title === "New chat") update.title = data.text.slice(0, 40);
    await db.from("bot_chat_threads").update(update).eq("id", thread.id);

    return { reply };
  });
