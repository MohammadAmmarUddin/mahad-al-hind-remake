const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tag: { type: String, default: "" },
    desc: { type: String, default: "" },
    embedUrl: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);