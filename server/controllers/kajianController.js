// server/controllers/kajianController.js
import Kajian from "../models/Kajian.js";

// =========================
// PUBLIC
// =========================
export const getKajianPublished = async (req, res) => {
  try {
    const items = await Kajian.find({ isPublished: true }).sort({
      date: -1,
      createdAt: -1,
    });

    return res.json(items);
  } catch (err) {
    console.error("getKajianPublished ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const getKajianById = async (req, res) => {
  try {
    const item = await Kajian.findOne({
      _id: req.params.id,
      isPublished: true,
    });

    if (!item) {
      return res.status(404).json({ msg: "Kajian tidak ditemukan" });
    }

    return res.json(item);
  } catch (err) {
    console.error("getKajianById ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// =========================
// ADMIN
// =========================
export const getAllKajianAdmin = async (req, res) => {
  try {
    const items = await Kajian.find({}).sort({
      date: -1,
      createdAt: -1,
    });

    return res.json(items);
  } catch (err) {
    console.error("getAllKajianAdmin ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const createKajian = async (req, res) => {
  try {
    const {
      title,
      category,
      ustadz,
      date,
      time,
      location,
      description,
      imageUrl,
      isPublished,
      isFeatured,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ msg: "Judul kajian dan tanggal wajib diisi" });
    }

    const created = await Kajian.create({
      title: title.trim(),
      category: category || "Lainnya",
      ustadz: ustadz || "",
      date,
      time: time || "",
      location: location || "Masjid Kagawa",
      description: description || "",
      imageUrl: imageUrl || "",
      isPublished: typeof isPublished === "boolean" ? isPublished : true,
      isFeatured: typeof isFeatured === "boolean" ? isFeatured : false,
      createdBy: req.admin?._id,
      updatedBy: req.admin?._id,
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("createKajian ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const updateKajian = async (req, res) => {
  try {
    const updated = await Kajian.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.admin?._id,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Kajian tidak ditemukan" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("updateKajian ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const deleteKajian = async (req, res) => {
  try {
    const deleted = await Kajian.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ msg: "Kajian tidak ditemukan" });
    }

    return res.json({ msg: "Kajian berhasil dihapus" });
  } catch (err) {
    console.error("deleteKajian ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};