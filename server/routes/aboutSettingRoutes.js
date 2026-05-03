// server/routes/aboutSettingRoutes.js
import express from "express";
import {
  getAboutSetting,
  updateAboutSetting,
} from "../controllers/aboutSettingController.js";
import { protectAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

// PUBLIC
router.get("/", getAboutSetting);

// ADMIN
router.put("/", protectAdmin, updateAboutSetting);

export default router;