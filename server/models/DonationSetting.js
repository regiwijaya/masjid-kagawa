// server/models/DonationSetting.js
import mongoose from "mongoose";

const DonationSettingSchema = new mongoose.Schema(
  {
    bankJapanName: { type: String, default: "", trim: true },
    bankJapanAccountName: { type: String, default: "", trim: true },
    bankJapanAccountNumber: { type: String, default: "", trim: true },
    bankJapanBranch: { type: String, default: "", trim: true },

    bankIndonesiaName: { type: String, default: "", trim: true },
    bankIndonesiaAccountName: { type: String, default: "", trim: true },
    bankIndonesiaAccountNumber: { type: String, default: "", trim: true },
    bankIndonesiaBranch: { type: String, default: "", trim: true },

    qrisImageUrl: { type: String, default: "", trim: true },
    donationNote: { type: String, default: "", trim: true },
    confirmationText: { type: String, default: "", trim: true },
    confirmationLink: { type: String, default: "", trim: true },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.model("DonationSetting", DonationSettingSchema);