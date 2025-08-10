"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton({ className = "" }) {
  return (
    <button
      onClick={() => signOut()}
      className={`px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 ${className}`}
      title="Keluar"
    >
      Keluar
    </button>
  );
}
