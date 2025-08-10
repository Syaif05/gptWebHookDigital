// src/app/api/products/import/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import ImportLog from "@/models/ImportLog";
import { encrypt, sha1 } from "@/lib/crypto";

// ---------- CSV helpers (mendukung nilai ber-kutip "...")
function splitCsvLine(line) {
  // pisah koma yang berada DI LUAR tanda kutip
  const re = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/g;
  const parts = line.split(re).map((s) => {
    s = s.trim();
    if (s.startsWith('"') && s.endsWith('"')) {
      s = s.slice(1, -1).replace(/""/g, '"'); // unescape ""
    }
    return s;
  });
  return parts;
}

function parseCsv(text) {
  const rows = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((r) => r.trim() !== "");

  if (rows.length === 0) return { headers: [], data: [] };

  const headers = splitCsvLine(rows[0]).map((h) => h.trim());
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const cols = splitCsvLine(rows[i]);
    if (cols.every((c) => c === "")) continue; // skip baris kosong
    const obj = {};
    headers.forEach((h, idx) => (obj[h] = cols[idx] ?? ""));
    data.push({ __row: i + 1, ...obj }); // simpan nomor baris
  }
  return { headers, data };
}

// ---------- mapping header Indonesia -> key DB (case-insensitive)
const MAP_HEADERS = {
  Link: {
    "nama produk": "namaProduk",
    "link produk": "linkProduk",
  },
  Akun: {
    "nama produk akun": "namaProdukAkun",
    "email produk": "emailProduk",
    "password produk": "passwordProduk",
  },
  Akses: {
    "nama produk": "namaProduk",
  },
};

const REQUIRED = {
  Link: ["nama produk", "link produk"],
  Akun: ["nama produk akun", "email produk", "password produk"],
  Akses: ["nama produk"],
};

export async function POST(req) {
  await dbConnect();

  // --- ambil multipart form
  const form = await req.formData();
  const type = (form.get("type") || "").trim();
  const file = form.get("file");

  if (!["Link", "Akun", "Akses"].includes(type)) {
    return NextResponse.json(
      { error: "type harus Link/Akun/Akses" },
      { status: 400 }
    );
  }
  if (!file) {
    return NextResponse.json({ error: "file CSV tidak ada" }, { status: 400 });
  }

  const text = await file.text();
  const { headers, data } = parseCsv(text);

  if (!headers.length) {
    return NextResponse.json(
      { error: "CSV kosong / header tidak ditemukan" },
      { status: 400 }
    );
  }

  // normalisasi header ke huruf kecil
  const headersNorm = headers.map((h) => h.toLowerCase().trim());
  const required = REQUIRED[type];

  // cek header wajib
  const missing = required.filter((reqH) => !headersNorm.includes(reqH));
  if (missing.length) {
    return NextResponse.json(
      { error: `Header wajib belum lengkap: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const map = MAP_HEADERS[type];

  // ---------- rakit calon dokumen + fingerprint untuk dedup ----------
  const candidates = [];
  const fileDupSet = new Set(); // hindari duplikat di dalam file yang sama

  for (const row of data) {
    try {
      // bangun attributes dari header (match case-insensitive)
      const attrs = {};
      for (const [hLabel, key] of Object.entries(map)) {
        let val = "";
        for (const h of headers) {
          if (h.toLowerCase().trim() === hLabel) {
            val = (row[h] || "").trim();
            break;
          }
        }
        attrs[key] = val;
      }

      // validasi baris (kolom wajib)
      for (const reqH of required) {
        const key = map[reqH];
        if (!attrs[key]) throw new Error(`Kolom '${reqH}' kosong`);
      }

      // hitung fingerprint untuk dedup (pakai plaintext sebelum enkripsi)
      let fp = "";
      if (type === "Link") {
        const key = `${(attrs.namaProduk || "").toLowerCase()}|${(
          attrs.linkProduk || ""
        ).toLowerCase()}`;
        fp = "link:" + sha1(key);
      } else if (type === "Akses") {
        fp = "akses:" + sha1((attrs.namaProduk || "").toLowerCase());
      } else if (type === "Akun") {
        const emailPlain = (attrs.emailProduk || "").toLowerCase();
        fp = "akun:" + sha1(emailPlain);
      }

      // hindari duplikat dalam file yang sama
      if (fp && fileDupSet.has(fp)) continue;
      if (fp) fileDupSet.add(fp);

      candidates.push({ attrs, fp, rowNo: row.__row });
    } catch (e) {
      // catat error parsing baris
      errors.push({ row: row.__row, msg: String(e.message || e) });
    }
  }

  // ---------- cek duplikat yang sudah ada di DB (batch) ----------
  const fps = candidates.map((c) => c.fp).filter(Boolean);
  let existingSet = new Set();
  if (fps.length) {
    const existing = await Product.find(
      { fingerprint: { $in: fps } },
      { fingerprint: 1 }
    ).lean();
    existingSet = new Set(existing.map((x) => x.fingerprint));
  }

  // ---------- finalisasi dokumen + enkripsi untuk Akun ----------
  const docs = [];
  const results = { ok: true, inserted: 0, failed: 0, errors: [] };
  for (const cand of candidates) {
    try {
      if (cand.fp && existingSet.has(cand.fp)) continue; // skip duplikat di DB

      const attrs = { ...cand.attrs };

      if (type === "Akun") {
        // simpan terenkripsi
        const emailPlain = attrs.emailProduk;
        const passPlain = attrs.passwordProduk;
        attrs.emailProduk = encrypt(emailPlain);
        attrs.passwordProduk = encrypt(passPlain);
      }

      docs.push({
        type,
        attributes: attrs,
        fingerprint: cand.fp || undefined, // field opsional
        status: "available",
      });
    } catch (e) {
      results.failed++;
      results.errors.push({ row: cand.rowNo, msg: String(e.message || e) });
    }
  }

  // ---------- insert batch ----------
  if (docs.length) {
    await Product.insertMany(docs, { ordered: false });
    results.inserted = docs.length;
  }

  // ---------- log impor (maks 100 error agar dokumen tidak membengkak) ----------
  const trimmedErrors = (results.errors || []).slice(0, 100);
  await ImportLog.create({
    type,
    fileName: file.name || "upload.csv",
    inserted: results.inserted,
    failed: results.failed,
    errors: trimmedErrors,
  });

  return NextResponse.json(results);
}
