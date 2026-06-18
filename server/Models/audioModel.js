const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    audioUrl: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AudioCategory",
      required: true,
      index: true,
    },
    duration: { type: Number, default: 0 },
    reciter: { type: String, default: "" },
    order: { type: Number, default: 0 },
    playCount: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

audioSchema.index({ categoryId: 1, order: 1 });
audioSchema.index({ title: "text", reciter: "text", description: "text" });

module.exports = mongoose.model("Audio", audioSchema);
