import express from "express";
import { uploadImage } from "../middlewares/uploadImage.js";
import { protectAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

const allowedTypes = [
  "activities",
  "kajian",
  "posts",
  "announcements",
  "general",
  "about",
  "donation", // ✅ FIX TAMBAHAN
];

router.post(
  "/:type",
  protectAdmin,
  (req, res, next) => {
    const { type } = req.params;

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        msg: "Tipe upload tidak valid",
      });
    }

    next();
  },
  uploadImage.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ msg: "File gambar wajib diupload" });
    }

    const imageUrl = `/uploads/${req.params.type}/${req.file.filename}`;

    return res.status(201).json({
      msg: "Upload berhasil",
      imageUrl,
    });
  }
);

export default router;