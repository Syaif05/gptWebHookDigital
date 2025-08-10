import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { dbConnect } from "@/lib/db";
import { isAllowed } from "@/lib/auth";
import Product from "@/models/Product";
import Template from "@/models/Template";
import Delivery from "@/models/Delivery";
import { canSendToday, incSend } from "@/lib/quota";
import { renderTemplate, SUBJECT_DEFAULT } from "@/lib/templating";
import { decrypt } from "@/lib/crypto";
import { sendGmailRaw } from "@/lib/gmail";

export async function POST(req) {
  await dbConnect();

  // Selalu pass 'authOptions' ke getServerSession (App Router)
  const session = await getServerSession(authOptions);

  // Hanya email yang di-allowlist yang boleh kirim
  if (!session?.user?.email || !isAllowed(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Token dari NextAuth wajib ada
  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "No access token. Silakan login ulang." },
      { status: 401 }
    );
  }

  const { to, customerName, type, itemIds } = await req.json();
  if (!to || !type) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Quota harian
  const { ok, used, limit } = await canSendToday(session.user.email);
  if (!ok) {
    const tpl = await Template.findOne({ type });
    const body = renderTemplate(type, tpl?.body, { customerName, items: [] });
    return NextResponse.json({
      limitReached: true,
      used,
      limit,
      subject: SUBJECT_DEFAULT,
      body,
    });
  }

  // Ambil item sesuai kategori
  let items = [];
  if (type === "Akun") {
    const pick = await Product.aggregate([
      { $match: { type: "Akun", status: "available" } },
      { $sample: { size: 1 } },
    ]);
    if (!pick.length) {
      return NextResponse.json({ error: "Stok Akun habis" }, { status: 400 });
    }
    items = pick;
  } else if (type === "Link" || type === "Akses") {
    if (!Array.isArray(itemIds) || !itemIds.length) {
      return NextResponse.json(
        { error: "Pilih item minimal 1" },
        { status: 400 }
      );
    }
    items = await Product.find({ _id: { $in: itemIds } });
  } else {
    return NextResponse.json({ error: "Tipe tidak dikenal" }, { status: 400 });
  }

  // Data untuk template (decrypt khusus Akun)
  const mapped = items.map((it) => {
    const a = it.attributes || {};
    if (type === "Akun") {
      return {
        namaProdukAkun: a.namaProdukAkun,
        emailProduk: decrypt(a.emailProduk),
        passwordProduk: decrypt(a.passwordProduk),
      };
    }
    return a; // Link/Akses langsung pakai attributes
  });

  const tpl = await Template.findOne({ type });
  if (!tpl)
    return NextResponse.json({ error: "Template not found" }, { status: 500 });

  const subject = SUBJECT_DEFAULT;
  const body = renderTemplate(type, tpl.body, { customerName, items: mapped });

  // Kirim via Gmail API atas nama user yang login
  try {
    await sendGmailRaw({
      accessToken: session.accessToken,
      from: session.user.email,
      to,
      subject,
      body,
    });

    // Log pengiriman
    const delivery = await Delivery.create({
      to,
      type,
      templateId: tpl._id,
      itemIds: items.map((i) => i._id),
      subject,
      bodyRenderedSnapshot: body,
      status: "sent",
      sentAt: new Date(),
    });

    // Jika Akun → tandai stok sebagai 'sent'
    if (type === "Akun") {
      await Product.updateOne(
        { _id: items[0]._id },
        {
          $set: {
            status: "sent",
            usedAt: new Date(),
            usedByDeliveryId: delivery._id,
          },
        }
      );
    }

    await incSend(session.user.email, 1);
    return NextResponse.json({ ok: true });
  } catch (e) {
    await Delivery.create({
      to,
      type,
      templateId: tpl._id,
      itemIds: items.map((i) => i._id),
      subject,
      bodyRenderedSnapshot: body,
      status: "failed",
      error: String(e),
    });
    return NextResponse.json(
      { error: "Gagal kirim email", detail: String(e) },
      { status: 500 }
    );
  }
}
