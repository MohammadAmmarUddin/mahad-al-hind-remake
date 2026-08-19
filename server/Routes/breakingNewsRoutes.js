const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/requireAuth");
const {
  getPublicBreakingNews,
  getAllBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  deleteBreakingNews,
} = require("../Controllers/breakingNewsController");

router.get("/public", getPublicBreakingNews);
router.get("/", requireAuth, getAllBreakingNews);
router.post("/", requireAuth, createBreakingNews);
router.put("/:id", requireAuth, updateBreakingNews);
router.delete("/:id", requireAuth, deleteBreakingNews);

module.exports = router;
