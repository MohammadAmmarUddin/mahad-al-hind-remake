const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const {
  getFaqById,
  getPublicFaqs,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} = require("../Controllers/faqController");

const router = express.Router();

router.get("/public", getPublicFaqs);
router.get("/", requireAuth, getAllFaqs);
router.get("/:id", getFaqById);
router.post("/", requireAuth, createFaq);
router.put("/:id", requireAuth, updateFaq);
router.delete("/:id", requireAuth, deleteFaq);

module.exports = router;
