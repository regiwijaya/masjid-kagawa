// server/routes/kajianRoutes.js

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

/**
 * =========================
 * ADMIN (WAJIB DI ATAS)
 * =========================
 * GET    /api/kajian/admin/all   -> list semua kajian
 * POST   /api/kajian             -> create kajian
 * PUT    /api/kajian/:id         -> update kajian
 * DELETE /api/kajian/:id         -> delete kajian
 */
router.get("/admin/all", protectAdmin, getAllKajianAdmin);
router.post("/", protectAdmin, createKajian);
router.put("/:id", protectAdmin, updateKajian);
router.delete("/:id", protectAdmin, deleteKajian);

/**
 * =========================
 * PUBLIC
 * =========================
 * GET /api/kajian        -> list published
 * GET /api/kajian/:id    -> detail
 */
router.get("/", getKajianPublished);
router.get("/:id", getKajianById);

export default router;