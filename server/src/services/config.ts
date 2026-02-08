import fs from "fs";
import path from "path";
import type { AppConfig, MaskedConfig } from "../types";

const ENV_PATH = path.join(__dirname, "../../../.env");

const CONFIG_KEYS: (keyof AppConfig)[] = [
  "TG_API_ID", "TG_API_HASH", "SOURCE_CHAT", "TG_BOT_TOKEN",
  "DEST_USER_ID", "DEST_CHAT", "HOURS_BACK", "LLM_CLI", "LLM_MODEL", "TG_SESSION",
];

const SECRET_KEYS: (keyof AppConfig)[] = ["TG_API_HASH", "TG_BOT_TOKEN", "TG_SESSION"];

function parseEnvFile(): { lines: string[]; values: Record<string, string> } {
  if (!fs.existsSync(ENV_PATH)) {
    return { lines: [], values: {} };
  }
  const content = fs.readFileSync(ENV_PATH, "utf-8");
  const lines = content.split("\n");
  const values: Record<string, string> = {};
  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      values[match[1]] = match[2];
    }
  }
  return { lines, values };
}

export function readConfig(): AppConfig {
  const { values } = parseEnvFile();
  const config = {} as AppConfig;
  for (const key of CONFIG_KEYS) {
    config[key] = values[key] || "";
  }
  return config;
}

export function writeConfig(updates: Partial<AppConfig>): void {
  const { lines } = parseEnvFile();
  const updatedKeys = new Set<string>();

  // Update existing lines
  const newLines = lines.map((line) => {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && match[1] in updates) {
      updatedKeys.add(match[1]);
      return `${match[1]}=${updates[match[1] as keyof AppConfig]}`;
    }
    return line;
  });

  // Add new keys
  for (const [key, value] of Object.entries(updates)) {
    if (!updatedKeys.has(key)) {
      newLines.push(`${key}=${value}`);
    }
  }

  fs.writeFileSync(ENV_PATH, newLines.join("\n"));

  // Reload into process.env
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
}

export function maskSecrets(config: AppConfig): MaskedConfig {
  const masked = { ...config } as MaskedConfig;
  for (const key of SECRET_KEYS) {
    const val = config[key];
    if (val && val.length > 4) {
      (masked as unknown as Record<string, string>)[key] = val.substring(0, 4) + "***";
    }
  }
  return masked;
}
