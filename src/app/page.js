"use client";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-slate-200">
        <h1 className="text-2xl font-bold mb-2">Hook Digital</h1>
        <p className="text-slate-600 mb-6">Panel pengiriman produk digital.</p>
        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="w-full py-3 rounded-xl bg-black text-white hover:bg-slate-800"
          >
            Login dengan Google
          </button>
        ) : (
          <Link
            href="/admin"
            className="w-full inline-block text-center py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Buka Admin
          </Link>
        )}
      </div>
    </main>
  );
}
