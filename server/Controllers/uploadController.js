const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UploadedAsset = require("../Models/uploadedAssetModel");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp, svg) are allowed!"), false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

/**
 * Upload single image
 * Usage: Upload via form-data with field name "image"
 */
const buildAssetPayload = (file) => {
  const url = `/uploads/images/${file.filename}`;

  return {
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url,
    fullUrl: `${process.env.BASE_URL || "http://localhost:4000"}${url}`,
  };
};

const persistAsset = async (file) => {
  const asset = buildAssetPayload(file);

  await UploadedAsset.findOneAndUpdate(
    { filename: asset.filename },
    {
      filename: asset.filename,
      originalName: asset.originalName,
      mimeType: asset.mimeType,
      size: asset.size,
      url: asset.url,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  return asset;
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please provide an image file.",
      });
    }

    const asset = await persistAsset(req.file);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: asset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
};

/**
 * Upload multiple images
 * Usage: Upload via form-data with field name "images"
 */
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded. Please provide image files.",
      });
    }

    const images = await Promise.all(req.files.map((file) => persistAsset(file)));

    res.status(200).json({
      success: true,
      message: `${images.length} images uploaded successfully`,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload images",
      error: error.message,
    });
  }
};

/**
 * Delete uploaded image
 */
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    fs.unlinkSync(filePath);
    await UploadedAsset.findOneAndDelete({ filename });

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};

const listImages = async (req, res) => {
  try {
    const files = await UploadedAsset.find({})
      .sort({ createdAt: -1 })
      .lean();

    const mappedFiles = files
      .filter((file) => fs.existsSync(path.join(uploadDir, file.filename)))
      .map((file) => ({
        ...file,
        fullUrl: `${process.env.BASE_URL || "http://localhost:4000"}${file.url}`,
      }));

    res.status(200).json({
      success: true,
      data: mappedFiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load uploaded images",
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  uploadMultiple: upload.array("images", 10),
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  listImages,
};
