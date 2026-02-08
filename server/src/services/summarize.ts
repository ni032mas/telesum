import { EventEmitter } from "events";
import { readConfig } from "./config";
import { getSourceChats, readMessages, sendMessageToChat, isAuthenticated } from "./telegram";
import { summarize as llmSummarize } from "./llm";
import { insertSummary } from "./database";
import { sendSummaryViaBot } from "./bot";
import { logger } from "./logger";
import type { SummarizeProgress } from "../types";

export const progressEmitter = new EventEmitter();
let isRunning = false;

function emit(event: SummarizeProgress) {
  progressEmitter.emit("progress", event);
}

export function getIsRunning(): boolean {
  return isRunning;
}

export async function runSummarization(): Promise<void> {
  if (isRunning) {
    throw new Error("Summarization is already running");
  }

  const authed = await isAuthenticated();
  if (!authed) {
    throw new Error("Telegram is not authenticated. Please authenticate first.");
  }

  isRunning = true;
  const config = readConfig();
  const hoursBack = parseInt(config.HOURS_BACK) || 24;

  try {
    const chats = await getSourceChats();
    if (chats.length === 0) {
      throw new Error("No source chats configured");
    }

    emit({ type: "start", message: `Starting summarization for ${chats.length} chat(s)`, total: chats.length });

    for (let i = 0; i < chats.length; i++) {
      const chat = chats[i];

      // Collect messages
      emit({
        type: "collecting",
        chat_id: chat.id,
        chat_title: chat.title,
        message: `Collecting messages from ${chat.title}...`,
        current: i + 1,
        total: chats.length,
      });

      const { text, count } = await readMessages(chat.id, hoursBack);
      if (count === 0) {
        emit({
          type: "done",
          chat_id: chat.id,
          chat_title: chat.title,
          message: `No messages found in ${chat.title} for the last ${hoursBack} hours`,
          current: i + 1,
          total: chats.length,
        });
        continue;
      }

      // Summarize
      emit({
        type: "summarizing",
        chat_id: chat.id,
        chat_title: chat.title,
        message: `Summarizing ${count} messages from ${chat.title}...`,
        current: i + 1,
        total: chats.length,
      });

      const summary = await llmSummarize(text, hoursBack);

      // Store in DB
      insertSummary({
        chat_id: chat.id,
        chat_title: chat.title,
        content: summary,
        message_count: count,
        hours_back: hoursBack,
        llm_cli: config.LLM_CLI || "claude",
        llm_model: config.LLM_MODEL || "sonnet",
      });

      // Send via bot if configured
      if (config.TG_BOT_TOKEN && config.DEST_USER_ID) {
        emit({
          type: "sending",
          chat_id: chat.id,
          chat_title: chat.title,
          message: `Sending summary via bot...`,
          current: i + 1,
          total: chats.length,
        });
        try {
          await sendSummaryViaBot(config.DEST_USER_ID, `**${chat.title}**\n\n${summary}`);
        } catch (err: any) {
          logger.error("Bot", `Failed to send: ${err.message}`);
        }
      }

      // Send via userbot to DEST_CHAT if configured
      if (config.DEST_CHAT) {
        const destChats = config.DEST_CHAT.split(",").map((s) => s.trim());
        for (const destChat of destChats) {
          try {
            await sendMessageToChat(destChat, `**${chat.title}**\n\n${summary}`);
          } catch (err: any) {
            logger.error("Userbot", `Failed to send to ${destChat}: ${err.message}`);
          }
        }
      }

      emit({
        type: "done",
        chat_id: chat.id,
        chat_title: chat.title,
        message: `Completed ${chat.title}: ${count} messages summarized`,
        current: i + 1,
        total: chats.length,
      });
    }
  } catch (err: any) {
    emit({ type: "error", message: err.message });
    throw err;
  } finally {
    isRunning = false;
  }
}
