// server/controllers/donationSettingController.js
import DonationSetting from "../models/DonationSetting.js";

async function getOrCreateDonationSetting(adminId = null) {
  let setting = await DonationSetting.findOne();

  if (!setting) {
    setting = await DonationSetting.create({
      updatedBy: adminId || undefined,
    });
  }

  return setting;
}

// PUBLIC
export const getDonationSetting = async (req, res) => {
  try {
    const setting = await getOrCreateDonationSetting();

    return res.json(setting);
  } catch (err) {
    console.error("getDonationSetting ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// ADMIN
export const updateDonationSetting = async (req, res) => {
  try {
    const current = await getOrCreateDonationSetting(req.admin?._id);

    const allowedFields = [
      "bankJapanName",
      "bankJapanAccountName",
      "bankJapanAccountNumber",
      "bankJapanBranch",
      "bankIndonesiaName",
      "bankIndonesiaAccountName",
      "bankIndonesiaAccountNumber",
      "bankIndonesiaBranch",
      "qrisImageUrl",
      "donationNote",
      "confirmationText",
      "confirmationLink",
    ];

    for (const field of allowedFields) {
      if (typeof req.body?.[field] === "string") {
        current[field] = req.body[field].trim();
      }
    }

    current.updatedBy = req.admin?._id;
    await current.save();

    return res.json({
      msg: "Donation setting updated successfully",
      data: current,
    });
  } catch (err) {
    console.error("updateDonationSetting ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};