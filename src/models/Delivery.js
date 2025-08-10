import mongoose, { Schema } from "mongoose";

const DeliverySchema = new Schema(
  {
    to: { type: String, required: true },
    type: { type: String, enum: ["Link", "Akun", "Akses"], required: true },
    templateId: { type: Schema.Types.ObjectId, ref: "Template" },
    itemIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    subject: String,
    bodyRenderedSnapshot: String,
    status: { type: String, enum: ["sent", "failed"], required: true },
    error: String,
    sentAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Delivery ||
  mongoose.model("Delivery", DeliverySchema);
