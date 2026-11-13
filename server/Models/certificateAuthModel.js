const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    valid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

certificateSchema.index({ studentName: 1 });
certificateSchema.index({ courseName: 1 });
certificateSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Certificate", certificateSchema);
