const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const {
  getPublicReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../Controllers/studentVideoReviewController");

const router = express.Router();

router.get("/public", getPublicReviews);
router.get("/", requireAuth, getAllReviews);
router.post("/", requireAuth, createReview);
router.put("/:id", requireAuth, updateReview);
router.delete("/:id", requireAuth, deleteReview);

module.exports = router;
