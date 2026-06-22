const mongoose = require("mongoose");

const financeTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userCollection",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: ["BDT", "INR", "USD"],
      required: true,
    },
    category: { type: String, default: "" },
    source: { type: String, default: "" },
    note: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank", "bKash", "Nagad", "GooglePay", "PhonePe"],
      default: "cash",
    },
    attachmentUrl: { type: String, default: "" },
    isRecurring: { type: Boolean, default: false },
    recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinanceRecurring",
      default: null,
    },
  },
  { timestamps: true }
);

financeTransactionSchema.index({ userId: 1, type: 1, date: -1 });
financeTransactionSchema.index({ userId: 1, currency: 1, date: -1 });
financeTransactionSchema.index({ userId: 1, category: 1 });
financeTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("FinanceTransaction", financeTransactionSchema);
