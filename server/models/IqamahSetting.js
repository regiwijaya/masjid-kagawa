import mongoose from "mongoose";

const iqamahSchema = new mongoose.Schema(
{
  subuh: { type: String, default: "06:00" },
  zuhur: { type: String, default: "12:45" },
  asar: { type: String, default: "15:30" },
  maghrib: { type: String, default: "17:30" },
  isya: { type: String, default: "19:15" }
},
{ timestamps: true }
);

export default mongoose.model("IqamahSetting", iqamahSchema);