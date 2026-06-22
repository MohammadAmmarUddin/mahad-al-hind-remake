const mongoose = require("mongoose");

const financeBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userCollection",
      required: true,
    },
    category: { type: String, required: true },
    limit: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: ["BDT", "INR", "USD"],
      required: true,
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

financeBudgetSchema.index({ userId: 1, month: 1, year: 1, currency: 1 });
financeBudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 });

module.exports = mongoose.model("FinanceBudget", financeBudgetSchema);
