import "./globals.css";
import Providers from "./providers";

export const metadata = { title: "Hook Digital" };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
