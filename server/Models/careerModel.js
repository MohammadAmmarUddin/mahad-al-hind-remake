const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    department: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    deadline: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "volunteer"],
      default: "full-time",
    },
    salary: {
      type: String,
      default: "",
      trim: true,
    },
    attachmentUrl: {
      type: String,
      default: "",
    },
    attachmentName: {
      type: String,
      default: "",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

careerSchema.index({ isVisible: 1, deadline: -1 });
careerSchema.index({ department: 1 });

module.exports = mongoose.model("Career", careerSchema);
