const mongoose = require("mongoose");

const paymentSessionSchema = new mongoose.Schema(
  {
    tranId: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "courseCollection", required: true },
    studentsId: { type: mongoose.Schema.Types.ObjectId, ref: "userCollection", required: true },
    payment: { type: String, required: true },
    paymentComplete: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ["SSLCommerz", "bKash", "Nagad", "GooglePay", "PhonePe", "manual"], default: "SSLCommerz" },
    paymentNumber: { type: String, default: "" },
    manualTransactionId: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: "completed" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentSession", paymentSessionSchema);
