const express = require("express");
const router = express.Router();
const Review = require("../Models/review");

// Create Review
router.post("/create", async (req, res) => {
  const { name, image, rating, comment } = req.body;
  if (!name || !rating) {
    return res.status(400).json({ message: "Name and rating are required." });
  }

  try {
    const newReview = new Review({
      name,
      image: image || "", // Default empty string if not provided
      rating,
      comment: comment || "",
    });

    await newReview.save();

    res.status(200).json({
      message: "Review submitted successfully",
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error submitting review",
      error: error.message,
    });
  }
});

// Get All Reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching reviews",
      error: error.message,
    });
  }
});

module.exports = router;
