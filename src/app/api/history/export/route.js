import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Delivery from "@/models/Delivery";
import ImportLog from "@/models/ImportLog";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { isAllowed } from "@/lib/auth";

function toCSV(rows) {
  const esc = (s = "") => `"${String(s).replace(/"/g, '""')}"`;
  const headers = Object.keys(rows[0] || {});
  const out = [headers.join(",")];
  for (const r of rows) out.push(headers.map((h) => esc(r[h])).join(","));
  return out.join("\r\n");
}

export async function GET(req) {
  await dbConnect();
  const session = await getServerSession();
  if (!session?.user?.email || !isAllowed(session.user.email))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") || "deliveries";
  const type = searchParams.get("type") || "";

  if (kind === "deliveries") {
    const filter = type ? { type } : {};
    const items = await Delivery.find(filter)
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();
    const rows = items.map((i) => ({
      waktu: i.createdAt?.toISOString(),
      to: i.to,
      type: i.type,
      status: i.status,
      subject: i.subject,
      itemCount: Array.isArray(i.itemIds) ? i.itemIds.length : 0,
      snippet: (i.bodyRenderedSnapshot || "").slice(0, 200),
    }));
    const csv = toCSV(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="deliveries.csv"',
      },
    });
  }

  if (kind === "imports") {
    const filter = type ? { type } : {};
    const items = await ImportLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();
    const rows = items.map((i) => ({
      waktu: i.createdAt?.toISOString(),
      type: i.type,
      file: i.fileName,
      inserted: i.inserted,
      failed: i.failed,
    }));
    const csv = toCSV(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="imports.csv"',
      },
    });
  }

  return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
}
