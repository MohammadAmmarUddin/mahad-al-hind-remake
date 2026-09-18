const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const {
  getCareerById,
  getPublicCareers,
  getAllCareers,
  createCareer,
  updateCareer,
  deleteCareer,
} = require("../Controllers/careerController");

const router = express.Router();

router.get("/public", getPublicCareers);
router.get("/", requireAuth, getAllCareers);
router.get("/:id", getCareerById);
router.post("/", requireAuth, createCareer);
router.put("/:id", requireAuth, updateCareer);
router.delete("/:id", requireAuth, deleteCareer);

module.exports = router;
