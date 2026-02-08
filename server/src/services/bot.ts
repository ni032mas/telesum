import TelegramBot from "node-telegram-bot-api";
import { readConfig } from "./config";

let bot: TelegramBot | null = null;

export function initBot(): TelegramBot | null {
  const config = readConfig();
  if (!config.TG_BOT_TOKEN) return null;
  bot = new TelegramBot(config.TG_BOT_TOKEN);
  return bot;
}

export async function sendSummaryViaBot(userId: string, text: string): Promise<void> {
  const config = readConfig();
  if (!config.TG_BOT_TOKEN || !userId) {
    throw new Error("Bot token and user ID required for bot mode");
  }
  if (!bot) initBot();
  if (!bot) throw new Error("Failed to initialize bot");

  // Split long messages (Telegram limit: 4096 chars)
  const MAX_LEN = 4096;
  const parts: string[] = [];
  for (let i = 0; i < text.length; i += MAX_LEN) {
    parts.push(text.substring(i, i + MAX_LEN));
  }

  for (const part of parts) {
    await bot.sendMessage(userId, part, { parse_mode: "Markdown" });
  }
}
