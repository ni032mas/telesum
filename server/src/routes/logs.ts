import { Router } from "express";
import fs from "fs";
import { getLogPath } from "../services/logger";

const router = Router();

// GET /api/logs?lines=200
router.get("/", (_req, res) => {
  const maxLines = Math.min(parseInt(String(_req.query.lines)) || 200, 1000);
  const logPath = getLogPath();

  if (!fs.existsSync(logPath)) {
    return res.json({ lines: [] });
  }

  try {
    const content = fs.readFileSync(logPath, "utf-8");
    const allLines = content.split("\n").filter(Boolean);
    const lines = allLines.slice(-maxLines);
    res.json({ lines });
  } catch {
    res.json({ lines: [] });
  }
});

export default router;
