const mongoose = require("mongoose");

const breakingNewsSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

breakingNewsSchema.index({ isActive: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model("BreakingNews", breakingNewsSchema);
