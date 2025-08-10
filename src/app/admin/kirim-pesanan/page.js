"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";

const SUBJECT_DEFAULT = "Pengiriman Pesanan Hook Digital";

function makePreviewBody(type, customerName, items) {
  // Render preview sederhana (tanpa Handlebars) -> sesuai default template
  if (type === "Link") {
    const lines = [
      `Halo ${customerName || "(nama pelanggan)"}.\n`,
      "Pengiriman pesanan dari Hook Digital Berikut Link produk yang dibeli.",
      "",
    ];
    if (items.length === 0) {
      lines.push("(Produk tanpa nama)\nLink : -", "");
    } else {
      for (const it of items) {
        const a = it.attributes || {};
        const title = it.title || a.namaProduk || "(Produk tanpa nama)";
        const link = a.linkProduk || a.link || a.url || "-";
        lines.push(title);
        lines.push(`Link : ${link}`);
        lines.push("");
      }
    }
    lines.push(
      "Terimakasih sudah memesan produk dari toko kami, Jangan lupa konfirmasi ke chat Shopee bahwa Produk sudah diterima."
    );
    return lines.join("\n");
  }

  if (type === "Akses") {
    const lines = [
      `Halo ${customerName || "(nama pelanggan)"}.\n`,
      "Pengiriman pesanan dari Hook Digital Produk yang dibeli.",
      "",
    ];
    if (items.length === 0) {
      lines.push("Pembelian Produk : (Produk tanpa nama)");
    } else {
      for (const it of items) {
        const a = it.attributes || {};
        const title = it.title || a.namaProduk || "(Produk tanpa nama)";
        lines.push(`Pembelian Produk : ${title}`);
      }
    }
    lines.push(
      "",
      "Terimakasih sudah memesan produk dari toko kami, Jangan lupa konfirmasi ke chat Shopee bahwa Produk sudah diterima."
    );
    return lines.join("\n");
  }

  // Akun → catatan: stok dipilih otomatis saat kirim
  const lines = [
    `Halo ${customerName || "(nama pelanggan)"}.\n`,
    "Pengiriman pesanan dari Hook Digital Berikut Akun produk yang dibeli.",
    "",
    "(Akun akan dipilih otomatis saat menekan Kirim)",
    "",
    "Password otomatis minta ganti setelah berhasil login.",
    "Terimakasih sudah memesan produk dari toko kami, Jangan lupa konfirmasi ke chat Shopee bahwa Produk sudah diterima.",
  ];
  return lines.join("\n");
}

export default function KirimPesananPage() {
  const { data: session } = useSession();

  const [kategori, setKategori] = useState("Link"); // Link | Akun | Akses
  const [to, setTo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState([]); // [{_id,title,attributes}]
  const [stock, setStock] = useState({ available: 0, total: 0 }); // hanya utk Akun

  const [selected, setSelected] = useState(new Map()); // id:boolean

  // fetch daftar produk tersedia
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setSelected(new Map());
      try {
        const res = await fetch(
          `/api/products/available?type=${encodeURIComponent(kategori)}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!cancelled) {
          setAvailable(Array.isArray(json.items) ? json.items : []);
          setStock(json.stock || { available: 0, total: 0 });
        }
      } catch (e) {
        if (!cancelled) {
          setAvailable([]);
          setStock({ available: 0, total: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [kategori]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter((it) => {
      const a = it.attributes || {};
      const txt = `${it.title || ""} ${
        a.linkProduk || a.link || a.url || ""
      }`.toLowerCase();
      return txt.includes(q);
    });
  }, [available, query]);

  const selectedItems = useMemo(() => {
    const ids = new Set(
      [...selected.entries()].filter(([, v]) => v).map(([k]) => k)
    );
    return available.filter((it) => ids.has(it._id));
  }, [selected, available]);

  const subjectPreview = SUBJECT_DEFAULT;
  const bodyPreview = useMemo(
    () => makePreviewBody(kategori, customerName, selectedItems),
    [kategori, customerName, selectedItems]
  );

  async function handleSend(e) {
    e.preventDefault();
    if (!to) return alert("Email tujuan wajib diisi.");
    if (kategori !== "Akun" && selectedItems.length === 0) {
      return alert("Pilih minimal 1 produk.");
    }

    const payload = {
      to,
      customerName,
      type: kategori,
      itemIds: kategori === "Akun" ? [] : selectedItems.map((i) => i._id),
    };

    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      if (json?.error) alert(json.error);
      else alert("Gagal mengirim.");
      return;
    }

    if (json.limitReached) {
      // batas harian penuh → tampilkan preview utk di-copy manual
      alert(
        `Batas kirim harian sudah tercapai (${json.used}/${json.limit}). Teks email akan ditampilkan di preview untuk di-copy manual.`
      );
      return;
    }

    alert("Terkirim!");
    // Reset pilihan (untuk Link/Akses)
    setSelected(new Map());
  }

  function toggle(id) {
    setSelected((prev) => {
      const p = new Map(prev);
      p.set(id, !p.get(id));
      return p;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Kolom kiri */}
      <form
        onSubmit={handleSend}
        className="bg-white/70 backdrop-blur rounded-2xl border p-4 md:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Kirim Pesanan</h1>
          <div className="text-sm text-slate-500">{session?.user?.email}</div>
        </div>

        <label className="block text-sm font-medium mb-1">Kategori</label>
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="w-full mb-4 rounded-lg border px-3 py-2"
        >
          <option>Link</option>
          <option>Akun</option>
          <option>Akses</option>
        </select>

        <label className="block text-sm font-medium mb-1">Email Tujuan</label>
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="contoh@pelanggan.com"
          className="w-full mb-4 rounded-lg border px-3 py-2"
        />

        <label className="block text-sm font-medium mb-1">
          Nama Pembeli (customerName)
        </label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nama pelanggan"
          className="w-full mb-6 rounded-lg border px-3 py-2"
        />

        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Kirim Email
        </button>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-slate-500 text-sm hover:underline"
          >
            Keluar
          </button>
        </div>
      </form>

      {/* Kolom kanan */}
      <div className="space-y-6">
        <div className="bg-white/70 backdrop-blur rounded-2xl border p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="font-medium">
              Pilih Produk{" "}
              <span className="text-slate-500">
                ({kategori === "Akun" ? "Akun" : kategori})
              </span>
            </div>
            {kategori === "Akun" && (
              <div className="ml-auto text-sm text-slate-600">
                Stok Akun:{" "}
                <span className="font-medium">
                  {stock.available}/{stock.total}
                </span>
              </div>
            )}
            <input
              placeholder="Cari..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ml-auto rounded-lg border px-3 py-2 w-48"
            />
          </div>

          {/* List produk (Link & Akses) */}
          {kategori !== "Akun" ? (
            <div className="max-h-[420px] overflow-auto pr-1 space-y-2">
              {loading && (
                <div className="text-sm text-slate-500">Memuat...</div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="text-sm text-slate-500">Tidak ada data.</div>
              )}

              {filtered.map((it) => {
                const a = it.attributes || {};
                const title = it.title || a.namaProduk || "(Produk)";
                const checked = !!selected.get(it._id);
                return (
                  <label
                    key={it._id}
                    className={`flex items-start gap-3 rounded-xl border px-3 py-3 cursor-pointer ${
                      checked ? "bg-blue-50 border-blue-200" : "bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(it._id)}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">
                        {title}
                      </div>
                      {a.linkProduk && (
                        <div className="text-xs text-slate-500 truncate">
                          {a.linkProduk}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              Untuk kategori <b>Akun</b>, stok akan dipilih otomatis saat
              menekan tombol <b>Kirim Email</b>.
            </div>
          )}

          {kategori !== "Akun" && (
            <div className="mt-3 text-right text-sm text-slate-500">
              Dipilih: {selectedItems.length} item
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white/70 backdrop-blur rounded-2xl border p-4 md:p-6">
          <div className="font-medium mb-2">Preview</div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            value={subjectPreview}
            readOnly
            className="w-full rounded-lg border px-3 py-2 mb-3 bg-slate-50"
          />
          <label className="block text-sm font-medium mb-1">Body</label>
          <textarea
            value={bodyPreview}
            readOnly
            rows={12}
            className="w-full rounded-lg border px-3 py-2 font-mono text-sm bg-slate-50"
          />
        </div>
      </div>
    </div>
  );
}
