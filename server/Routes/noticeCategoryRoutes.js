const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/requireAuth");
const {
  getPublicCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../Controllers/noticeCategoryController");

router.get("/public", getPublicCategories);
router.get("/", requireAuth, getAllCategories);
router.post("/", requireAuth, createCategory);
router.put("/:id", requireAuth, updateCategory);
router.delete("/:id", requireAuth, deleteCategory);

module.exports = router;
