import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "../../../data");
const LOG_PATH = path.join(DATA_DIR, "telesum.log");
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5 MB

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Truncate log file if it exceeds max size
function truncateIfNeeded() {
  try {
    if (!fs.existsSync(LOG_PATH)) return;
    const stat = fs.statSync(LOG_PATH);
    if (stat.size > MAX_LOG_SIZE) {
      const content = fs.readFileSync(LOG_PATH, "utf-8");
      const lines = content.split("\n");
      // Keep last half of lines
      const trimmed = lines.slice(Math.floor(lines.length / 2)).join("\n");
      fs.writeFileSync(LOG_PATH, trimmed, "utf-8");
    }
  } catch {
    // Ignore truncation errors
  }
}

ensureDataDir();
truncateIfNeeded();

function formatMessage(level: string, tag: string, message: string): string {
  const ts = new Date().toISOString();
  return `${ts} [${level}] [${tag}] ${message}`;
}

function write(level: string, tag: string, message: string) {
  const line = formatMessage(level, tag, message);
  if (level === "ERROR" || level === "WARN") {
    console.error(line);
  } else {
    console.log(line);
  }
  try {
    fs.appendFileSync(LOG_PATH, line + "\n", "utf-8");
  } catch {
    // Ignore file write errors
  }
}

export const logger = {
  info: (tag: string, message: string) => write("INFO", tag, message),
  warn: (tag: string, message: string) => write("WARN", tag, message),
  error: (tag: string, message: string) => write("ERROR", tag, message),
};

export function getLogPath(): string {
  return LOG_PATH;
}
