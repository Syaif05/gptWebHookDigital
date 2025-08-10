import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/db";
import { isAllowed } from "@/lib/auth";
import Delivery from "@/models/Delivery";
import Product from "@/models/Product";
import mongoose from "mongoose";

// DETAIL
export async function GET(_req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAllowed(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const d = await Delivery.findById(id).lean();
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await Product.find(
    { _id: { $in: d.itemIds || [] } },
    { type: 1, attributes: 1 }
  ).lean();
  return NextResponse.json({ ...d, items });
}

// HAPUS
export async function DELETE(_req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAllowed(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await Delivery.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
