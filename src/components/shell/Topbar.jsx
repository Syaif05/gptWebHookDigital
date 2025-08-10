"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const tabs = [
  { href: "/admin/kirim-pesanan", label: "Kirim" },
  { href: "/admin/pengaturan", label: "Pengaturan" },
  { href: "/admin/riwayat", label: "Riwayat" },
];

export default function Topbar({ userEmail }) {
  const path = usePathname();
  return (
    <nav className="hidden md:block sticky top-0 z-30 bg-white/70 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.svg" width={28} height={28} alt="logo" />
          <span className="font-semibold">Hook Digital</span>
        </Link>
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`px-3 py-2 rounded-xl hover:bg-slate-100 ${
                path.startsWith(t.href)
                  ? "bg-slate-100 text-black"
                  : "text-slate-600"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto text-sm text-slate-500">{userEmail}</div>
      </div>
    </nav>
  );
}
