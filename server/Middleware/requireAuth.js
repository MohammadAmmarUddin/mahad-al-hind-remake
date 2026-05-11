const jwt = require("jsonwebtoken");

const getTokenFromHeader = (header = "") => {
  const value = String(header || "").trim();

  if (!value) {
    return null;
  }

  if (value.toLowerCase().startsWith("bearer ")) {
    return value.slice(7).trim() || null;
  }

  return value;
};

const requireAuth = (req, res, next) => {
  try {
    const token = getTokenFromHeader(
      req.headers.authorization || req.headers.Authorization || req.headers["x-access-token"],
    );

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured.",
      });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = requireAuth;
