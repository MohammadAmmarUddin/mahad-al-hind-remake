const mongoose = require("mongoose");

const financeSavingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userCollection",
      required: true,
    },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    currency: {
      type: String,
      enum: ["BDT", "INR", "USD"],
      required: true,
    },
    targetDate: { type: Date, required: true },
    icon: { type: String, default: "savings" },
    color: { type: String, default: "#0F6B4A" },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

financeSavingsGoalSchema.index({ userId: 1, isCompleted: 1 });
financeSavingsGoalSchema.index({ userId: 1, currency: 1 });

module.exports = mongoose.model("FinanceSavingsGoal", financeSavingsGoalSchema);
