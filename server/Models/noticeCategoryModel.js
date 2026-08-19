const mongoose = require("mongoose");

const noticeCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#059669",
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
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

noticeCategorySchema.index({ slug: 1 });
noticeCategorySchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model("NoticeCategory", noticeCategorySchema);
