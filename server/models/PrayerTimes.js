// server/models/PrayerTimes.js
import mongoose from "mongoose";

const PrayerConfigSchema = new mongoose.Schema(
  {
    // auto = ambil dari API + cache harian
    // manual = pakai overrides (full manual)
    mode: { type: String, enum: ["auto", "manual"], default: "auto" },

    // Lokasi FIX (A) — Masjid Kagawa
    location: {
      lat: { type: Number, default: 34.31534554222235 },
      lng: { type: Number, default: 133.87636651073518 },
      label: { type: String, default: "Masjid Kagawa" },
    },

    // Metode kalkulasi (default MWL)
    // (kalau mau ganti nanti, tinggal ubah config via admin)
    method: { type: String, default: "MWL" },

    // Offset menit per waktu shalat (tune)
   tune: {
  subuh: { type: String, default: "-" },
  syuruq: { type: String, default: "-" }, // ✅ tambah
  zuhur: { type: String, default: "-" },
  asar: { type: String, default: "-" },
  maghrib: { type: String, default: "-" },
  isya: { type: String, default: "-" },
},
    // Override manual (opsional). Jika diisi → menimpa hasil auto.
    overrides: {
  subuh: { type: String, default: "-" },
  syuruq: { type: String, default: "-" }, // ✅ tambah
  zuhur: { type: String, default: "-" },
  asar: { type: String, default: "-" },
  maghrib: { type: String, default: "-" },
  isya: { type: String, default: "-" },
},
  },
  { timestamps: true }
);

const PrayerTimes = mongoose.model("PrayerTimes", PrayerConfigSchema);
export default PrayerTimes;