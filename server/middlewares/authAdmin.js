// server/middlewares/authAdmin.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// ===========================================
// MIDDLEWARE: HANYA ADMIN LOGIN YG BOLEH LANJUT
// ===========================================
export const protectAdmin = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ msg: "Tidak ada token" });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) return res.status(401).json({ msg: "Admin tidak valid" });

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ msg: "Token tidak valid" });
  }
};

// ===========================================
// MIDDLEWARE: IZINKAN REGISTER ADMIN
// ===========================================
// Aturan:
// - Jika belum ada admin → bebas (admin pertama)
// - Jika sudah ada admin → wajib login dulu
export const allowSuperAdminOrFirstTime = async (req, res, next) => {
  try {
    const count = await Admin.countDocuments();

    // Jika admin pertama
    if (count === 0) {
      req.isFirstAdmin = true;
      return next();
    }

    // Admin kedua dan seterusnya → harus login
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer "))
      return res.status(403).json({ msg: "Hanya admin yang sudah login boleh menambah admin" });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (!admin)
      return res.status(403).json({ msg: "Token admin tidak valid" });

    req.admin = admin;
    req.isFirstAdmin = false;

    next();

  } catch (err) {
    console.error("ADMIN REGISTER AUTH ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
