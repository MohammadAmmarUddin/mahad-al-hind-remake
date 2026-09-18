const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const { createMeet, sendSchedule } = require("../Controllers/meetControllers");
const router = express.Router();

router.post('/createMeet', requireAuth, createMeet)
router.post('/sendSchedule', requireAuth, sendSchedule)

module.exports = router;