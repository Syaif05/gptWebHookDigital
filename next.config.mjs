/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true }, // <— lewati lint saat build prod
  experimental: {
    // opsi kamu yang lain
    allowedDevOrigins: process.env.NEXTAUTH_URL
      ? [process.env.NEXTAUTH_URL]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  experimental: {
    // hilangkan warning dev saat akses via IP (opsional)
    allowedDevOrigins: process.env.NEXTAUTH_URL
      ? [process.env.NEXTAUTH_URL]
      : [],
  },
};
export default nextConfig;
