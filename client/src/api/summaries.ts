import { apiFetch } from "./client";

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

export interface SummariesResponse {
  summaries: Summary[];
  total: number;
}

export function getSummaries(
  limit = 50,
  offset = 0
): Promise<SummariesResponse> {
  return apiFetch<SummariesResponse>(
    `/summaries?limit=${limit}&offset=${offset}`
  );
}

export function getSummary(id: number): Promise<Summary> {
  return apiFetch<Summary>(`/summaries/${id}`);
}

export function deleteSummary(id: number): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(`/summaries/${id}`, {
    method: "DELETE",
  });
}
