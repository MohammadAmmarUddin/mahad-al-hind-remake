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
const requireAuth = require("../Middleware/requireAuth");

// ─── PUBLIC ────────────────────────────────────────────────
router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.get("/", getAudios);
router.get("/:id", getAudioById);
router.patch("/:id/play", incrementPlayCount);

// ─── ADMIN ─────────────────────────────────────────────────
router.post("/categories", requireAuth, createCategory);
router.put("/categories/:id", requireAuth, updateCategory);
router.delete("/categories/:id", requireAuth, deleteCategory);
router.post("/", requireAuth, createAudio);
router.put("/:id", requireAuth, updateAudio);
router.delete("/:id", requireAuth, deleteAudio);
router.patch("/bulk-reorder", requireAuth, bulkReorder);

module.exports = router;
