import { apiFetch } from "./client";

export function startSummarization(): Promise<{ started: boolean }> {
  return apiFetch<{ started: boolean }>("/summarize", { method: "POST" });
}
