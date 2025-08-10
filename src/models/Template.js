import mongoose, { Schema } from "mongoose";

const TemplateSchema = new Schema(
  {
    type: { type: String, enum: ["Link", "Akun", "Akses"], required: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Template ||
  mongoose.model("Template", TemplateSchema);
