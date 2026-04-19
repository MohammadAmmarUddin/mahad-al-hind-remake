const mongoose = require("mongoose");
const GalleryItem = require("../Models/galleryItemModel");

const allowedGalleryTypes = ["student", "faregin"];

const normalizeGalleryType = (galleryType) =>
  allowedGalleryTypes.includes(galleryType) ? galleryType : null;

const normalizeImageUrl = (value = "") => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/uploads/")) {
      return parsed.pathname;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
};

const getGalleryItems = async (req, res) => {
  try {
    const galleryType = normalizeGalleryType(req.params.galleryType);

    if (!galleryType) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery type",
      });
    }

    const filter = { galleryType };

    if (req.query.admin !== "true") {
      filter.isVisible = true;
    }

    const items = await GalleryItem.find(filter).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load gallery items",
      error: error.message,
    });
  }
};

const createGalleryItem = async (req, res) => {
  try {
    const galleryType = normalizeGalleryType(req.params.galleryType);

    if (!galleryType) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery type",
      });
    }

    const { name = "", imageUrl, sortOrder = 0, isVisible = true } = req.body;
    const normalizedImageUrl = normalizeImageUrl(imageUrl);

    if (!normalizedImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const item = await GalleryItem.create({
      galleryType,
      name: name.trim(),
      imageUrl: normalizedImageUrl,
      sortOrder: Number(sortOrder) || 0,
      isVisible: Boolean(isVisible),
    });

    res.status(201).json({
      success: true,
      message: "Gallery item created successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create gallery item",
      error: error.message,
    });
  }
};

const updateGalleryItem = async (req, res) => {
  try {
    const galleryType = normalizeGalleryType(req.params.galleryType);
    const { id } = req.params;

    if (!galleryType) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery type",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item id",
      });
    }

    const update = {};

    if (typeof req.body.name === "string") {
      update.name = req.body.name.trim();
    }

    if (typeof req.body.imageUrl === "string") {
      update.imageUrl = normalizeImageUrl(req.body.imageUrl);
    }

    if (typeof req.body.sortOrder !== "undefined") {
      update.sortOrder = Number(req.body.sortOrder) || 0;
    }

    if (typeof req.body.isVisible !== "undefined") {
      update.isVisible = Boolean(req.body.isVisible);
    }

    const item = await GalleryItem.findOneAndUpdate(
      { _id: id, galleryType },
      update,
      { new: true },
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery item updated successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update gallery item",
      error: error.message,
    });
  }
};

const deleteGalleryItem = async (req, res) => {
  try {
    const galleryType = normalizeGalleryType(req.params.galleryType);
    const { id } = req.params;

    if (!galleryType) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery type",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item id",
      });
    }

    const item = await GalleryItem.findOneAndDelete({ _id: id, galleryType });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete gallery item",
      error: error.message,
    });
  }
};

module.exports = {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
};
