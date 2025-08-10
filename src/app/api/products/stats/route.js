import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/db";
import { isAllowed } from "@/lib/auth";
import Product from "@/models/Product";

export async function GET(req) {
  await dbConnect();

  const session = await getServerSession();
  if (!session?.user?.email || !isAllowed(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  async function statsFor(t) {
    const total = await Product.countDocuments({ type: t });
    const available = await Product.countDocuments({
      type: t,
      status: "available",
    });
    const sent = total - available;
    return { type: t, total, available, sent };
  }

  if (type) {
    const s = await statsFor(type);
    return NextResponse.json(s);
  } else {
    const [akun, link, akses] = await Promise.all([
      statsFor("Akun"),
      statsFor("Link"),
      statsFor("Akses"),
    ]);
    return NextResponse.json({ Akun: akun, Link: link, Akses: akses });
  }
}
