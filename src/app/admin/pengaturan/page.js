"use client";

import { useEffect, useRef, useState } from "react";

const TYPES = ["Link", "Akun", "Akses"];

const CSV_TEMPLATES = {
  Link: "Nama Produk,Link Produk\nProduk 1,https://contoh.com/a\n",
  Akun: "Nama Produk Akun,Email Produk,Password Produk\nAkun A,user@example.com,passA\n",
  Akses: "Nama Produk\nVIP Pass\n",
};

export default function PengaturanPage() {
  // ==== IMPORT CSV ====
  const [impType, setImpType] = useState("Link");
  const [impBusy, setImpBusy] = useState(false);
  const [impResult, setImpResult] = useState(null);
  const fileRef = useRef(null);

  async function doImport(e) {
    e.preventDefault();
    if (!fileRef.current?.files?.[0]) return;
    setImpBusy(true);
    setImpResult(null);
    try {
      const fd = new FormData();
      fd.append("type", impType);
      fd.append("file", fileRef.current.files[0]);
      const res = await fetch("/api/products/import", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) setImpResult({ error: data.error || "Gagal import" });
      else setImpResult(data);
    } catch (err) {
      setImpResult({ error: String(err) });
    } finally {
      setImpBusy(false);
      // clear file input
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function downloadTemplate(type) {
    const blob = new Blob([CSV_TEMPLATES[type]], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `template_${type.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ==== TEMPLATE EDITOR ====
  const [tpls, setTpls] = useState([]);
  const [tplBusy, setTplBusy] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  async function loadTemplates() {
    const res = await fetch("/api/templates");
    const data = await res.json();
    setTpls(data.templates || []);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function saveTemplate(idx) {
    setTplBusy(true);
    setSaveMsg("");
    const t = tpls[idx];
    const res = await fetch("/api/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: t.type, subject: t.subject, body: t.body }),
    });
    const data = await res.json();
    setTplBusy(false);
    setSaveMsg(res.ok ? "Tersimpan." : data.error || "Gagal simpan");
  }

  async function resetTemplate(idx) {
    setTplBusy(true);
    setSaveMsg("");
    const t = tpls[idx];
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: t.type, action: "reset" }),
    });
    const data = await res.json();
    setTplBusy(false);
    if (res.ok) {
      // refresh data lokal
      setTpls((prev) => prev.map((p, i) => (i === idx ? data.template : p)));
      setSaveMsg("Di-reset ke default.");
    } else setSaveMsg(data.error || "Gagal reset");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Pengaturan</h1>

      {/* === CARD: Import Produk === */}
      <section className="bg-white rounded-2xl border p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">Import Produk (CSV)</h2>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => downloadTemplate(t)}
                className="text-sm px-3 py-1.5 border rounded-lg hover:bg-slate-50"
              >
                Template {t}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={doImport}
          className="grid sm:grid-cols-3 gap-4 items-center"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select
              value={impType}
              onChange={(e) => setImpType(e.target.value)}
              className="w-full rounded-xl border p-2"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">File CSV</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="w-full rounded-xl border p-2"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              disabled={impBusy || !fileRef.current?.files?.length}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
            >
              {impBusy ? "Mengimpor..." : "Import"}
            </button>
          </div>
        </form>

        {!!impResult && (
          <div className="mt-4">
            {impResult.error ? (
              <div className="text-red-600 text-sm">{impResult.error}</div>
            ) : (
              <div className="text-sm">
                <div className="font-medium">Hasil import:</div>
                <ul className="list-disc ml-5">
                  <li>
                    Berhasil masuk: <b>{impResult.inserted}</b>
                  </li>
                  <li>
                    Gagal: <b>{impResult.failed}</b>
                  </li>
                </ul>
                {Array.isArray(impResult.errors) &&
                  impResult.errors.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium">Detail error:</div>
                      <div className="max-h-40 overflow-auto border rounded-lg p-2 text-xs bg-slate-50">
                        {impResult.errors.map((e, i) => (
                          <div key={i}>
                            Baris {e.row}: {e.msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-xs text-slate-600">
          <div className="font-medium mb-1">Format header:</div>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              <b>Link</b>: <code>Nama Produk, Link Produk</code>
            </li>
            <li>
              <b>Akun</b>:{" "}
              <code>Nama Produk Akun, Email Produk, Password Produk</code>{" "}
              (email & password akan dienkripsi di server)
            </li>
            <li>
              <b>Akses</b>: <code>Nama Produk</code>
            </li>
          </ul>
        </div>
      </section>

      {/* === CARD: Template Email === */}
      <section className="bg-white rounded-2xl border p-5">
        <h2 className="text-lg font-semibold mb-4">Template Email</h2>

        {tpls.length === 0 ? (
          <div className="text-sm text-slate-500">Memuat template…</div>
        ) : (
          <div className="space-y-6">
            {tpls.map((t, idx) => (
              <div key={t._id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{t.type}</div>
                  <div className="text-xs text-slate-500">
                    Subject: Pengiriman Pesanan Hook Digital (default)
                  </div>
                </div>

                <label className="block text-sm font-medium mb-1">Body</label>
                <textarea
                  value={t.body}
                  onChange={(e) => {
                    setSaveMsg("");
                    setTpls((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, body: e.target.value } : p
                      )
                    );
                  }}
                  rows={t.type === "Akun" ? 10 : 8}
                  className="w-full rounded-xl border p-2 font-mono text-sm"
                />

                <div className="mt-3 flex gap-2">
                  <button
                    disabled={tplBusy}
                    onClick={() => saveTemplate(idx)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                  >
                    {tplBusy ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    disabled={tplBusy}
                    onClick={() => resetTemplate(idx)}
                    className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    Reset ke Default
                  </button>
                </div>
              </div>
            ))}

            {saveMsg && <div className="text-sm text-green-700">{saveMsg}</div>}
          </div>
        )}
      </section>
    </div>
  );
}
