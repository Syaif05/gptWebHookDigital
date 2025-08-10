import mongoose, { Schema } from "mongoose";

const RateSchema = new Schema(
  {
    key: { type: String, index: true },
    windowStart: { type: Date, index: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Rate || mongoose.model("Rate", RateSchema);
