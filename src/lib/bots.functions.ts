import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const PROJECT_ID = "3b96688c-2ace-4b9b-af85-a07e05045582";

const deviceId = z.string().uuid();

function publicBaseUrl(): string {
  const request = getRequest();
  const host = request ? new URL(request.url).host : "";
  if (host && !host.includes("localhost") && !host.includes("id-preview--")) {
    return `https://${host}`;
  }
  return `https://project--${PROJECT_ID}-dev.lovable.app`;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Every bot saved in this browser's workspace. */
export const listBots = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ deviceId }).parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: bots, error } = await db
      .from("bots")
      .select("id, name, status, telegram_username, spec, created_at, last_activity_at")
      .eq("owner_id", data.deviceId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return bots ?? [];
  });

/** One bot with its commands and recent messages. */
export const getBot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ deviceId, botId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: bot } = await db
      .from("bots")
      .select(
        "id, name, status, prompt, spec, telegram_username, token_hint, created_at, last_activity_at",
      )
      .eq("id", data.botId)
      .eq("owner_id", data.deviceId)
      .maybeSingle();
    if (!bot) return null;

    const [{ data: commands }, { data: messages }] = await Promise.all([
      db
        .from("bot_commands")
        .select("id, command, description, reply, use_ai")
        .eq("bot_id", bot.id)
        .order("position"),
      db
        .from("bot_messages")
        .select("id, direction, text, telegram_user, created_at")
        .eq("bot_id", bot.id)
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    return { bot, commands: commands ?? [], messages: messages ?? [] };
  });

/** All bot templates. */
export const listTemplates = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db
    .from("templates")
    .select("slug, name, category, description, starter_prompt")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

/** Save assistant output as a reusable template that shows up on the templates page. */
export const saveTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(2).max(80),
        starterPrompt: z.string().min(10).max(12000),
        category: z.string().min(2).max(40).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const base =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "assistant-bot";
    const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const firstLine =
      data.starterPrompt
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l && !l.startsWith("```") && !l.startsWith("#")) ?? data.starterPrompt;

    const { error } = await db.from("templates").insert({
      slug,
      name: data.name.trim(),
      category: data.category?.trim() || "From assistant",
      description: firstLine.slice(0, 220),
      starter_prompt: data.starterPrompt,
    });
    if (error) throw new Error(error.message);
    return { slug };
  });

/** Generate a bot specification from a plain-language description. */
export const generateBot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        deviceId,
        prompt: z.string().min(10).max(12000),
        templateSlug: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { generateBotSpec } = await import("@/lib/aiBot.server");
    const db = await admin();
    const spec = await generateBotSpec(data.prompt);

    const { data: bot, error } = await db
      .from("bots")
      .insert({
        owner_id: data.deviceId,
        name: spec.name,
        prompt: data.prompt,
        spec,
        status: "draft",
        template_slug: data.templateSlug ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const rows = spec.commands.map((c, i) => ({
      bot_id: bot.id,
      owner_id: data.deviceId,
      command: c.command.startsWith("/") ? c.command : `/${c.command}`,
      description: c.description,
      reply: c.reply,
      use_ai: c.useAi,
      position: i,
    }));
    if (rows.length) {
      const { error: cmdError } = await db.from("bot_commands").insert(rows);
      if (cmdError) throw new Error(cmdError.message);
    }

    return { botId: bot.id as string, spec };
  });

/** Verify a BotFather token, store it encrypted and remember the bot username. */
export const connectToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ deviceId, botId: z.string().uuid(), token: z.string().min(20) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { getMe } = await import("@/lib/telegram.server");
    const { encryptToken } = await import("@/lib/botCrypto.server");
    const db = await admin();

    const info = await getMe(data.token.trim());
    const { error } = await db
      .from("bots")
      .update({
        token_cipher: encryptToken(data.token.trim()),
        token_hint: `…${data.token.trim().slice(-4)}`,
        telegram_username: info.username,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.botId)
      .eq("owner_id", data.deviceId);
    if (error) throw new Error(error.message);

    return { username: info.username };
  });

/** Turn a bot on (register the Telegram webhook) or off. */
export const setBotLive = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ deviceId, botId: z.string().uuid(), live: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { decryptToken, webhookSecretForBot } = await import("@/lib/botCrypto.server");
    const telegram = await import("@/lib/telegram.server");
    const db = await admin();

    const { data: bot, error } = await db
      .from("bots")
      .select("id, token_cipher")
      .eq("id", data.botId)
      .eq("owner_id", data.deviceId)
      .single();
    if (error || !bot) throw new Error("Bot not found");
    if (!bot.token_cipher) throw new Error("Connect your BotFather token first.");

    const token = decryptToken(bot.token_cipher);

    if (data.live) {
      await telegram.setWebhook(
        token,
        `${publicBaseUrl()}/api/public/telegram/webhook/${bot.id}`,
        webhookSecretForBot(bot.id),
      );
      const { data: cmds } = await db
        .from("bot_commands")
        .select("command, description")
        .eq("bot_id", bot.id)
        .order("position");
      const list = (cmds ?? [])
        .map((c) => ({
          command: c.command.replace(/^\//, ""),
          description: c.description || "…",
        }))
        .filter((c) => /^[a-z0-9_]{1,32}$/.test(c.command));
      if (list.length) await telegram.setMyCommands(token, list);
    } else {
      await telegram.deleteWebhook(token);
    }

    await db
      .from("bots")
      .update({ status: data.live ? "live" : "paused", updated_at: new Date().toISOString() })
      .eq("id", bot.id)
      .eq("owner_id", data.deviceId);

    return { status: data.live ? "live" : "paused" };
  });
