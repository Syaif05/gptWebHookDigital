"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const items = [
  { href: "/admin", label: "Home", Icon: HomeIcon },
  { href: "/admin/kirim-pesanan", label: "Kirim", Icon: PaperAirplaneIcon },
  { href: "/admin/pengaturan", label: "Atur", Icon: Cog6ToothIcon },
  { href: "/admin/riwayat", label: "Riwayat", Icon: ClockIcon },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur border-t">
      <div className="max-w-xl mx-auto grid grid-cols-4">
        {items.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center py-2 text-xs"
          >
            <Icon
              className={`h-6 ${
                path.startsWith(href) ? "text-primary" : "text-slate-500"
              }`}
            />
            <span
              className={`${
                path.startsWith(href) ? "text-primary" : "text-slate-600"
              }`}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
