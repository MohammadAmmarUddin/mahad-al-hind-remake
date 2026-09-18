const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const {
  getHomePageSettings,
  updateHomePageSettings,
} = require("../Controllers/siteSettingsController");

const router = express.Router();

router.get("/home-page", getHomePageSettings);
router.patch("/home-page", requireAuth, updateHomePageSettings);

module.exports = router;
