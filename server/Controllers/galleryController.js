const crypto = require("crypto");
const mongoose = require("mongoose");
const GalleryItem = require("../Models/galleryItemModel");
const User = require("../Models/userModel");
const {
  destroyCloudinaryAsset,
  isCloudinaryConfigured,
} = require("../Utils/cloudinary");

const allowedGalleryTypes = ["student", "faregin", "general"];

const normalizeGalleryType = (galleryType) =>
  allowedGalleryTypes.includes(galleryType) ? galleryType : null;

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    req.adminUser = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

const getGalleryItems = async (req, res) => {
  try {
    const galleryType =
      req.params.galleryType || req.query.galleryType || null;

    const filter = {};

    if (galleryType) {
      const normalized = normalizeGalleryType(galleryType);
      if (!normalized) {
        return res.status(400).json({
          success: false,
          message: "Invalid gallery type. Use 'student', 'faregin', or 'general'.",
        });
      }
      filter.galleryType = normalized;
    }

    if (req.query.admin !== "true") {
      filter.isVisible = true;
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: "i" };
      filter.$or = [{ name: searchRegex }, { title: searchRegex }];
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      GalleryItem.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GalleryItem.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load gallery items",
      error: error.message,
    });
  }
};

const uploadGalleryImage = async (req, res) => {
  try {
    const galleryType = normalizeGalleryType(
      req.body.galleryType || req.params.galleryType || "general",
    );

    if (!galleryType) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery type.",
      });
    }

    const { imageUrl, publicId, title, sortOrder, isVisible } = req.body;

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required. Upload the file directly to Cloudinary from the browser first.",
      });
    }

    const itemTitle = (title || "").trim();
    const item = await GalleryItem.create({
      galleryType,
      name: itemTitle,
      title: itemTitle,
      imageUrl: imageUrl.trim(),
      publicId: (publicId || "").trim(),
      resourceType: "image",
      sortOrder: parseInt(sortOrder) || 0,
      isVisible: isVisible !== false,
      uploadedBy: req.adminUser?._id || req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Gallery item uploaded successfully",
      data: item.toObject(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload gallery image",
      error: error.message,
    });
  }
};

const createGalleryItem = async (req, res) => {
  try {
    const galleryType = normalizeGalleryType(
      req.params.galleryType || req.body.galleryType || "general",
    );

    if (!galleryType) {
      return res.status(400).json({
        success: false,
        message: "Invalid gallery type",
      });
    }

    const {
      name = "",
      title,
      imageUrl,
      publicId = "",
      resourceType = "image",
      sortOrder = 0,
      isVisible = true,
    } = req.body;
    const normalizedImageUrl = String(imageUrl || "").trim();

    if (!normalizedImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const itemTitle = (title || name || "").trim();
    const item = await GalleryItem.create({
      galleryType,
      name: itemTitle,
      title: itemTitle,
      imageUrl: normalizedImageUrl,
      publicId: typeof publicId === "string" ? publicId.trim() : "",
      resourceType: typeof resourceType === "string" ? resourceType.trim() : "image",
      sortOrder: Number(sortOrder) || 0,
      isVisible: Boolean(isVisible),
      uploadedBy: req.adminUser?._id || req.user?._id,
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item id",
      });
    }

    const existingItem = await GalleryItem.findById(id).lean();
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    const update = {};
    let oldPublicId = null;

    if (typeof req.body.title === "string") {
      const newTitle = req.body.title.trim();
      update.title = newTitle;
      update.name = newTitle;
    }

    if (typeof req.body.name === "string") {
      update.name = req.body.name.trim();
      if (!update.title) update.title = update.name;
    }

    if (typeof req.body.sortOrder !== "undefined") {
      update.sortOrder = Number(req.body.sortOrder) || 0;
    }

    if (typeof req.body.isVisible !== "undefined") {
      update.isVisible = Boolean(req.body.isVisible);
    }

    if (typeof req.body.imageUrl === "string" && req.body.imageUrl.trim()) {
      update.imageUrl = req.body.imageUrl.trim();
      update.publicId = (req.body.publicId || "").trim();
      oldPublicId = existingItem.publicId;
    }

    const item = await GalleryItem.findByIdAndUpdate(id, update, { new: true }).lean();

    if (oldPublicId && oldPublicId !== item.publicId) {
      destroyCloudinaryAsset(oldPublicId, existingItem.resourceType || "image").catch(
        (err) => console.warn("Failed to delete old gallery image:", err.message),
      );
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item id",
      });
    }

    const item = await GalleryItem.findById(id).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    await GalleryItem.findByIdAndDelete(id);

    if (item.publicId) {
      destroyCloudinaryAsset(item.publicId, item.resourceType || "image").catch(
        (err) => console.warn("Failed to delete gallery image from storage:", err.message),
      );
    } else if (item.imageUrl && item.imageUrl.includes("cloudinary")) {
      console.warn("Gallery item has no publicId stored — skipping Cloudinary destroy for:", item._id);
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

const getSingleGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item id",
      });
    }

    const item = await GalleryItem.findById(id).lean();
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get gallery item",
      error: error.message,
    });
  }
};

const getUploadSignature = async (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.cloudinary_cloud_name;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.cloudinary_api_key;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.cloudinary_api_secret;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary is not configured.",
      });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "galleries";
    const params = { folder, timestamp };
    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys.map((k) => `${k}=${params[k]}`).join("&") + apiSecret;
    const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

    res.json({
      success: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate upload signature.",
      error: error.message,
    });
  }
};

module.exports = {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadGalleryImage,
  getSingleGalleryItem,
  requireAdmin,
  getUploadSignature,
};
