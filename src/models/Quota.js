import mongoose, { Schema } from "mongoose";

const QuotaSchema = new Schema(
  {
    senderEmail: { type: String, index: true },
    date: { type: String, index: true }, // YYYY-MM-DD
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Quota || mongoose.model("Quota", QuotaSchema);
