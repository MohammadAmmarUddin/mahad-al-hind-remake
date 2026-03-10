const cors = require("cors");
const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");

// Use helmet middleware for secure headers
const dns = require("dns");
const userRoutes = require("./Routes/userRoutes.js");
const orderRoutes = require("./Routes/order.js");
const meetRoutes = require("./Routes/meetRoutes.js");
const courseRoutes = require("./Routes/courseRoutes.js");
const certificateRoutes = require("./Routes/certificateAuth");
const whatsappRoutes = require("./Routes/whatsappRoutes.js");
const reviewRoutes = require("./Routes/reviewRoutes");
require("dotenv").config();
const app = express();
const baseUrl = process.env.BASE_URL;
console.log("🚀 ~ baseUrl:", baseUrl);

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/meet", meetRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api/review", reviewRoutes);
const videoRoutes = require("./Routes/videoRoutes.js"); // ✅ add import at top

// then with your other routes:
app.use("/api/videos", videoRoutes); // ✅ add route
// Test route
app.get("/", async (req, res) => {
  res.send("Server is working!");
});

// Set CSP headers
app.use(
  cors({
    origin: ["http://localhost:5173", baseUrl], // allow both local + production
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use("/api/orders", orderRoutes);
const MONGODB_URI = process.env.MONGODB_URI;
console.log("check uri", MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(process.env.PORT || 4000, () => {
      console.log(`🚀 Server running on ${process.env.PORT || 4000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
