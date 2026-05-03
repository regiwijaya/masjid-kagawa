import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    category: {
      type: String,
      enum: ["Umum", "Layanan", "Lainnya"],
      default: "Umum",
    },

    date: { type: String, required: true },

    description: { type: String, default: "" },

    imageUrl: { type: String, default: "" },

    isPublished: { type: Boolean, default: true },

    isFeatured: { type: Boolean, default: false }, // 🔥 untuk carousel

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", AnnouncementSchema);