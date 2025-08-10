"use client";

import { useEffect, useMemo, useState } from "react";

const LIMIT = 20;

export default function RiwayatPage() {
  const [tab, setTab] = useState("deliveries"); // 'deliveries' | 'imports'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState("");
  const [queryEmail, setQueryEmail] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // detail modal state
  const [openDetail, setOpenDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("kind", tab);
    p.set("limit", String(LIMIT));
    p.set("skip", String((page - 1) * LIMIT));
    if (category) p.set("type", category);
    if (queryEmail) p.set("q", queryEmail);
    return p.toString();
  }, [tab, page, category, queryEmail]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?${params}`, { cache: "no-store" });
      const data = await res.json();
      const arr = Array.isArray(data.items) ? data.items : data;
      setItems(arr);
      setHasMore(arr.length === LIMIT);
    } catch {
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [params]);

  function applyFilter(e) {
    e?.preventDefault();
    setPage(1);
    load();
  }

  const exportHref = useMemo(() => {
    const ep = new URLSearchParams();
    ep.set("kind", tab);
    if (category) ep.set("type", category);
    return `/api/history/export?${ep.toString()}`;
  }, [tab, category]);

  // --- actions ---
  async function openDetailModal(id) {
    setBusy(true);
    try {
      const res = await fetch(`/api/history/${id}`, { cache: "no-store" });
      const data = await res.json();
      setDetail(data);
      setOpenDetail(true);
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(id) {
    if (!confirm("Hapus riwayat ini? Tindakan ini tidak dapat dibatalkan."))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x._id !== id));
        setOpenDetail(false);
      } else {
        alert("Gagal menghapus.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function restoreAccount(id) {
    if (!confirm("Pulihkan akun dari riwayat ini? Item akan tersedia kembali."))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/history/${id}/restore`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`Berhasil dipulihkan (${data.restored} item).`);
        setOpenDetail(false);
      } else {
        alert(data?.error || "Gagal memulihkan.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Riwayat</h1>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setTab("deliveries");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl border ${
            tab === "deliveries"
              ? "bg-white shadow"
              : "bg-slate-100 hover:bg-white"
          }`}
        >
          Email Terkirim
        </button>
        <button
          onClick={() => {
            setTab("imports");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl border ${
            tab === "imports"
              ? "bg-white shadow"
              : "bg-slate-100 hover:bg-white"
          }`}
        >
          Impor Produk
        </button>
        <a
          href={exportHref}
          className="ml-auto px-4 py-2 rounded-xl border bg-white hover:bg-slate-50"
        >
          Export CSV
        </a>
      </div>

      <form
        onSubmit={applyFilter}
        className="flex flex-wrap gap-3 items-center"
      >
        <div>
          <label className="text-sm text-slate-600">Kategori</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="block rounded-xl border px-3 py-2 bg-white"
          >
            <option value="">Semua</option>
            <option>Link</option>
            <option>Akun</option>
            <option>Akses</option>
          </select>
        </div>
        {tab === "deliveries" && (
          <div className="flex-1 min-w-[220px]">
            <label className="text-sm text-slate-600">
              Cari (email tujuan)
            </label>
            <input
              value={queryEmail}
              onChange={(e) => setQueryEmail(e.target.value)}
              placeholder="email tujuan…"
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>
        )}
        <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
          Terapkan
        </button>
      </form>

      {loading ? (
        <div className="p-6 text-slate-500">Memuat…</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-slate-500">Belum ada data.</div>
      ) : tab === "deliveries" ? (
        <DeliveriesList
          items={items}
          onDetail={openDetailModal}
          onDelete={deleteItem}
        />
      ) : (
        <ImportsList items={items} />
      )}

      <div className="flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-2 rounded-xl border bg-white disabled:opacity-50"
        >
          Sebelumnya
        </button>
        <div className="text-sm text-slate-600">Halaman {page}</div>
        <button
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-2 rounded-xl border bg-white disabled:opacity-50"
        >
          Berikutnya
        </button>
      </div>

      {/* Modal Detail */}
      {openDetail && detail && (
        <DetailModal
          data={detail}
          onClose={() => setOpenDetail(false)}
          onDelete={() => deleteItem(detail._id)}
          onRestore={() => restoreAccount(detail._id)}
          busy={busy}
        />
      )}
    </div>
  );
}

/* ---------- List Deliveries ---------- */
function DeliveriesList({ items, onDetail, onDelete }) {
  return (
    <>
      {/* Desktop */}
      <table className="hidden md:table w-full text-sm bg-white rounded-2xl overflow-hidden border">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="text-left p-3">Waktu</th>
            <th className="text-left p-3">Kepada</th>
            <th className="text-left p-3">Kategori</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Item</th>
            <th className="text-left p-3">Cuplikan</th>
            <th className="text-left p-3 w-32">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it._id} className="border-t">
              <td className="p-3">{fmtDate(it.createdAt)}</td>
              <td className="p-3">{it.to}</td>
              <td className="p-3">{it.type}</td>
              <td className="p-3">
                <StatusBadge status={it.status} />
              </td>
              <td className="p-3">
                {Array.isArray(it.itemIds) ? it.itemIds.length : 0}
              </td>
              <td className="p-3 text-slate-700">
                {(it.bodyRenderedSnapshot || "").slice(0, 120)}
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onDetail(it._id)}
                    className="px-2 py-1 rounded-lg border bg-white hover:bg-slate-50"
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => onDelete(it._id)}
                    className="px-2 py-1 rounded-lg border bg-white hover:bg-red-50 text-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {items.map((it) => (
          <div key={it._id} className="bg-white rounded-2xl border p-4">
            <div className="flex justify-between items-center">
              <div className="font-medium">{it.to}</div>
              <StatusBadge status={it.status} />
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {fmtDate(it.createdAt)} • {it.type} •{" "}
              {Array.isArray(it.itemIds) ? it.itemIds.length : 0} item
            </div>
            <div className="text-sm text-slate-700 mt-2">
              {(it.bodyRenderedSnapshot || "").slice(0, 140)}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onDetail(it._id)}
                className="px-3 py-2 rounded-xl border bg-white"
              >
                Detail
              </button>
              <button
                onClick={() => onDelete(it._id)}
                className="px-3 py-2 rounded-xl border bg-white text-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- List Imports ---------- */
function ImportsList({ items }) {
  return (
    <>
      <table className="hidden md:table w-full text-sm bg-white rounded-2xl overflow-hidden border">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="text-left p-3">Waktu</th>
            <th className="text-left p-3">Tipe</th>
            <th className="text-left p-3">File</th>
            <th className="text-left p-3">Inserted</th>
            <th className="text-left p-3">Failed</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it._id} className="border-t">
              <td className="p-3">{fmtDate(it.createdAt)}</td>
              <td className="p-3">{it.type}</td>
              <td className="p-3">{it.fileName || "-"}</td>
              <td className="p-3">{it.inserted ?? 0}</td>
              <td className="p-3">{it.failed ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="md:hidden space-y-3">
        {items.map((it) => (
          <div key={it._id} className="bg-white rounded-2xl border p-4">
            <div className="flex justify-between">
              <div className="font-medium">{it.type}</div>
              <div className="text-xs text-slate-500">
                {fmtDate(it.createdAt)}
              </div>
            </div>
            <div className="text-sm text-slate-700 mt-2">
              {it.fileName || "-"}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Inserted: {it.inserted ?? 0} • Failed: {it.failed ?? 0}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Modal Detail ---------- */
function DetailModal({ data, onClose, onDelete, onRestore, busy }) {
  const items = data.items || [];
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold">Detail Pengiriman</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3">
          <Row label="Waktu" value={fmtDate(data.createdAt)} />
          <Row label="Kepada" value={data.to} />
          <Row label="Kategori" value={data.type} />
          <Row label="Status" value={<StatusBadge status={data.status} />} />
          <Row label="Item" value={(data.itemIds?.length || 0) + " item"} />

          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">
              Produk
            </div>
            <ul className="space-y-2 text-sm">
              {items.length === 0 ? (
                <li className="text-slate-500">-</li>
              ) : (
                items.map((p) => (
                  <li key={p._id} className="p-3 rounded-xl border bg-white">
                    {p.type === "Link" && (
                      <>
                        <div className="font-medium">
                          {p.attributes?.namaProduk}
                        </div>
                        <div className="text-slate-600 break-all">
                          {p.attributes?.linkProduk}
                        </div>
                      </>
                    )}
                    {p.type === "Akses" && (
                      <div className="font-medium">
                        {p.attributes?.namaProduk}
                      </div>
                    )}
                    {p.type === "Akun" && (
                      <div className="font-medium">
                        {p.attributes?.namaProdukAkun}
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="px-5 py-3 border-t flex flex-col md:flex-row gap-2 md:justify-between">
          <div className="text-xs text-slate-500">
            ID: {data._id}
            {data.restoredAt
              ? ` • Dipulihkan: ${fmtDate(data.restoredAt)}`
              : ""}
          </div>
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={onDelete}
              className="px-4 py-2 rounded-xl border bg-white hover:bg-red-50 text-red-600 disabled:opacity-50"
            >
              Hapus
            </button>
            {data.type === "Akun" && (
              <button
                disabled={busy}
                onClick={onRestore}
                className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
              >
                Pulihkan
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border bg-white"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-4 text-sm">
      <div className="w-28 text-slate-500">{label}</div>
      <div className="flex-1">{value}</div>
    </div>
  );
}

/* ---------- Helpers ---------- */
function fmtDate(s) {
  try {
    return new Date(s).toLocaleString();
  } catch {
    return "-";
  }
}
function StatusBadge({ status }) {
  const ok = status === "sent";
  const cls = ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs ${cls}`}>{status}</span>
  );
}
