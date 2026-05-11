const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const { uploadSingle } = require("../Middleware/uploadMiddleware");
const {
  deleteMedia,
  getAdminMedia,
  getPublicMedia,
  updateMedia,
  uploadMedia,
} = require("../Controllers/mediaController");

const router = express.Router();

router.get("/public", getPublicMedia);
router.get("/admin", requireAuth, getAdminMedia);
router.post("/upload", uploadSingle, uploadMedia);
router.put("/:id", requireAuth, updateMedia);
router.delete("/:id", requireAuth, deleteMedia);

module.exports = router;
