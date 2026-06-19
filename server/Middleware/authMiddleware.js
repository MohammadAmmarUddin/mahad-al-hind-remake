const requireAuth = require("./requireAuth");
const User = require("../Models/userModel");

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
    req.adminUser = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

module.exports = { requireAuth, requireAdmin };
