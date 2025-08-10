import Link from "next/link";
import { getServerSession } from "next-auth";
import { isAllowed } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  const session = await getServerSession();

  if (!session?.user?.email || !isAllowed(session.user.email)) {
    return (
      <main className="min-h-screen grid place-items-center p-10">
        <div className="text-center space-y-4">
          <p className="text-slate-700">Tidak diizinkan.</p>
          <Link href="/" className="text-blue-600 underline">
            Kembali
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link href="/admin" className="font-semibold">
            Hook Digital
          </Link>
          <Link
            href="/admin/kirim-pesanan"
            className="text-slate-700 hover:text-black"
          >
            Kirim
          </Link>
          <Link
            href="/admin/pengaturan"
            className="text-slate-700 hover:text-black"
          >
            Pengaturan
          </Link>
          <Link
            href="/admin/riwayat"
            className="text-slate-700 hover:text-black"
          >
            Riwayat
          </Link>
          <div className="ml-auto text-sm text-slate-500">
            {session.user.email}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
}
