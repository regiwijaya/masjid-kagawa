import Announcement from "../models/Announcement.js";

// PUBLIC
export const getPublishedAnnouncements = async (req, res) => {
  try {
    const items = await Announcement.find({ isPublished: true })
      .sort({ date: -1, createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("getPublishedAnnouncements ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getAnnouncementById = async (req, res) => {
  try {
    const item = await Announcement.findOne({
      _id: req.params.id,
      isPublished: true,
    });

    if (!item) {
      return res.status(404).json({ msg: "Pengumuman tidak ditemukan" });
    }

    res.json(item);
  } catch (err) {
    console.error("getAnnouncementById ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN
export const getAllAnnouncementsAdmin = async (req, res) => {
  try {
    const items = await Announcement.find({})
      .sort({ date: -1, createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      category,
      date,
      description,
      imageUrl,
      isPublished,
      isFeatured,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ msg: "Title dan date wajib" });
    }

    const created = await Announcement.create({
      title,
      category,
      date,
      description,
      imageUrl,
      isPublished: isPublished ?? true,
      isFeatured: isFeatured ?? false,
      createdBy: req.admin?._id,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("createAnnouncement ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.admin?._id },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Tidak ditemukan" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};