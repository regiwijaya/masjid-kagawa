import express from "express";
import { uploadImage } from "../middlewares/uploadImage.js";
import { protectAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

router.post("/:type", protectAdmin, uploadImage.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "File gambar wajib diupload" });
  }

  const imageUrl = `/uploads/${req.params.type}/${req.file.filename}`;

  return res.status(201).json({
    msg: "Upload berhasil",
    imageUrl,
  });
});

export default router;