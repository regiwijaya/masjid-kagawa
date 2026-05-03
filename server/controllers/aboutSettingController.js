// server/controllers/aboutSettingController.js
import AboutSetting from "../models/AboutSetting.js";

async function getOrCreateAboutSetting(adminId = null) {
  let setting = await AboutSetting.findOne();

  if (!setting) {
    setting = await AboutSetting.create({
      updatedBy: adminId || undefined,
      historyText:
        "Masjid Kagawa berdiri sebagai pusat ibadah, dakwah, dan pembinaan bagi kaum muslimin di Prefektur Kagawa. Sejak awal berdirinya, masjid ini menjadi tempat berkumpul, belajar, dan memperkuat ukhuwah di antara komunitas muslim dari berbagai negara.",
      visionText:
        "Menjadi pusat ibadah, dakwah, dan pendidikan Islam yang membimbing umat menuju akhlak mulia.",
      missionItems: [
        "Menyelenggarakan pembinaan keagamaan",
        "Menyediakan sarana ibadah yang baik",
        "Membangun ukhuwah Islamiyah",
        "Menyelenggarakan kajian rutin",
      ],
      leaders: [
        { role: "Ketua", name: "Zulfikar", note: "" },
        { role: "Imam", name: "Regi Wijaya Sasmita", note: "" },
        {
          role: "Imam Magang",
          name: "Dihyah bin Nasarudin",
          note: "20 Januari 2026 – 10 April 2026",
        },
        {
          role: "Imam Magang",
          name: "Harith Naufal bin Mohd. Hilmi",
          note: "20 Januari 2026 – 10 April 2026",
        },
      ],
      footerDescription:
        "Pusat ibadah, dakwah, pendidikan, dan kegiatan sosial bagi komunitas Muslim di Kagawa, Jepang.",
      address: "Kagawa, Jepang",
      email: "",
      phone: "",
      mapEmbedUrl: "",
      imamDuty: "",
      muadzinDuty: "",
      social: {
        facebook: "",
        instagram: "",
        youtube: "",
      },
    });
  }

  return setting;
}

function normalizeMissionItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeLeaders(leaders) {
  if (!Array.isArray(leaders)) return [];

  return leaders
    .map((item) => ({
      role: typeof item?.role === "string" ? item.role.trim() : "",
      name: typeof item?.name === "string" ? item.name.trim() : "",
      imageUrl: typeof item?.imageUrl === "string" ? item.imageUrl.trim() : "",
      note: typeof item?.note === "string" ? item.note.trim() : "",
    }))
    .filter((item) => item.role || item.name || item.imageUrl || item.note);
}

// PUBLIC
export const getAboutSetting = async (req, res) => {
  try {
    const setting = await getOrCreateAboutSetting();
    return res.json(setting);
  } catch (err) {
    console.error("getAboutSetting ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN
export const updateAboutSetting = async (req, res) => {
  try {
    const current = await getOrCreateAboutSetting(req.admin?._id);

    const stringFields = [
      "heroTitle",
      "heroSubtitle",
      "heroImageUrl",
      "historyTitle",
      "historyText",
      "historyImageUrl",
      "visionTitle",
      "visionText",
      "missionTitle",
      "footerDescription",
      "address",
      "email",
      "phone",
      "mapEmbedUrl",
      "imamDuty",
      "muadzinDuty",
    ];

    for (const field of stringFields) {
      if (typeof req.body?.[field] === "string") {
        current[field] = req.body[field].trim();
      }
    }

    if (req.body?.missionItems) {
      current.missionItems = normalizeMissionItems(req.body.missionItems);
    }

    if (req.body?.leaders) {
      current.leaders = normalizeLeaders(req.body.leaders);
    }

    if (req.body?.social && typeof req.body.social === "object") {
      current.social = {
        facebook:
          typeof req.body.social.facebook === "string"
            ? req.body.social.facebook.trim()
            : current.social?.facebook || "",
        instagram:
          typeof req.body.social.instagram === "string"
            ? req.body.social.instagram.trim()
            : current.social?.instagram || "",
        youtube:
          typeof req.body.social.youtube === "string"
            ? req.body.social.youtube.trim()
            : current.social?.youtube || "",
      };
    }

    current.updatedBy = req.admin?._id;
    await current.save();

    return res.json({
      msg: "About setting updated successfully",
      data: current,
    });
  } catch (err) {
    console.error("updateAboutSetting ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};