const mongoose = require("mongoose");

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    bn: { type: String, default: "" },
  },
  { _id: false },
);

const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "public-site",
    },
    theme: {
      type: String,
      default: "current-default",
    },
    navbar: {
      home: localizedTextSchema,
      dashboard: localizedTextSchema,
      courses: localizedTextSchema,
      certificateChecker: localizedTextSchema,
      admissionHelp: localizedTextSchema,
      notice: localizedTextSchema,
      login: localizedTextSchema,
      signup: localizedTextSchema,
      profile: localizedTextSchema,
      settings: localizedTextSchema,
      logout: localizedTextSchema,
      language: localizedTextSchema,
      english: localizedTextSchema,
      bengali: localizedTextSchema,
    },
    home: {
      heroTitle: localizedTextSchema,
      heroSubtitle: localizedTextSchema,
      heroDescription: localizedTextSchema,
      heroCta: localizedTextSchema,
      loading: localizedTextSchema,
    },
    breakingNews: {
      label: localizedTextSchema,
      message: localizedTextSchema,
    },
    videoSection: {
      badge: localizedTextSchema,
      loading: localizedTextSchema,
      error: localizedTextSchema,
      emptyTitle: localizedTextSchema,
      emptySubtitle: localizedTextSchema,
      clickToWatch: localizedTextSchema,
    },
    gallerySection: {
      studentTitle: localizedTextSchema,
      fareginTitle: localizedTextSchema,
    },
    noticeBoard: {
      badge: localizedTextSchema,
      title: localizedTextSchema,
      subtitle: localizedTextSchema,
      searchPlaceholder: localizedTextSchema,
      search: localizedTextSchema,
      all: localizedTextSchema,
      noNotices: localizedTextSchema,
      noNoticesSub: localizedTextSchema,
      noResults: localizedTextSchema,
      clearFilters: localizedTextSchema,
      postedBy: localizedTextSchema,
      downloadNotice: localizedTextSchema,
      loading: localizedTextSchema,
      error: localizedTextSchema,
    },
    enrollmentWidget: {
      isVisible: {
        type: Boolean,
        default: true,
      },
      title: localizedTextSchema,
      startLabel: localizedTextSchema,
      endLabel: localizedTextSchema,
      reopenLabel: localizedTextSchema,
      startDate: {
        type: String,
        default: "",
      },
      endDate: {
        type: String,
        default: "",
      },
    },
    heroBanners: [{
      url: { type: String, required: true },
      publicId: { type: String, default: "" },
      createdAt: { type: Date, default: Date.now },
    }],
    heroBannerSettings: {
      slideshow: { type: Boolean, default: false },
      imagesOnly: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SiteContent", siteContentSchema);
