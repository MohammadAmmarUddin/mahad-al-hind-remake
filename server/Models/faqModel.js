const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "general",
      trim: true,
      maxlength: 100,
    },
    order: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

faqSchema.index({ category: 1 });
faqSchema.index({ isVisible: 1, order: 1 });

module.exports = mongoose.model("Faq", faqSchema);
