import express from "express";
import {
  getPublishedAnnouncements,
  getAnnouncementById,
  getAllAnnouncementsAdmin,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

import { protectAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

// =========================
// ADMIN (HARUS DI ATAS)
// =========================
router.get("/admin/all", protectAdmin, getAllAnnouncementsAdmin);
router.post("/", protectAdmin, createAnnouncement);
router.put("/:id", protectAdmin, updateAnnouncement);
router.delete("/:id", protectAdmin, deleteAnnouncement);

// =========================
// PUBLIC
// =========================
router.get("/", getPublishedAnnouncements);
router.get("/:id", getAnnouncementById);

export default router;