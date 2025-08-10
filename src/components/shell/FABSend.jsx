"use client";
import Link from "next/link";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function FABSend() {
  return (
    <Link
      href="/admin/kirim-pesanan"
      className="md:hidden fixed bottom-16 right-4 bg-primary text-white h-14 w-14 rounded-full flex items-center justify-center shadow-xl hover:brightness-95"
    >
      <PaperAirplaneIcon className="h-6" />
    </Link>
  );
}
