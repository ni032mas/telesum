import { Router } from "express";
import fs from "fs";
import path from "path";
import { readConfig, writeConfig, maskSecrets } from "../services/config";
import type { AppConfig } from "../types";

const router = Router();

const PROMPT_PATH = path.join(__dirname, "../../../prompt.md");

const DEFAULT_PROMPT = `Below are Telegram chat messages from the last {hours} hours.

{messages}

---

Produce a structured summary in Russian. Follow this format:

## Основные темы
- List the main topics discussed

## Ключевые сообщения
- Highlight the most important messages and decisions

## Активные участники
- List the most active participants

## Итог
A brief overall summary of what happened in the chat.

Keep the summary concise but informative. Focus on actionable items and decisions.`;

// GET /api/config — return current config with masked secrets
router.get("/", (_req, res) => {
  const config = readConfig();
  res.json(maskSecrets(config));
});

// PUT /api/config — update config values
router.put("/", (req, res) => {
  const updates: Partial<AppConfig> = req.body;
  writeConfig(updates);
  const config = readConfig();
  res.json(maskSecrets(config));
});

// GET /api/config/prompt — return current prompt and default
router.get("/prompt", (_req, res) => {
  let prompt = DEFAULT_PROMPT;
  try {
    if (fs.existsSync(PROMPT_PATH)) {
      prompt = fs.readFileSync(PROMPT_PATH, "utf-8");
    }
  } catch {}
  res.json({ prompt, defaultPrompt: DEFAULT_PROMPT });
});

// PUT /api/config/prompt — update prompt.md
router.put("/prompt", (req, res) => {
  const { prompt } = req.body;
  if (typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt field is required" });
  }
  fs.writeFileSync(PROMPT_PATH, prompt, "utf-8");
  res.json({ prompt, defaultPrompt: DEFAULT_PROMPT });
});

export default router;
