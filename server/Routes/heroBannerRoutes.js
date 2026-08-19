const express = require("express");
const router = express.Router();
const requireAuth = require("../Middleware/requireAuth");
const {
  getPublicHeroBanners,
  getAllHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
} = require("../Controllers/heroBannerController");

router.get("/public", getPublicHeroBanners);
router.get("/", requireAuth, getAllHeroBanners);
router.post("/", requireAuth, createHeroBanner);
router.put("/:id", requireAuth, updateHeroBanner);
router.delete("/:id", requireAuth, deleteHeroBanner);

module.exports = router;
