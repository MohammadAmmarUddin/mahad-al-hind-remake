const mongoose = require("mongoose");

const heroBannerSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
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

heroBannerSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model("HeroBanner", heroBannerSchema);
