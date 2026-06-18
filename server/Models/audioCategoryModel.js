const mongoose = require("mongoose");

const audioCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["tilawah", "surah", "juzz", "maqamat"],
      required: true,
      index: true,
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AudioCategory",
      default: null,
      index: true,
    },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

audioCategorySchema.index({ type: 1, parentId: 1, order: 1 });

module.exports = mongoose.model("AudioCategory", audioCategorySchema);
