import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import { isAllowed } from "@/lib/auth";
import Delivery from "@/models/Delivery";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function POST(_req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAllowed(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const d = await Delivery.findById(id);
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (d.type !== "Akun") {
    return NextResponse.json(
      { error: "Hanya riwayat tipe Akun yang bisa dipulihkan" },
      { status: 400 }
    );
  }

  await Product.updateMany(
    { _id: { $in: d.itemIds || [] } },
    {
      $set: { status: "available" },
      $unset: { usedAt: 1, usedByDeliveryId: 1 },
    }
  );

  d.set("restoredAt", new Date());
  await d.save();

  return NextResponse.json({ ok: true, restored: d.itemIds?.length || 0 });
}
