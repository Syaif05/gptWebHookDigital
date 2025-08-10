import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    type: { type: String, enum: ["Link", "Akun", "Akses"], required: true },
    attributes: { type: Schema.Types.Mixed, required: true },
    fingerprint: { type: String, index: true, unique: true, sparse: true }, // NEW
    status: { type: String, enum: ["available", "sent"], default: "available" },
    usedAt: Date,
    usedByDeliveryId: { type: Schema.Types.ObjectId, ref: "Delivery" },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
