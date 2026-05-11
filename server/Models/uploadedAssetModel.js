const mongoose = require("mongoose");

const uploadedAssetSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    secureUrl: {
      type: String,
      trim: true,
      default: "",
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    folder: {
      type: String,
      default: "",
      trim: true,
    },
    resourceType: {
      type: String,
      default: "image",
      trim: true,
    },
    assetId: {
      type: String,
      default: "",
      trim: true,
    },
    format: {
      type: String,
      default: "",
      trim: true,
    },
    bytes: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    originalName: {
      type: String,
      default: "",
      trim: true,
    },
    mimeType: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      default: "cloudinary",
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UploadedAsset", uploadedAssetSchema);
