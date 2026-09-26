const API = "https://api.telegram.org";

async function call<T>(token: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const payload = (await res.json().catch(() => null)) as
    | { ok?: boolean; result?: T; description?: string }
    | null;
  if (!res.ok || !payload?.ok) {
    throw new Error(payload?.description ?? `Telegram ${method} failed (${res.status})`);
  }
  return payload.result as T;
}

export interface TelegramBotInfo {
  id: number;
  username: string;
  first_name: string;
}

export function getMe(token: string) {
  return call<TelegramBotInfo>(token, "getMe");
}

export function sendMessage(token: string, chatId: number, text: string) {
  return call(token, "sendMessage", { chat_id: chatId, text });
}

export function setWebhook(token: string, url: string, secret: string) {
  return call(token, "setWebhook", {
    url,
    secret_token: secret,
    allowed_updates: ["message", "edited_message"],
    drop_pending_updates: true,
  });
}

export function deleteWebhook(token: string) {
  return call(token, "deleteWebhook", { drop_pending_updates: true });
}

export function setMyCommands(
  token: string,
  commands: { command: string; description: string }[],
) {
  return call(token, "setMyCommands", { commands });
}
