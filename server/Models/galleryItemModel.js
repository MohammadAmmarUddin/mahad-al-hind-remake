const mongoose = require("mongoose");

const galleryItemSchema = new mongoose.Schema(
  {
    galleryType: {
      type: String,
      enum: ["student", "faregin"],
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      required: true,
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
  },
  { timestamps: true },
);

module.exports = mongoose.model("GalleryItem", galleryItemSchema);
