const mongoose = require("mongoose");

const appUpdateSchema = new mongoose.Schema(
  {
    latestVersion: {
      type: String,
      required: true,
      default: "1.0.0",
    },
    minVersion: {
      type: String,
      default: "1.0.0",
    },
    forceUpdate: {
      type: Boolean,
      default: false,
    },
    apkUrl: {
      type: String,
      default: "",
    },
    releaseNotes: {
      type: String,
      default: "",
    },
    updateEnabled: {
      type: Boolean,
      default: true,
    },
    showUpdateToOutdatedUsers: {
      type: Boolean,
      default: false,
    },
    // Monotonic build number of the published APK. Android needs it to be
    // greater than the installed one, otherwise the system installer refuses
    // the update.
    latestVersionCode: {
      type: Number,
      default: 0,
    },
    // Lowest build number the app still works with. Older builds are forced
    // to update instead of silently running on a stale API.
    minSupportedVersionCode: {
      type: Number,
      default: 0,
    },
    // SHA-256 of the published APK. The app verifies the downloaded file
    // against this value before handing it to the system installer.
    apkSha256: {
      type: String,
      default: "",
      trim: true,
    },
    apkSizeBytes: {
      type: Number,
      default: 0,
    },
    // Release notes per language, so the update dialog can speak the user's
    // language without extra translation work in the app.
    releaseNotesBn: {
      type: String,
      default: "",
    },
    releaseNotesEn: {
      type: String,
      default: "",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Singleton pattern: only one config document
appUpdateSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

appUpdateSchema.statics.updateConfig = async function (updates) {
  let config = await this.findOne();
  if (!config) {
    config = await this.create(updates);
  } else {
    Object.assign(config, updates);
    await config.save();
  }
  return config;
};

module.exports = mongoose.model("AppUpdate", appUpdateSchema);
