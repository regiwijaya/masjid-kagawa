// server/models/AboutSetting.js
import mongoose from "mongoose";

const LeaderSchema = new mongoose.Schema(
  {
    role: { type: String, default: "", trim: true },
    name: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const SocialSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: "", trim: true },
    instagram: { type: String, default: "", trim: true },
    youtube: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const AboutSettingSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "Tentang Masjid Kagawa", trim: true },
    heroSubtitle: {
      type: String,
      default: "Sejarah • Visi Misi • Struktur Pengurus",
      trim: true,
    },
    heroImageUrl: { type: String, default: "", trim: true },

    historyTitle: { type: String, default: "Sejarah Masjid", trim: true },
    historyText: { type: String, default: "", trim: true },
    historyImageUrl: { type: String, default: "", trim: true },

    visionTitle: { type: String, default: "Visi", trim: true },
    visionText: { type: String, default: "", trim: true },

    missionTitle: { type: String, default: "Misi", trim: true },
    missionItems: {
      type: [String],
      default: [],
    },

    leaders: {
      type: [LeaderSchema],
      default: [],
    },

    footerDescription: {
      type: String,
      default:
        "Pusat ibadah, dakwah, pendidikan, dan kegiatan sosial bagi komunitas Muslim di Kagawa, Jepang.",
      trim: true,
    },

    address: { type: String, default: "Kagawa, Jepang", trim: true },
    email: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },

    mapEmbedUrl: { type: String, default: "", trim: true },

    imamDuty: { type: String, default: "", trim: true },
    muadzinDuty: { type: String, default: "", trim: true },

    social: {
      type: SocialSchema,
      default: () => ({}),
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.model("AboutSetting", AboutSettingSchema);