import Handlebars from "handlebars";

export function renderTemplate(type, tplBody, params) {
  // params: { customerName, items: [{...}], brand: 'Hook Digital' }
  const compiled = Handlebars.compile(tplBody);
  return compiled(params);
}

export const SUBJECT_DEFAULT = "Pengiriman Pesanan Hook Digital";

export const DEFAULT_BODIES = {
  Link: `Halo {{customerName}}.
Pengiriman pesanan dari Hook Digital Berikut Link produk yang dibeli.

{{#each items}}
{{this.namaProduk}}
Link : {{this.linkProduk}}

{{/each}}
Terimakasih sudah memesan produk dari toko kami, Jangan lupa konfirmasi ke chat Shopee bahwa Produk sudah diterima.`,
  Akun: `Halo {{customerName}}.
Pengiriman pesanan dari Hook Digital Berikut Akun produk yang dibeli.

{{#each items}}
{{this.namaProdukAkun}}
Email : {{this.emailProduk}}
Password : {{this.passwordProduk}}

{{/each}}
Password otomatis minta ganti setelah berhasil login.
Terimakasih sudah memesan produk dari toko kami, Jangan lupa konfirmasi ke chat Shopee bahwa Produk sudah diterima.`,
  Akses: `Halo {{customerName}}.
Pengiriman pesanan dari Hook Digital Produk yang dibeli.

{{#each items}}
Pembelian Produk : {{this.namaProduk}}
{{/each}}

Terimakasih sudah memesan produk dari toko kami, Jangan lupa konfirmasi ke chat Shopee bahwa Produk sudah diterima.`,
};
