require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const dns = require("dns");
const path = require("path");

// routes
const userRoutes = require("./Routes/userRoutes");
const orderRoutes = require("./Routes/order");
const meetRoutes = require("./Routes/meetRoutes");
const courseRoutes = require("./Routes/courseRoutes");
const certificateRoutes = require("./Routes/certificateAuth");
const whatsappRoutes = require("./Routes/whatsappRoutes");
const reviewRoutes = require("./Routes/reviewRoutes");
const videoRoutes = require("./Routes/videoRoutes");
const uploadRoutes = require("./Routes/uploadRoutes");
const siteSettingsRoutes = require("./Routes/siteSettingsRoutes");
const galleryRoutes = require("./Routes/galleryRoutes");
const siteContentRoutes = require("./Routes/siteContentRoutes");

const app = express();

// ENV
const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL;
const MONGODB_URI = process.env.MONGODB_URI;

console.log("🌐 BASE_URL:", BASE_URL);
console.log("🔗 Mongo URI Loaded:", !!MONGODB_URI);

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
    origin: [
      "http://localhost:5173",
      "https://mahad-al-hind.netlify.app",
      BASE_URL,
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// Preflight support
app.options("*", cors());

// --------------------
// Static Files (uploads)
// --------------------
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    fallthrough: false,
    maxAge: "7d",
  }),
);

// --------------------
// Body Parsers
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Health Check
// --------------------
app.get("/", (req, res) => {
  res.send("🚀 Server is running");
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
app.use("/api/upload", uploadRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/galleries", galleryRoutes);
app.use("/api/site-content", siteContentRoutes);

// --------------------
// MongoDB Connection
// --------------------
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

startServer();
