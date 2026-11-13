const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAudios,
  getAudioById,
  createAudio,
  updateAudio,
  deleteAudio,
  incrementPlayCount,
  bulkReorder,
} = require("../Controllers/audioController");
const { requireAuth, requireAdmin } = require("../Middleware/authMiddleware");

// ─── PUBLIC ────────────────────────────────────────────────
router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.get("/", getAudios);
router.get("/:id", getAudioById);
router.patch("/:id/play", incrementPlayCount);

// ─── ADMIN ─────────────────────────────────────────────────
router.post("/categories", requireAuth, requireAdmin, createCategory);
router.put("/categories/:id", requireAuth, requireAdmin, updateCategory);
router.delete("/categories/:id", requireAuth, requireAdmin, deleteCategory);
router.post("/", requireAuth, requireAdmin, createAudio);
router.put("/:id", requireAuth, requireAdmin, updateAudio);
router.delete("/:id", requireAuth, requireAdmin, deleteAudio);
router.patch("/bulk-reorder", requireAuth, requireAdmin, bulkReorder);

module.exports = router;
