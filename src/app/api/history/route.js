import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getServerSession } from "next-auth";
import { isAllowed } from "@/lib/auth";
import Delivery from "@/models/Delivery";
import Product from "@/models/Product";
import ImportLog from "@/models/ImportLog";

export async function GET(req) {
  await dbConnect();
  const session = await getServerSession();
  if (!session?.user?.email || !isAllowed(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") || "deliveries"; // deliveries | imports | products
  const type = searchParams.get("type"); // Link|Akun|Akses (opsional)
  const q = (searchParams.get("q") || "").trim(); // pencarian ringan
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

  if (kind === "deliveries") {
    const filter = {};
    if (type) filter.type = type;
    if (q) filter.to = { $regex: q, $options: "i" };

    const items = await Delivery.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const data = items.map((d) => ({
      _id: String(d._id),
      to: d.to,
      type: d.type,
      status: d.status,
      subject: d.subject,
      bodyPreview: (d.bodyRenderedSnapshot || "").slice(0, 180),
      error: d.error,
      createdAt: d.createdAt,
      sentAt: d.sentAt,
      itemCount: Array.isArray(d.itemIds) ? d.itemIds.length : 0,
    }));
    return NextResponse.json({ items: data });
  }

  if (kind === "imports") {
    const filter = {};
    if (type) filter.type = type;
    const items = await ImportLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const data = items.map((i) => ({
      _id: String(i._id),
      type: i.type,
      fileName: i.fileName,
      inserted: i.inserted,
      failed: i.failed,
      errors: i.errors, // sudah dibatasi 100 saat simpan
      createdAt: i.createdAt,
    }));
    return NextResponse.json({ items: data });
  }

  if (kind === "products") {
    const filter = {};
    if (type) filter.type = type;
    if (q) filter["attributes.namaProduk"] = { $regex: q, $options: "i" };
    const items = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const data = items.map((p) => ({
      _id: String(p._id),
      type: p.type,
      status: p.status,
      attributes: p.attributes,
      createdAt: p.createdAt,
      usedAt: p.usedAt,
    }));
    return NextResponse.json({ items: data });
  }

  return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
}
