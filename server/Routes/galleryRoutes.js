const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadGalleryImage,
  getSingleGalleryItem,
  requireAdmin,
  getUploadSignature,
} = require("../Controllers/galleryController");

// Legacy router — mounted at /api/galleries (direct-upload only, no file handling)
const legacyRouter = express.Router();

legacyRouter.get("/:galleryType", getGalleryItems);
legacyRouter.post("/:galleryType", requireAuth, requireAdmin, createGalleryItem);
legacyRouter.patch("/:galleryType/:id", requireAuth, requireAdmin, updateGalleryItem);
legacyRouter.delete("/:galleryType/:id", requireAuth, requireAdmin, deleteGalleryItem);

// Unified router — mounted at /api/gallery
const unifiedRouter = express.Router();

unifiedRouter.get("/", getGalleryItems);
unifiedRouter.get("/:id", getSingleGalleryItem);
unifiedRouter.post("/", requireAuth, requireAdmin, createGalleryItem);
unifiedRouter.post("/upload", requireAuth, requireAdmin, uploadGalleryImage);
unifiedRouter.put("/:id", requireAuth, requireAdmin, updateGalleryItem);
unifiedRouter.delete("/:id", requireAuth, requireAdmin, deleteGalleryItem);
unifiedRouter.post("/upload-signature", requireAuth, requireAdmin, getUploadSignature);

module.exports = { legacyRouter, unifiedRouter };
