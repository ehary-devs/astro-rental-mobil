# PRD — Landing Page Rental Mobil (Pemesanan via WhatsApp)

| | |
|---|---|
| Status | Draft v0.1 |
| Tanggal | 10 November 2026 |
| Stack | Astro 7 full static + Cloudflare Workers Static Assets (lihat `AGENTS.md`) |
| Backend | Tidak ada (v1). Pemesanan diteruskan ke WhatsApp via link `wa.me` |

---

## 1. Ringkasan

Website satu halaman (plus beberapa halaman pendukung) untuk usaha rental mobil di Indonesia. Tujuannya mengubah pengunjung, kebanyakan dari Google dan media sosial lewat HP, menjadi chat WhatsApp yang **sudah berisi detail pesanan** (mobil, tanggal, durasi, lokasi, layanan). Admin tinggal konfirmasi ketersediaan dan harga di WhatsApp.

Kenapa WhatsApp, bukan booking online:
- Pelanggan Indonesia terbiasa nego dan tanya-tanya lewat WA sebelum bayar.
- Tidak perlu payment gateway, akun, atau database → biaya hosting nyaris nol dan permukaan serangan kecil.
- Admin bisa langsung verifikasi identitas (KTP/SIM) dan minta DP di chat.

## 2. Tujuan & metrik

| Tujuan | Metrik | Target 3 bulan pertama |
|---|---|---|
| Menghasilkan lead | Klik tombol WA (form + tombol mengambang) | ≥ 5% dari kunjungan |
| Lead berkualitas | % chat masuk yang sudah berisi mobil + tanggal | ≥ 70% |
| Ditemukan di Google | Peringkat untuk "rental mobil [kota]", "sewa mobil [kota]" | Halaman 1 untuk kota utama |
| Cepat di HP | Lighthouse mobile (Perf, A11y, BP, SEO) | ≥ 95 semua |
| Murah dijalankan | Biaya Cloudflare per bulan | Rp 0 (free tier, tanpa worker) |

## 3. Pengguna

| Persona | Kebutuhan | Yang dicari di halaman |
|---|---|---|
| **Wisatawan / perantau mudik** | Mobil + sopir untuk liburan atau mudik, sering rombongan keluarga | Pilihan 7-seater (Avanza, Innova, Hiace), harga all-in, area layanan, antar-jemput bandara/stasiun |
| **Warga lokal / lepas kunci** | Mobil harian untuk acara, kondangan, urusan kerja | Harga harian lepas kunci, syarat dokumen, deposit |
| **Korporat / instansi** | Sewa bulanan atau rombongan, butuh invoice | Paket bulanan, armada banyak, kontak resmi, faktur |

Asumsi perangkat: ≥ 80% mobile, sebagian koneksi 3G/4G lemah → halaman harus ringan.

## 4. Ruang lingkup

### Masuk v1
- Landing page `/` dengan semua section di §5.
- Katalog armada dari Content Collection (data di repo, di-build statis).
- Form pemesanan → membuka WhatsApp dengan pesan terisi otomatis.
- Tombol WhatsApp mengambang (floating) di semua halaman.
- Halaman pendukung: `/armada/[slug]` (detail mobil), `/syarat-ketentuan`, `/kebijakan-privasi`, `404`.
- SEO lokal: meta, OG, canonical, sitemap, robots.txt.
- Bahasa Indonesia saja.

### Tidak masuk v1 (kandidat v2)
- Pembayaran online, akun pelanggan, cek ketersediaan real-time.
- Dashboard admin / CMS (konten diubah lewat file di repo).
- Multi bahasa (English untuk turis asing).
- Halaman per kota (`/rental-mobil-[kota]`) untuk SEO.
- Blog / artikel.

## 5. Struktur halaman `/`

Urutan section dari atas ke bawah. Setiap section punya `id` untuk anchor link di navbar.

| # | Section | Isi | Catatan |
|---|---|---|---|
| 1 | **Header / navbar** | Logo, menu anchor (Armada, Layanan, Harga, FAQ, Kontak), tombol "Pesan via WA" | Sticky. Menu mobile pakai `<details>`/`<dialog>` atau script kecil; tanpa framework |
| 2 | **Hero** | Headline (mis. "Sewa Mobil [Kota] Mulai Rp300 Ribu/Hari"), sub-headline, 2 CTA: "Pesan Sekarang" (scroll ke form) dan "Chat WhatsApp" | Gambar hero = gambar LCP: `<Picture>`, `loading="eager"`, `fetchpriority="high"` |
| 3 | **Keunggulan (trust bar)** | 4–6 poin: armada terawat/tahun muda, sopir berpengalaman, harga transparan, siap 24 jam, antar-jemput, asuransi | Ikon SVG inline lewat komponen, bukan icon font |
| 4 | **Armada** | Kartu mobil: foto, nama, kapasitas penumpang, transmisi, bahan bakar, harga lepas kunci & dengan sopir per hari, tombol "Pesan mobil ini" | Tombol mengisi field mobil di form lalu scroll ke form. Filter (semua / MPV / SUV / city car / minibus) opsional |
| 5 | **Layanan** | Lepas kunci, dengan sopir, antar-jemput bandara/stasiun, wisata/tour, sewa bulanan/korporat, wedding car | Tiap layanan punya CTA WA dengan pesan berbeda |
| 6 | **Harga & paket** | Tabel ringkas: 12 jam / 24 jam / mingguan / bulanan; apa yang termasuk (sopir, BBM, tol, parkir) dan tidak | Tulis jelas "harga mulai", "belum termasuk BBM/tol" untuk menghindari salah paham |
| 7 | **Cara pesan** | 3–4 langkah: pilih mobil → isi form → konfirmasi & DP via WA → mobil diantar/diambil | |
| 8 | **Syarat sewa** | Lepas kunci: KTP, SIM A aktif, KK/NPWP/ID kerja, deposit/jaminan. Dengan sopir: KTP saja | Detail lengkap di `/syarat-ketentuan` |
| 9 | **Form pemesanan** | Lihat §6 | Section utama konversi |
| 10 | **Testimoni** | 3–6 ulasan (nama, kota, rating, kutipan) | Hanya ulasan asli dengan izin pelanggan. Jangan karang ulasan |
| 11 | **Area layanan** | Daftar kota/kecamatan yang dilayani, catatan biaya antar ke luar kota | Peta embed **tidak** di v1 (CSP + berat). Pakai link "Buka di Google Maps" (`target="_blank" rel="noopener noreferrer"`) |
| 12 | **FAQ** | 8–12 pertanyaan pakai `<details>`/`<summary>` (zero JS) | Contoh: boleh ke luar kota? kena biaya overtime? bisa bayar transfer? |
| 13 | **CTA penutup** | "Masih bingung? Tanya admin dulu" + tombol WA | |
| 14 | **Footer** | Alamat, jam operasional, nomor WA/telepon, email, link sosial media, link S&K dan privasi, © tahun | |
| — | **Floating WA button** | Pojok kanan bawah, selalu tampil | Jangan menutupi tombol submit form di mobile |

## 6. Fitur pemesanan via WhatsApp

### 6.1 Field form

| Field | Tipe | Wajib | Validasi |
|---|---|---|---|
| Nama | text | Ya | 2–60 karakter |
| Mobil | select (dari koleksi armada) + "Belum tahu, minta rekomendasi" | Ya | Harus salah satu opsi |
| Layanan | radio: Lepas kunci / Dengan sopir / Dengan sopir + BBM | Ya | Opsi sesuai yang tersedia untuk mobil terpilih |
| Tanggal mulai | date | Ya | ≥ hari ini |
| Jam ambil | time | Tidak | — |
| Durasi | number + satuan (hari / 12 jam / bulan) | Ya | 1–90 |
| Lokasi jemput / antar | text | Ya | ≤ 120 karakter |
| Tujuan | text | Tidak | ≤ 120 karakter, mis. "dalam kota" / "Bandung–Garut" |
| Jumlah penumpang | number | Tidak | 1–20 |
| Catatan | textarea | Tidak | ≤ 300 karakter |

Validasi pakai atribut HTML (`required`, `min`, `max`, `maxlength`, `pattern`) + cek ringan di script. Pesan error berbahasa Indonesia, ditaruh di dekat field dan diumumkan ke screen reader (`aria-describedby`, `aria-live`).

### 6.2 Alur

1. Pengunjung isi form, klik **"Kirim via WhatsApp"**.
2. Script memvalidasi, lalu menyusun teks pesan dari template §6.3.
3. Teks di-encode dengan `encodeURIComponent` dan dibuka ke `https://wa.me/<NOMOR>?text=<teks>`.
   - Mobile: membuka aplikasi WhatsApp.
   - Desktop: membuka WhatsApp Web / Desktop di tab baru.
4. Pengunjung menekan kirim di WhatsApp. Admin menerima pesan terstruktur.

Tanpa JS (script gagal dimuat): tombol tetap berupa link `wa.me` dengan pesan umum, jadi lead tidak hilang.

### 6.3 Template pesan

```
Halo Admin [Nama Usaha], saya mau pesan mobil:

Nama: {nama}
Mobil: {mobil}
Layanan: {layanan}
Tanggal: {tanggal_mulai} {jam}
Durasi: {durasi} {satuan}
Jemput di: {lokasi}
Tujuan: {tujuan}
Penumpang: {penumpang} orang
Catatan: {catatan}

Apakah tersedia? Terima kasih.
(via website)
```

- Field opsional yang kosong tidak ditampilkan.
- Tanggal ditulis format Indonesia, mis. "Sabtu, 14 Desember 2026".
- Teks penanda `(via website)` dipakai admin untuk menghitung lead dari website (lihat §9).
- Tombol WA lain (hero, layanan, floating, kartu armada) memakai pesan pendek sesuai konteks, mis. "Halo, saya mau tanya sewa Innova Reborn dengan sopir. (via website)".

### 6.4 Konfigurasi

| Nama | Lokasi | Keterangan |
|---|---|---|
| Nomor WA admin | `src/config/site.ts` atau `PUBLIC_WA_NUMBER` | Format internasional tanpa `+`/`0`, mis. `6281234567890`. Nomor ini publik (memang ditampilkan), jadi aman ter-bake ke HTML |
| Nama usaha, alamat, jam buka, sosial media | `src/config/site.ts` | Satu sumber untuk header, footer, SEO |

Rotasi beberapa admin (round-robin) **tidak** di v1, karena butuh state atau logika acak di client yang bikin lead tidak konsisten.

### 6.5 Batasan teknis (dari `AGENTS.md`)

- Script form ditulis sebagai `<script>` biasa di komponen `.astro` (di-bundle Astro jadi file eksternal), bukan `is:inline`, bukan `onclick=`.
- Membuka WA lewat `window.open(url, '_blank', 'noopener,noreferrer')` atau mengubah `href` anchor. **Jangan** submit `<form action="https://wa.me/...">`, karena CSP `form-action 'self'` akan memblokirnya.
- Data form **tidak dikirim ke server mana pun** selain diteruskan ke WhatsApp oleh browser pengguna. Tidak ada penyimpanan, tidak ada cookie.
- Tidak ada React/Vue/Svelte. Semua interaksi pakai vanilla TS kecil (target < 5 KB gzip total JS halaman).

## 7. Data & konten

### 7.1 Content Collection `armada`

`src/content.config.ts`, satu file per mobil di `src/content/armada/*.md` (atau `.yaml`), gambar di `src/assets/armada/`.

```ts
// sketsa schema (zod)
{
  nama: z.string().max(60),                 // "Toyota Innova Reborn"
  kategori: z.enum(['city-car', 'mpv', 'suv', 'minibus', 'premium']),
  gambar: image(),                           // dioptimasi astro:assets
  kapasitas: z.number().int().min(2).max(20),
  transmisi: z.enum(['manual', 'matic']),
  bbm: z.enum(['bensin', 'solar', 'listrik', 'hybrid']),
  tahun: z.number().int().optional(),
  harga: z.object({
    lepasKunci: z.number().int().positive().optional(),  // per 24 jam, rupiah
    denganSopir: z.number().int().positive().optional(), // per 12 jam
    allIn: z.number().int().positive().optional(),       // sopir + BBM
  }),
  fitur: z.array(z.string().max(40)).max(10).default([]),
  tersedia: z.boolean().default(true),
  urutan: z.number().int().default(0),
}
```

Harga ditampilkan dengan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })` saat build.

### 7.2 Koleksi lain
- `testimoni`: nama, kota, rating (1–5), kutipan (≤ 300 karakter), tanggal.
- `faq`: pertanyaan, jawaban (markdown), urutan.
- `layanan`: judul, deskripsi, ikon, pesan WA default.

### 7.3 Konten yang perlu disiapkan pemilik usaha
- [ ] Nama usaha, logo (SVG), warna brand
- [ ] Nomor WA admin, alamat, jam operasional, area layanan
- [ ] Daftar mobil + foto asli (min. 1200 px lebar) + harga
- [ ] Syarat sewa dan kebijakan (deposit, overtime, BBM, pembatalan, ke luar kota)
- [ ] Testimoni asli + izin tampil
- [ ] Akun sosial media / Google Business Profile

## 8. Kebutuhan non-fungsional

### Performa
- Lighthouse mobile ≥ 95 (Perf, A11y, BP, SEO). LCP < 2,5 s di 4G, CLS < 0,1, INP < 200 ms.
- Semua gambar lewat `<Image>`/`<Picture>` (AVIF/WebP, `width`/`height`, lazy kecuali hero).
- Font self-host `@fontsource` (maks. 2 weight), `font-display: swap`, preload font utama. Atau pakai system font stack saja.
- Total JS halaman < 5 KB gzip. Tidak ada `ClientRouter` kecuali benar-benar dibutuhkan.

### Keamanan & privasi
- CSP ketat di `public/_headers` (sudah ada). Fitur WA tidak butuh perubahan CSP, karena navigasi ke `wa.me` tidak dibatasi `connect-src`/`script-src`.
- Semua link eksternal `rel="noopener noreferrer"`.
- Tidak menyimpan data pribadi → kewajiban UU PDP minimal. Tetap sediakan `/kebijakan-privasi` yang menjelaskan data form hanya diteruskan ke WhatsApp dan tidak disimpan website.

### Aksesibilitas
- Heading berurutan (satu `h1` di hero), label di setiap input, kontras ≥ 4.5:1, fokus terlihat, bisa dipakai penuh dengan keyboard, target sentuh ≥ 44 px.
- Floating button punya `aria-label="Chat WhatsApp"`.

### SEO lokal
- `<title>` dan meta description berisi kata kunci + kota, mis. "Rental Mobil Semarang Lepas Kunci & Dengan Sopir | [Nama Usaha]".
- OG image 1200×630 untuk share WA/Facebook (preview link di WA penting untuk bisnis ini).
- Canonical, sitemap (`@astrojs/sitemap`), robots.txt (sudah ada).
- Nama, alamat, dan nomor telepon (NAP) di footer harus sama persis dengan Google Business Profile.
- Structured data `AutoRental` (JSON-LD): lihat pertanyaan terbuka #3.

## 9. Pengukuran

- **Cloudflare Web Analytics** untuk kunjungan dan sumber traffic. Paling hemat diaktifkan lewat dashboard Cloudflare (auto-inject). Kalau beacon dipasang manual, CSP perlu ditambah `script-src https://static.cloudflareinsights.com` dan `connect-src https://cloudflareinsights.com`.
- Cloudflare Web Analytics tidak punya custom event, jadi **klik WA dihitung dari sisi admin**: jumlah chat berisi `(via website)` per minggu. Opsional: tambahkan kode sumber pendek di pesan (mis. `#hero`, `#form`, `#armada`) untuk tahu tombol mana yang paling efektif.
- Kalau butuh event tracking di sisi web (v2): endpoint `/api/track` di worker dengan rate limit + Analytics Engine. Ini menambah biaya worker, jadi perlu keputusan dulu.

## 10. Kriteria penerimaan (v1)

- [ ] Semua section §5 tampil benar di 360 px, 768 px, dan 1280 px.
- [ ] Form menolak input tidak valid dengan pesan jelas; input valid membuka WA dengan pesan sesuai template §6.3 (dites di Android, iOS, dan desktop).
- [ ] Karakter khusus (`&`, `#`, emoji, baris baru) di field tidak merusak URL WA.
- [ ] Tombol "Pesan mobil ini" di kartu armada mengisi pilihan mobil di form.
- [ ] Tanpa JS, semua tombol WA tetap membuka chat.
- [ ] `dist/*.html` tanpa `<script>`/`<style>` inline dan tanpa atribut `style=`.
- [ ] Lighthouse mobile ≥ 95 di empat kategori.
- [ ] Header keamanan dan 404 terverifikasi di `pnpm preview` (`wrangler dev`).
- [ ] `pnpm check` dan `pnpm build` lolos.
- [ ] Tidak ada worker `main` di `wrangler.jsonc` (static only).

## 11. Milestone

| Fase | Isi | Estimasi |
|---|---|---|
| 0. Setup | Astro static, wrangler, `_headers`, 404, sitemap, robots | ✅ selesai |
| 1. Fondasi | `Layout` + komponen `SEO`, `site.ts`, design token (warna, font, spacing), header/footer, floating WA | 1 hari |
| 2. Konten | Content collections + data contoh armada/FAQ/testimoni/layanan | 1 hari |
| 3. Section | Hero s.d. CTA penutup | 2 hari |
| 4. Form WA | Form, validasi, builder pesan, prefill dari kartu armada | 1 hari |
| 5. Halaman pendukung | `/armada/[slug]`, S&K, privasi | 0,5 hari |
| 6. QA | Lighthouse, a11y, uji WA di perangkat nyata, `pnpm preview` | 0,5 hari |
| 7. Launch | Domain, deploy (izin user), Web Analytics, Google Business Profile, submit sitemap ke Search Console | — |

## 12. Pertanyaan terbuka

1. **Kota & nama usaha**: kota utama mana? Menentukan copy, SEO, dan area layanan.
2. **Satu atau beberapa nomor WA admin?** v1 diasumsikan satu nomor.
3. **JSON-LD `AutoRental`**: membantu SEO lokal, tapi berupa `<script type="application/ld+json">` inline. Blok ini tidak dieksekusi sehingga tidak diblokir CSP, namun melanggar aturan "tanpa `<script>` inline" di `AGENTS.md`. Perlu persetujuan untuk pengecualian (atau dilewati).
4. **Harga ditampilkan atau "hubungi kami"?** Menampilkan harga meningkatkan kepercayaan, tapi harus rajin diperbarui.
5. **Domain production** untuk `site` di `astro.config.mjs` (sekarang placeholder `rentalmobil.example.com`).
6. **Halaman per kota** untuk SEO di v1 atau v2?
