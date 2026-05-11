const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Media", mediaSchema);
