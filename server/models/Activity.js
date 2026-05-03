// server/models/Activity.js
import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "Kegiatan", trim: true },
    date: { type: String, required: true }, // contoh: "2025-12-20"
    startTime: { type: String, default: "" }, // contoh: "19:30"
    endTime: { type: String, default: "" },   // contoh: "21:00"
    location: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "" }, // nanti bisa dipakai kalau upload gambar
    isPublished: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", ActivitySchema);
