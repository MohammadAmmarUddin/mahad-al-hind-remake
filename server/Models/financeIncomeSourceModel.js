const mongoose = require("mongoose");

const financeIncomeSourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userCollection",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

financeIncomeSourceSchema.index({ userId: 1, name: 1 }, { unique: true });
financeIncomeSourceSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("FinanceIncomeSource", financeIncomeSourceSchema);
