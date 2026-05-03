// server/server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import activityRoutes from "./routes/activityRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import kajianRoutes from "./routes/kajianRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import prayerRoutes from "./routes/prayerRoutes.js";
import donationSettingRoutes from "./routes/donationSettingRoutes.js";
import aboutSettingRoutes from "./routes/aboutSettingRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Middlewares =====
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads folder:
// server/uploads/... akan bisa diakses lewat /uploads/...
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== MongoDB =====
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI belum di-set di server/.env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ===== Routes =====
app.get("/", (req, res) => {
  res.json({ message: "Masjid Kagawa API is running" });
});

app.use("/api/uploads", uploadRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/kajian", kajianRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/donation-settings", donationSettingRoutes);
app.use("/api/about-settings", aboutSettingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/prayer", prayerRoutes);

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    message: "Route tidak ditemukan",
    path: req.originalUrl,
  });
});

// ===== Error handler =====
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(err?.status || 500).json({
    message: "Server error",
    error: err?.message,
  });
});

// ===== Start =====
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads served from: ${path.join(__dirname, "uploads")}`);
});