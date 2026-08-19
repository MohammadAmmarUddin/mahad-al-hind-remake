const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const {
  getNoticeById,
  getPublicNotices,
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../Controllers/noticeController");

const router = express.Router();

router.get("/public", getPublicNotices);
router.get("/", requireAuth, getAllNotices);
router.get("/:id", requireAuth, getNoticeById);
router.post("/", requireAuth, createNotice);
router.put("/:id", requireAuth, updateNotice);
router.delete("/:id", requireAuth, deleteNotice);

module.exports = router;
