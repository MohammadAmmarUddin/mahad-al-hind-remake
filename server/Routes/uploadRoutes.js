const express = require("express");
const router = express.Router();
const {
  upload,
  uploadMultiple,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  listImages,
} = require("../Controllers/uploadController");

/**
 * POST /api/upload/image
 * Upload single image
 * Content-Type: multipart/form-data
 * Field name: "image"
 */
router.post("/image", upload.single("image"), uploadImage);

/**
 * POST /api/upload/images
 * Upload multiple images (max 10)
 * Content-Type: multipart/form-data
 * Field name: "images"
 */
router.post("/images", uploadMultiple, uploadMultipleImages);

/**
 * GET /api/upload/images
 * List uploaded images
 */
router.get("/images", listImages);

/**
 * DELETE /api/upload/image/:filename
 * Delete uploaded image
 */
router.delete("/image/:filename", deleteImage);

module.exports = router;
