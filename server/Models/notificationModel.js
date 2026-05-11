const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userCollection",
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "student", "all"],
      default: "all",
    },
    type: {
      type: String,
      enum: [
        "enrollment_request",
        "enrollment_approved",
        "enrollment_rejected",
        "course_completed",
        "new_signup",
        "payment_received",
        "general",
      ],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
    relatedId: { type: String, default: "" },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ role: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
