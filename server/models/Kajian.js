// server/models/Kajian.js
import mongoose from "mongoose";

const KajianSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    category: {
      type: String,
      enum: [
        "Tauhid",
        "Aqidah",
        "Fiqih",
        "Hadits",
        "Tafsir",
        "Sirah",
        "Adab",
        "Lainnya",
      ],
      default: "Lainnya",
    },

    ustadz: { type: String, default: "", trim: true },
    date: { type: String, required: true },
    time: { type: String, default: "", trim: true },
    location: { type: String, default: "Masjid Kagawa", trim: true },
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },

    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.model("Kajian", KajianSchema);