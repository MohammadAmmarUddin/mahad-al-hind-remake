const mongoose = require("mongoose");

const studentVideoReviewSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    videoId: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    program: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

studentVideoReviewSchema.index({ status: 1, isFeatured: -1, order: 1 });
studentVideoReviewSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("StudentVideoReview", studentVideoReviewSchema);
