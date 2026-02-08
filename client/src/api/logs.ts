import { apiFetch } from "./client";

export async function getLogs(lines = 200): Promise<{ lines: string[] }> {
  return apiFetch(`/logs?lines=${lines}`);
}
