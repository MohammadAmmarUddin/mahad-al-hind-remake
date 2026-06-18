require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const dns = require("dns");

// routes
const userRoutes = require("./Routes/userRoutes");
const orderRoutes = require("./Routes/order");
const meetRoutes = require("./Routes/meetRoutes");
const courseRoutes = require("./Routes/courseRoutes");
const certificateRoutes = require("./Routes/certificateAuth");
const whatsappRoutes = require("./Routes/whatsappRoutes");
const reviewRoutes = require("./Routes/reviewRoutes");
const videoRoutes = require("./Routes/videoRoutes");
const mediaRoutes = require("./Routes/mediaRoutes");
const siteSettingsRoutes = require("./Routes/siteSettingsRoutes");
const { legacyRouter: galleryRoutes, unifiedRouter: galleryNewRoutes } =
  require("./Routes/galleryRoutes");
const siteContentRoutes = require("./Routes/siteContentRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const appUpdateRoutes = require("./Routes/appUpdateRoutes");
const cloudinaryRoutes = require("./Routes/cloudinaryRoutes");

const app = express();

// ENV
const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL;
const MONGODB_URI = process.env.MONGODB_URI;

console.log("BASE_URL:", BASE_URL);
console.log("Mongo URI Loaded:", !!MONGODB_URI);

// Fix DNS (Mongo SRV issue workaround)
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// --------------------
// Security Middleware
// --------------------
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: false,
  }),
);

// --------------------
// CORS (must be before routes)
// --------------------
app.use(
  cors({
    origin: [BASE_URL, "https://mahad-al-hind.netlify.app", "http://localhost:5173"].filter(Boolean),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
    credentials: true,
  }),
);

// Preflight support
app.options("*", cors());

// --------------------
// Body Parsers
// --------------------
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// --------------------
// Health Check
// --------------------
app.get("/", (req, res) => {
  res.send("Server is running");
});

// --------------------
// API Routes
// --------------------
app.use("/api/user", userRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/meet", meetRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/galleries", galleryRoutes);
app.use("/api/gallery", galleryNewRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", appUpdateRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);

// --------------------
// MongoDB Connection
// --------------------
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}

// Connect on startup
connectDB();

// --------------------
// Local Dev Server (skip on Vercel)
// --------------------
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
}

// Vercel serverless: export the app
module.exports = app;
