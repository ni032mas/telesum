import { apiFetch } from "./client";

export interface ChatInfo {
  id: string;
  title: string;
  type: string;
  participants_count?: number;
}

export function getChats(): Promise<ChatInfo[]> {
  return apiFetch<ChatInfo[]>("/chats");
}
