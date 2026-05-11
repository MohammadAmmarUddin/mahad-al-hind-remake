const express = require("express");
const requireAuth = require("../Middleware/requireAuth");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require("../Controllers/notificationController");

const router = express.Router();

router.get("/", requireAuth, getNotifications);
router.get("/unread-count", requireAuth, getUnreadCount);
router.patch("/read/:id", requireAuth, markAsRead);
router.patch("/read-all", requireAuth, markAllAsRead);

module.exports = router;
