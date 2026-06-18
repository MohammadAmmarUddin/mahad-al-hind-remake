const express = require("express");
const router = express.Router();
const {
  getAppVersion,
  getUpdateConfig,
  updateConfig,
  updateToggles,
} = require("../Controllers/appUpdateController");
const requireAuth = require("../Middleware/requireAuth");

// Public — used by mobile app to check for updates
router.get("/app-version", getAppVersion);

// Admin — manage update config
router.get("/app-update", requireAuth, getUpdateConfig);
router.patch("/app-update", requireAuth, updateConfig);
router.patch("/app-update/toggles", requireAuth, updateToggles);

module.exports = router;
