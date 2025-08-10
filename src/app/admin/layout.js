import { getServerSession } from "next-auth";
import Link from "next/link";
import { isAllowed } from "@/lib/auth";

export const dynamic = "force-dynamic"; // aman untuk halaman admin

export default async function AdminLayout({ children }) {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email || !isAllowed(email)) {
    return (
      <main className="p-10 text-center">
        Tidak diizinkan.{" "}
        <Link href="/" className="text-blue-600 underline">
          Kembali
        </Link>
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
          <div className="ml-auto text-sm text-slate-500">{email}</div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
}
