const express = require("express");
const { destroyAsset } = require("../Controllers/cloudinaryController");
const { requireAuth, requireAdmin } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/destroy", requireAuth, requireAdmin, destroyAsset);

module.exports = router;
