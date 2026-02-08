import { Router } from "express";
import {
  initClient,
  sendAuthCode,
  verifyAuthCode,
  verifyPassword,
  getAuthStatus,
  isAuthenticated,
} from "../services/telegram";

const router = Router();

// GET /api/auth/status
router.get("/status", async (_req, res, next) => {
  try {
    const status = await getAuthStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/send-code
router.post("/send-code", async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    const phoneCodeHash = await sendAuthCode(phone);
    res.json({ success: true, phoneCodeHash });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify-code
router.post("/verify-code", async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }
    await verifyAuthCode(code);
    res.json({ success: true, authenticated: true });
  } catch (err: any) {
    if (err.message === "PASSWORD_REQUIRED") {
      return res.json({ success: false, passwordRequired: true });
    }
    next(err);
  }
});

// POST /api/auth/verify-password
router.post("/verify-password", async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    await verifyPassword(password);
    res.json({ success: true, authenticated: true });
  } catch (err) {
    next(err);
  }
});

export default router;
