import mongoose, { Schema } from "mongoose";

const ImportLogSchema = new Schema(
  {
    type: { type: String, enum: ["Link", "Akun", "Akses"], required: true },
    fileName: String,
    inserted: Number,
    failed: Number,
    errors: [{ row: Number, msg: String }],
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export default mongoose.models.ImportLog ||
  mongoose.model("ImportLog", ImportLogSchema);
