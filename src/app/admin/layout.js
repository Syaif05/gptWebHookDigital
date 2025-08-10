import { getServerSession } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import { isAllowed } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const metadata = { title: "Hook Digital — Admin" };

export default async function AdminLayout({ children }) {
  const session = await getServerSession();
  if (!session?.user?.email || !isAllowed(session.user.email)) {
    return (
      <main className="min-h-screen grid place-items-center p-10">
        <div className="text-center">
          <p className="mb-4">Akses ditolak.</p>
          <a href="/" className="text-blue-600 underline">
            Kembali
          </a>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Topbar (desktop) */}
      <nav className="hidden md:block sticky top-0 z-30 glass">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            {/* taruh logo di /public/logo.svg */}
            <Image src="/logo.svg" alt="Hook Digital" width={28} height={28} />
            <span className="font-semibold">Hook Digital</span>
          </Link>
          <div className="flex items-center gap-1">
            <NavTab href="/admin/kirim-pesanan" label="Kirim" />
            <NavTab href="/admin/pengaturan" label="Pengaturan" />
            <NavTab href="/admin/riwayat" label="Riwayat" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="text-sm text-slate-600">{session.user.email}</div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Konten */}
      <main className="max-w-6xl mx-auto px-4 py-5 pb-24 md:pb-10">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 glass">
        <div className="max-w-xl mx-auto grid grid-cols-3 text-sm">
          <a href="/admin/kirim-pesanan" className="py-3 text-center">
            Kirim
          </a>
          <a href="/admin/pengaturan" className="py-3 text-center">
            Atur
          </a>
          <a href="/admin/riwayat" className="py-3 text-center">
            Riwayat
          </a>
        </div>
      </div>

      {/* FAB “Kirim” */}
      <a
        href="/admin/kirim-pesanan"
        className="md:hidden fixed bottom-20 right-4 bg-primary text-white h-14 w-14 rounded-full flex items-center justify-center shadow-xl"
        title="Kirim"
      >
        ✈️
      </a>
    </div>
  );
}

function NavTab({ href, label }) {
  // server component, active state via startsWith dari header (sederhana)
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700"
    >
      {label}
    </Link>
  );
}
