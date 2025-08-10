import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Delivery from "@/models/Delivery";
import { getServerSession } from "next-auth";
import { isAllowed } from "@/lib/auth";
import { sendGmailRaw } from "@/lib/gmail";

export async function POST(_req, { params }) {
  await dbConnect();
  const session = await getServerSession();
  const sender = session?.user?.email?.toLowerCase();
  if (!sender || !isAllowed(sender))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const d = await Delivery.findById(params.id);
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await sendGmailRaw({
      accessToken: session.access_token,
      from: sender,
      to: d.to,
      subject: d.subject || "Pengiriman Pesanan Hook Digital",
      body: d.bodyRenderedSnapshot || "",
    });
    d.status = "sent";
    d.sentAt = new Date();
    d.error = undefined;
    await d.save();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Resend failed", detail: String(e) },
      { status: 500 }
    );
  }
}
