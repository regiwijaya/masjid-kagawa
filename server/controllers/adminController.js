// server/controllers/adminController.js
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

// ===============================
// REGISTER ADMIN
// ===============================
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Semua kolom wajib diisi" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email sudah terdaftar" });

    // password biarkan pre-save di Admin.js yang hash
    const admin = await Admin.create({
      name,
      email,
      password,
      role: req.isFirstAdmin ? "superadmin" : "admin",
    });

    res.status(201).json({
      msg: req.isFirstAdmin
        ? "Admin pertama (Superadmin) berhasil dibuat"
        : "Admin baru berhasil ditambahkan",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ===============================
// LOGIN ADMIN
// ===============================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "Email tidak ditemukan" });

    // gunakan method dari model
    const match = await admin.matchPassword(password);
    if (!match) return res.status(400).json({ msg: "Password salah" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      msg: "Login sukses",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ===============================
// GET PROFILE ADMIN
// ===============================
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    res.json(admin);
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
