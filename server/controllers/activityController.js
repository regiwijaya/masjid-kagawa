// server/controllers/activityController.js
import Activity from "../models/Activity.js";

// PUBLIC: hanya yang published
export const getPublishedActivities = async (req, res) => {
  try {
    const items = await Activity.find({ isPublished: true })
      .sort({ date: -1, createdAt: -1 });

    return res.json(items);
  } catch (err) {
    console.error("getPublishedActivities ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// PUBLIC: detail published
export const getPublishedActivityById = async (req, res) => {
  try {
    const item = await Activity.findOne({ _id: req.params.id, isPublished: true });
    if (!item) return res.status(404).json({ msg: "Kegiatan tidak ditemukan" });
    return res.json(item);
  } catch (err) {
    console.error("getPublishedActivityById ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN: semua kegiatan (published + draft)
export const getAllActivitiesAdmin = async (req, res) => {
  try {
    const items = await Activity.find({})
      .sort({ date: -1, createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error("getAllActivitiesAdmin ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN: buat kegiatan
export const createActivity = async (req, res) => {
  try {
    const {
      title,
      category,
      date,
      startTime,
      endTime,
      location,
      description,
      imageUrl,
      isPublished,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ msg: "Title dan date wajib diisi" });
    }

    const created = await Activity.create({
      title,
      category: category || "Kegiatan",
      date,
      startTime: startTime || "",
      endTime: endTime || "",
      location: location || "",
      description: description || "",
      imageUrl: imageUrl || "",
      isPublished: typeof isPublished === "boolean" ? isPublished : true,
      createdBy: req.admin?._id,
      updatedBy: req.admin?._id,
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("createActivity ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN: update kegiatan
export const updateActivity = async (req, res) => {
  try {
    const updated = await Activity.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.admin?._id },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Kegiatan tidak ditemukan" });
    return res.json(updated);
  } catch (err) {
    console.error("updateActivity ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN: hapus kegiatan
export const deleteActivity = async (req, res) => {
  try {
    const deleted = await Activity.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Kegiatan tidak ditemukan" });
    return res.json({ msg: "Kegiatan berhasil dihapus" });
  } catch (err) {
    console.error("deleteActivity ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
