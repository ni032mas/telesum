import { Router } from "express";
import { getSourceChats, isAuthenticated } from "../services/telegram";

const router = Router();

// GET /api/chats — list source chats with metadata
router.get("/", async (_req, res, next) => {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const chats = await getSourceChats();
    res.json(chats);
  } catch (err) {
    next(err);
  }
});

export default router;
