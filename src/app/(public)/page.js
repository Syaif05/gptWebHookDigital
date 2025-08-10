// src/app/(public)/page.js  (server component)
import Link from "next/link";

export const dynamic = "force-static"; // aman untuk build

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-8 border">
        <h1 className="text-2xl font-bold mb-4">Hook Digital</h1>
        <p className="text-slate-600 mb-6">Panel pengiriman produk digital.</p>

        {/* langsung panggil NextAuth sign-in (tanpa hooks) */}
        <a
          href="/api/auth/signin/google?callbackUrl=/admin"
          className="block text-center py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Login dengan Google
        </a>
      </div>
    </main>
  );
}
