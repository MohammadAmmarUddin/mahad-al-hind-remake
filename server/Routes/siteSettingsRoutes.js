const express = require("express");
const {
  getHomePageSettings,
  updateHomePageSettings,
} = require("../Controllers/siteSettingsController");

const router = express.Router();

router.get("/home-page", getHomePageSettings);
router.patch("/home-page", updateHomePageSettings);

module.exports = router;
