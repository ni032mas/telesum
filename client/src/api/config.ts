import { apiFetch } from "./client";

export interface MaskedConfig {
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

export function getConfig(): Promise<MaskedConfig> {
  return apiFetch<MaskedConfig>("/config");
}

export function updateConfig(
  updates: Partial<MaskedConfig>
): Promise<MaskedConfig> {
  return apiFetch<MaskedConfig>("/config", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export interface PromptData {
  prompt: string;
  defaultPrompt: string;
}

export function getPrompt(): Promise<PromptData> {
  return apiFetch<PromptData>("/config/prompt");
}

export function updatePrompt(prompt: string): Promise<PromptData> {
  return apiFetch<PromptData>("/config/prompt", {
    method: "PUT",
    body: JSON.stringify({ prompt }),
  });
}
