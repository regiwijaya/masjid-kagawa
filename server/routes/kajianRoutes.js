import express from "express";
import {
  getKajianPublished,
  getKajianById,
  getAllKajianAdmin,
  createKajian,
  updateKajian,
  deleteKajian,
} from "../controllers/kajianController.js";
import { protectAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

// =========================
// ADMIN (HARUS DI ATAS)
// =========================
router.get("/admin/all", protectAdmin, getAllKajianAdmin);
router.post("/", protectAdmin, createKajian);
router.put("/:id", protectAdmin, updateKajian);
router.delete("/:id", protectAdmin, deleteKajian);

// =========================
// PUBLIC
// =========================
router.get("/", getKajianPublished);
router.get("/:id", getKajianById);

export default router;