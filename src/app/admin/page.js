export default function AdminHome() {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href="/admin/kirim-pesanan"
          className="block rounded-2xl border p-5 bg-white hover:shadow-md transition"
        >
          <div className="text-lg font-semibold mb-1">Kirim Pesanan</div>
          <p className="text-sm text-slate-600">
            Kirim email ke pembeli dengan template.
          </p>
        </a>
        <a
          href="/admin/pengaturan"
          className="block rounded-2xl border p-5 bg-white hover:shadow-md transition"
        >
          <div className="text-lg font-semibold mb-1">Pengaturan</div>
          <p className="text-sm text-slate-600">
            Import CSV, kelola produk & template.
          </p>
        </a>
        <a
          href="/admin/riwayat"
          className="block rounded-2xl border p-5 bg-white hover:shadow-md transition"
        >
          <div className="text-lg font-semibold mb-1">Riwayat</div>
          <p className="text-sm text-slate-600">
            Lihat email terkirim & log impor.
          </p>
        </a>
      </div>
    </div>
  );
}
