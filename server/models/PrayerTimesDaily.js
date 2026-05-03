// server/models/PrayerTimesDaily.js
import mongoose from "mongoose";

const PrayerTimesDailySchema = new mongoose.Schema(
  {
    // YYYY-MM-DD dalam JST
    date: { type: String, required: true, unique: true },

    timezone: { type: String, default: "Asia/Tokyo" },

    // sumber jadwal
    source: {
      type: String,
      enum: ["aladhan", "local_calc", "manual"],
      required: true,
    },

    method: { type: String, default: "MWL" },
    tune: { type: Object, default: {} },
    location: { type: Object, default: {} },

    timings: {
  subuh: { type: String, default: "-" },
  syuruq: { type: String, default: "-" }, // ✅ tambah
  zuhur: { type: String, default: "-" },
  asar: { type: String, default: "-" },
  maghrib: { type: String, default: "-" },
  isya: { type: String, default: "-" },
},

    fetchedAt: { type: Date, default: Date.now },

    // opsional (debug)
    raw: { type: Object, default: null },
  },
  { timestamps: true }
);

const PrayerTimesDaily = mongoose.model("PrayerTimesDaily", PrayerTimesDailySchema);
export default PrayerTimesDaily;