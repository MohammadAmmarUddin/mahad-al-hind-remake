const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    country: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postcode: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String },

    // Payment info
    paymentMethod: {
      type: String,
      required: true,
      enum: ["bKash", "Nagad", "GooglePay", "PhonePe"],
    },
    paymentNumber: { type: String, required: true },
    transactionId: { type: String, required: true },
  },
  { timestamps: true }
);
const order = mongoose.model("Order", orderSchema);

module.exports = order;
