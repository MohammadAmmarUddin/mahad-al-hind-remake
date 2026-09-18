const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const {
  getPublicSiteContent,
  updatePublicSiteContent,
} = require("../Controllers/siteContentController");

const router = express.Router();

router.get("/public", getPublicSiteContent);
router.patch("/public", requireAuth, updatePublicSiteContent);

module.exports = router;
