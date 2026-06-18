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
