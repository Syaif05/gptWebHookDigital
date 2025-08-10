import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";

// Ambil nama produk dari berbagai kemungkinan key agar kompatibel dgn data lama
function nameFromAttrs(a = {}) {
  return (
    a.namaProduk ||
    a.namaProdukAkun ||
    a.nama ||
    a.productName ||
    a.title ||
    a.name ||
    a["Nama Produk"] ||
    a["Nama Produk Akun"] ||
    "(Produk)"
  );
}

function linkFromAttrs(a = {}) {
  return a.linkProduk || a.link || a.url || a["Link Produk"] || "";
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "Link").trim();

  await dbConnect();

  // Untuk Akun: UI hanya butuh stok (available/total)
  if (type === "Akun") {
    const [available, total] = await Promise.all([
      Product.countDocuments({ type: "Akun", status: "available" }),
      Product.countDocuments({ type: "Akun" }),
    ]);
    return NextResponse.json({ items: [], stock: { available, total } });
  }

  // Link & Akses: kirim daftar items + title yang sudah dinormalisasi
  const docs = await Product.find({ type, status: "available" })
    .select({ attributes: 1 })
    .sort({ createdAt: -1 })
    .lean();

  const items = docs.map((it) => {
    const a = it.attributes || {};
    return {
      _id: String(it._id),
      title: nameFromAttrs(a),
      // kirim kembali attributes agar preview bisa memakai linkProduk jika ada
      attributes: {
        ...a,
        linkProduk: linkFromAttrs(a),
      },
    };
  });

  return NextResponse.json({ items });
}
