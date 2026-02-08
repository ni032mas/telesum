export interface AppConfig {
  TG_API_ID: string;
  TG_API_HASH: string;
  SOURCE_CHAT: string;
  TG_BOT_TOKEN: string;
  DEST_USER_ID: string;
  DEST_CHAT: string;
  HOURS_BACK: string;
  LLM_CLI: string;
  LLM_MODEL: string;
  TG_SESSION: string;
}

export interface MaskedConfig extends Omit<AppConfig, "TG_API_HASH" | "TG_BOT_TOKEN" | "TG_SESSION"> {
  TG_API_HASH: string;
  TG_BOT_TOKEN: string;
  TG_SESSION: string;
}

export interface Summary {
  id: number;
  chat_id: string;
  chat_title: string;
  content: string;
  message_count: number;
  hours_back: number;
  llm_cli: string;
  llm_model: string;
  created_at: string;
}

export interface ChatInfo {
  id: string;
  title: string;
  type: string;
  participants_count?: number;
}

export interface SummarizeProgress {
  type: "start" | "collecting" | "summarizing" | "sending" | "done" | "error";
  chat_id?: string;
  chat_title?: string;
  message?: string;
  current?: number;
  total?: number;
}
