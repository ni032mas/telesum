import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { Summary } from "../types";

const DATA_DIR = path.join(__dirname, "../../../data");
const DB_PATH = path.join(DATA_DIR, "telesum.db");

let db: Database.Database;

export function initDatabase(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id TEXT NOT NULL,
      chat_title TEXT NOT NULL,
      content TEXT NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 0,
      hours_back INTEGER NOT NULL DEFAULT 24,
      llm_cli TEXT NOT NULL DEFAULT 'claude',
      llm_model TEXT NOT NULL DEFAULT 'sonnet',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export function insertSummary(data: Omit<Summary, "id" | "created_at">): Summary {
  const stmt = db.prepare(`
    INSERT INTO summaries (chat_id, chat_title, content, message_count, hours_back, llm_cli, llm_model)
    VALUES (@chat_id, @chat_title, @content, @message_count, @hours_back, @llm_cli, @llm_model)
  `);
  const result = stmt.run(data);
  return getSummaryById(Number(result.lastInsertRowid))!;
}

export function getSummaries(limit = 50, offset = 0): { summaries: Summary[]; total: number } {
  const total = db.prepare("SELECT COUNT(*) as count FROM summaries").get() as { count: number };
  const summaries = db.prepare(
    "SELECT * FROM summaries ORDER BY created_at DESC LIMIT ? OFFSET ?"
  ).all(limit, offset) as Summary[];
  return { summaries, total: total.count };
}

export function getSummaryById(id: number): Summary | undefined {
  return db.prepare("SELECT * FROM summaries WHERE id = ?").get(id) as Summary | undefined;
}

export function deleteSummary(id: number): boolean {
  const result = db.prepare("DELETE FROM summaries WHERE id = ?").run(id);
  return result.changes > 0;
}
