const Notification = require("../Models/notificationModel");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user?._id;
    const filter = {
      $or: [{ role: "all" }],
    };
    if (userId) filter.$or.push({ userId });
    if (req.user?.role === "admin") filter.$or.push({ role: "admin" });

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark as read", error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?._id;
    const filter = {};
    if (userId) filter.userId = userId;
    if (req.user?.role === "admin") {
      delete filter.userId;
      filter.$or = [{ role: "admin" }, { role: "all" }];
    }
    await Notification.updateMany(filter, { read: true });
    res.status(200).json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark all as read", error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?._id;
    const filter = {
      read: false,
      $or: [{ role: "all" }],
    };
    if (userId) filter.$or.push({ userId });
    if (req.user?.role === "admin") filter.$or.push({ role: "admin" });

    const count = await Notification.countDocuments(filter);
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Failed to get count", error: error.message });
  }
};

const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createNotification,
};
