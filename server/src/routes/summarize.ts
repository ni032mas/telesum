import { Router } from "express";
import { runSummarization, progressEmitter, getIsRunning } from "../services/summarize";

const router = Router();

// POST /api/summarize — start summarization
router.post("/", async (_req, res, next) => {
  try {
    if (getIsRunning()) {
      return res.status(409).json({ error: "Summarization already in progress" });
    }
    // Start async, don't await
    runSummarization().catch((err) => {
      console.error("[Summarize]", err.message);
    });
    res.json({ started: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/summarize/status — SSE endpoint for progress
router.get("/status", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Send current status
  res.write(`data: ${JSON.stringify({ type: "connected", running: getIsRunning() })}\n\n`);

  const handler = (event: any) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  progressEmitter.on("progress", handler);

  req.on("close", () => {
    progressEmitter.off("progress", handler);
  });
});

export default router;
