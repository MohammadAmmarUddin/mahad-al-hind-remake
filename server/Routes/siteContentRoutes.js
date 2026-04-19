const express = require("express");
const {
  getPublicSiteContent,
  updatePublicSiteContent,
} = require("../Controllers/siteContentController");

const router = express.Router();

router.get("/public", getPublicSiteContent);
router.patch("/public", updatePublicSiteContent);

module.exports = router;
