// server/controllers/prayerController.js
import { fetchPrayerTimesFromAladhan } from "../services/prayerService.js";
import IqamahSetting from "../models/IqamahSetting.js";

function sanitizeTimeInput(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const isValid = /^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed);
  return isValid ? trimmed : null;
}

async function getOrCreateIqamahSetting() {
  let iqamah = await IqamahSetting.findOne();

  if (!iqamah) {
    iqamah = await IqamahSetting.create({});
  }

  return iqamah;
}

export async function getPrayerTimes(req, res) {
  try {
    const prayerData = await fetchPrayerTimesFromAladhan();
    const iqamah = await getOrCreateIqamahSetting();

    res.json({
      date: prayerData.date,
      location: prayerData.location,
      timezone: prayerData.timezone,
      coordinates: prayerData.coordinates,
      source: prayerData.source,
      adzan: {
        subuh: prayerData.adzan.subuh,
        syuruq: prayerData.adzan.syuruq,
        zuhur: prayerData.adzan.zuhur,
        asar: prayerData.adzan.asar,
        maghrib: prayerData.adzan.maghrib,
        isya: prayerData.adzan.isya,
      },
      iqamah: {
        subuh: iqamah.subuh,
        zuhur: iqamah.zuhur,
        asar: iqamah.asar,
        maghrib: iqamah.maghrib,
        isya: iqamah.isya,
      },
    });
  } catch (error) {
    console.error("❌ prayerController getPrayerTimes error:", error);
    res.status(500).json({
      message: "Failed to load prayer times",
    });
  }
}

export async function updateIqamah(req, res) {
  try {
    const current = await getOrCreateIqamahSetting();

    const fields = ["subuh", "zuhur", "asar", "maghrib", "isya"];
    const updates = {};

    for (const field of fields) {
      const parsed = sanitizeTimeInput(req.body?.[field]);
      if (parsed) {
        updates[field] = parsed;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Tidak ada jam iqamah yang valid untuk diperbarui",
      });
    }

    Object.assign(current, updates);
    await current.save();

    res.json({
      message: "Iqamah updated successfully",
      iqamah: {
        subuh: current.subuh,
        zuhur: current.zuhur,
        asar: current.asar,
        maghrib: current.maghrib,
        isya: current.isya,
      },
    });
  } catch (error) {
    console.error("❌ updateIqamah error:", error);
    res.status(500).json({
      message: "Failed updating iqamah",
    });
  }
}