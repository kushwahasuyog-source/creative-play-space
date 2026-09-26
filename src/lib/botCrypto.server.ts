import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function encKey(): Buffer {
  const raw = process.env["BOT_TOKEN_ENC_KEY"];
  if (!raw) throw new Error("BOT_TOKEN_ENC_KEY is not set");
  return createHash("sha256").update(raw).digest();
}

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString("base64");
}

export function decryptToken(stored: string): string {
  const buf = Buffer.from(stored, "base64");
  const decipher = createDecipheriv("aes-256-gcm", encKey(), buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
}

export function webhookSecretForBot(botId: string): string {
  const raw = process.env["BOT_WEBHOOK_SECRET"];
  if (!raw) throw new Error("BOT_WEBHOOK_SECRET is not set");
  return createHash("sha256").update(`${raw}:${botId}`).digest("base64url");
}
