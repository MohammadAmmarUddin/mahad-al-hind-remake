const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const { uploadSingle } = require("../Middleware/uploadMiddleware");
const {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadGalleryImage,
  getSingleGalleryItem,
  requireAdmin,
} = require("../Controllers/galleryController");

// Legacy router — mounted at /api/galleries
const legacyRouter = express.Router();

legacyRouter.get("/:galleryType", getGalleryItems);
legacyRouter.post("/:galleryType", requireAuth, requireAdmin, uploadSingle, createGalleryItem);
legacyRouter.patch("/:galleryType/:id", requireAuth, requireAdmin, uploadSingle, updateGalleryItem);
legacyRouter.delete("/:galleryType/:id", requireAuth, requireAdmin, deleteGalleryItem);

// Unified router — mounted at /api/gallery
const unifiedRouter = express.Router();

unifiedRouter.get("/", getGalleryItems);
unifiedRouter.get("/:id", getSingleGalleryItem);
unifiedRouter.post("/upload", requireAuth, requireAdmin, uploadSingle, uploadGalleryImage);
unifiedRouter.put("/:id", requireAuth, requireAdmin, uploadSingle, updateGalleryItem);
unifiedRouter.delete("/:id", requireAuth, requireAdmin, deleteGalleryItem);

module.exports = { legacyRouter, unifiedRouter };
