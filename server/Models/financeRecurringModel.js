const mongoose = require("mongoose");

const financeRecurringSchema = new mongoose.Schema(
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
    paymentMethod: {
      type: String,
      enum: ["cash", "bank", "bKash", "Nagad", "GooglePay", "PhonePe"],
      default: "cash",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    nextDueDate: { type: Date, required: true },
    lastGeneratedDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

financeRecurringSchema.index({ userId: 1, isActive: 1, nextDueDate: 1 });
financeRecurringSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model("FinanceRecurring", financeRecurringSchema);
