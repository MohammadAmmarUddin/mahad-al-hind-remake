const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "home-page",
    },
    homeSections: {
      hero: { type: Boolean, default: true },
      breakingNews: { type: Boolean, default: true },
      statsBanner: { type: Boolean, default: true },
      videos: { type: Boolean, default: true },
      studentGallery: { type: Boolean, default: true },
      pagriGallery: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
