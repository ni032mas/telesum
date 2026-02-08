import { writeConfig, readConfig } from "./config";
import type { ChatInfo } from "../types";

// Use require for GramJS to avoid ESM/CJS issues
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

let client: any = null;
let pendingPhone: string = "";
let pendingPhoneCodeHash: string = "";

export async function initClient(): Promise<void> {
  const config = readConfig();
  if (!config.TG_API_ID || !config.TG_API_HASH) {
    throw new Error("TG_API_ID and TG_API_HASH are required");
  }
  const session = new StringSession(config.TG_SESSION || "");
  client = new TelegramClient(session, parseInt(config.TG_API_ID), config.TG_API_HASH, {
    connectionRetries: 3,
  });
  await client.connect();
}

export function getClient(): any {
  if (!client) {
    throw new Error("Telegram client not initialized. Call initClient() first.");
  }
  return client;
}

export async function isAuthenticated(): Promise<boolean> {
  if (!client) return false;
  try {
    return await client.isUserAuthorized();
  } catch {
    return false;
  }
}

export async function sendAuthCode(phone: string): Promise<string> {
  if (!client) await initClient();
  pendingPhone = phone;
  const result = await client.sendCode(
    { apiId: parseInt(readConfig().TG_API_ID), apiHash: readConfig().TG_API_HASH },
    phone
  );
  pendingPhoneCodeHash = result.phoneCodeHash;
  return result.phoneCodeHash;
}

export async function verifyAuthCode(code: string): Promise<void> {
  if (!client || !pendingPhone || !pendingPhoneCodeHash) {
    throw new Error("No pending auth. Call sendAuthCode first.");
  }
  try {
    await client.invoke(
      new (require("telegram/tl/api").Api.auth.SignIn)({
        phoneNumber: pendingPhone,
        phoneCodeHash: pendingPhoneCodeHash,
        phoneCode: code,
      })
    );
    await saveSession();
  } catch (err: any) {
    if (err.errorMessage === "SESSION_PASSWORD_NEEDED") {
      throw new Error("PASSWORD_REQUIRED");
    }
    throw err;
  }
}

export async function verifyPassword(password: string): Promise<void> {
  if (!client) {
    throw new Error("No active client. Start auth flow first.");
  }
  const { computeCheck } = require("telegram/Password");
  const passwordSrpResult = await client.invoke(
    new (require("telegram/tl/api").Api.account.GetPassword)()
  );
  const srpCheck = await computeCheck(passwordSrpResult, password);
  await client.invoke(
    new (require("telegram/tl/api").Api.auth.CheckPassword)({ password: srpCheck })
  );
  await saveSession();
}

async function saveSession(): Promise<void> {
  if (!client) return;
  const sessionString = client.session.save() as string;
  writeConfig({ TG_SESSION: sessionString });
}

export async function getAuthStatus(): Promise<{ authenticated: boolean; phone?: string }> {
  const authed = await isAuthenticated();
  return { authenticated: authed, phone: authed ? pendingPhone || undefined : undefined };
}

export async function getSourceChats(): Promise<ChatInfo[]> {
  const config = readConfig();
  if (!config.SOURCE_CHAT) return [];
  const cl = getClient();
  const chatIds = config.SOURCE_CHAT.split(",").map((s) => s.trim());
  const result: ChatInfo[] = [];

  for (const chatId of chatIds) {
    try {
      const entity = await cl.getEntity(chatId);
      result.push({
        id: chatId,
        title: entity.title || entity.firstName || chatId,
        type: entity.className || "unknown",
        participants_count: entity.participantsCount,
      });
    } catch {
      result.push({ id: chatId, title: chatId, type: "unknown" });
    }
  }
  return result;
}

export async function readMessages(chatId: string, hoursBack: number): Promise<{ text: string; count: number }> {
  const cl = getClient();
  const entity = await cl.getEntity(chatId);
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const messages: string[] = [];
  let count = 0;

  for await (const msg of cl.iterMessages(entity, { limit: 5000 })) {
    if (msg.date && new Date(msg.date * 1000) < since) break;
    if (!msg.text) continue;
    const sender = msg.sender?.firstName || msg.sender?.title || "Unknown";
    const date = new Date(msg.date * 1000).toLocaleString("ru-RU");
    messages.push(`[${date}] ${sender}: ${msg.text}`);
    count++;
  }

  return { text: messages.reverse().join("\n"), count };
}

export async function sendMessageToChat(chatId: string, text: string): Promise<void> {
  const cl = getClient();
  const entity = await cl.getEntity(chatId);
  // Split long messages
  const MAX_LEN = 4096;
  for (let i = 0; i < text.length; i += MAX_LEN) {
    await cl.sendMessage(entity, { message: text.substring(i, i + MAX_LEN) });
  }
}
