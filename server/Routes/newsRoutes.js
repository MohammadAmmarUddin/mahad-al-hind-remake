const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const {
  getNewsById,
  getPublicNews,
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
} = require("../Controllers/newsController");

const router = express.Router();

router.get("/public", getPublicNews);
router.get("/", requireAuth, getAllNews);
router.get("/:id", getNewsById);
router.post("/", requireAuth, createNews);
router.put("/:id", requireAuth, updateNews);
router.delete("/:id", requireAuth, deleteNews);

module.exports = router;
