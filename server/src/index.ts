import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import configRouter from "./routes/config";
import authRouter from "./routes/auth";
import summarizeRouter from "./routes/summarize";
import chatsRouter from "./routes/chats";
import summariesRouter from "./routes/summaries";
import logsRouter from "./routes/logs";
import { initClient } from "./services/telegram";
import { initDatabase } from "./services/database";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./services/logger";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/config", configRouter);
app.use("/api/auth", authRouter);
app.use("/api/summarize", summarizeRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/summaries", summariesRouter);
app.use("/api/logs", logsRouter);

// Error handler for API routes
app.use(errorHandler);

// Serve static files in production
const clientDist = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

initDatabase();

app.listen(PORT, () => {
  logger.info("Server", `Running on http://localhost:${PORT}`);
  initClient().catch((err) =>
    logger.warn("Telegram", `Client not ready: ${err.message}`)
  );
});

export default app;
