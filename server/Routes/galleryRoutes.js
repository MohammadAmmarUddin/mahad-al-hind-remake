const express = require("express");
const {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require("../Controllers/galleryController");

const router = express.Router();

router.get("/:galleryType", getGalleryItems);
router.post("/:galleryType", createGalleryItem);
router.patch("/:galleryType/:id", updateGalleryItem);
router.delete("/:galleryType/:id", deleteGalleryItem);

module.exports = router;
