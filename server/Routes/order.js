const express = require("express");
const Order = require("../Models/order.js");

const router = express.Router();

// POST: Create new order
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ message: "Order saved successfully", order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET: Fetch all orders (optional for admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
