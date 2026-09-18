const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "general",
      required: true,
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    attachmentUrl: {
      type: String,
      default: "",
    },
    attachmentName: {
      type: String,
      default: "",
    },
    postedBy: {
      type: String,
      default: "Administration",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

newsSchema.index({ isPinned: -1, createdAt: -1 });
newsSchema.index({ category: 1 });
newsSchema.index({ isVisible: 1, createdAt: -1 });

module.exports = mongoose.model("News", newsSchema);
