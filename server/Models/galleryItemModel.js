const mongoose = require("mongoose");

const galleryItemSchema = new mongoose.Schema(
  {
    galleryType: {
      type: String,
      enum: ["student", "just_memories", "general"],
      default: "general",
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
    },
    resourceType: {
      type: String,
      default: "image",
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userCollection",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("GalleryItem", galleryItemSchema);
