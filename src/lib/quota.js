import Quota from "@/models/Quota";
import { dbConnect } from "./db";

const TZ = process.env.TIMEZONE || "UTC";

function todayInTZ() {
  // hasil: YYYY-MM-DD di timezone yang dipilih
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // en-CA → 2025-08-10
}

export async function canSendToday(senderEmail) {
  await dbConnect();
  const today = todayInTZ();
  const q = await Quota.findOne({ senderEmail, date: today });
  const limit = Number(process.env.DAILY_LIMIT || 100);
  return { ok: !q || q.count < limit, used: q?.count || 0, limit };
}

export async function incSend(senderEmail, n = 1) {
  await dbConnect();
  const today = todayInTZ();
  return await Quota.findOneAndUpdate(
    { senderEmail, date: today },
    { $inc: { count: n } },
    { new: true, upsert: true }
  );
}
