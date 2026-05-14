// server/controllers/kajianController.js
import prisma from "../prisma/client.js";

// =========================
// PUBLIC
// =========================
export const getKajianPublished = async (req, res) => {
  try {
    const items = await prisma.kajian.findMany({
      where: { isPublished: true },
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    return res.json(items);
  } catch (err) {
    console.error("getKajianPublished ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const getKajianById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ msg: "ID tidak valid" });
    }

    const item = await prisma.kajian.findFirst({
      where: {
        id,
        isPublished: true,
      },
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
    const items = await prisma.kajian.findMany({
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
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
      return res.status(400).json({
        msg: "Judul kajian dan tanggal wajib diisi",
      });
    }

    const created = await prisma.kajian.create({
      data: {
        title: title.trim(),
        category: category || "Lainnya",
        ustadz: ustadz || "",
        date: new Date(date),
        time: time || "",
        location: location || "Masjid Kagawa",
        description: description || "",
        imageUrl: imageUrl || "",
        isPublished:
          typeof isPublished === "boolean" ? isPublished : true,
        isFeatured:
          typeof isFeatured === "boolean" ? isFeatured : false,
        createdBy: req.admin?.id || null,
        updatedBy: req.admin?.id || null,
      },
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("createKajian ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const updateKajian = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ msg: "ID tidak valid" });
    }

    const updated = await prisma.kajian.update({
      where: { id },
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
        updatedBy: req.admin?.id || null,
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error("updateKajian ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const deleteKajian = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ msg: "ID tidak valid" });
    }

    await prisma.kajian.delete({
      where: { id },
    });

    return res.json({ msg: "Kajian berhasil dihapus" });
  } catch (err) {
    console.error("deleteKajian ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};