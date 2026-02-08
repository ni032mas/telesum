import { Router } from "express";
import { getSummaries, getSummaryById, deleteSummary } from "../services/database";

const router = Router();

// GET /api/summaries — list summaries with pagination
router.get("/", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  const result = getSummaries(limit, offset);
  res.json(result);
});

// GET /api/summaries/:id — get single summary
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const summary = getSummaryById(id);
  if (!summary) {
    return res.status(404).json({ error: "Summary not found" });
  }
  res.json(summary);
});

// DELETE /api/summaries/:id — delete summary
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const deleted = deleteSummary(id);
  if (!deleted) {
    return res.status(404).json({ error: "Summary not found" });
  }
  res.json({ deleted: true });
});

export default router;
