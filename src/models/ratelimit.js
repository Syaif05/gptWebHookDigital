import { dbConnect } from "./db";
import Rate from "@/models/Rate";

export async function rateLimitPerMinute(key, limit = 20) {
  await dbConnect();
  const now = Date.now();
  const windowMs = 60_000;
  const bucketStart = new Date(Math.floor(now / windowMs) * windowMs);

  const doc = await Rate.findOneAndUpdate(
    { key, windowStart: bucketStart },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );
  return {
    allowed: doc.count <= limit,
    remaining: Math.max(0, limit - doc.count),
  };
}
