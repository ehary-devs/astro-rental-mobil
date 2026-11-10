# AGENTS.md — aturan wajib untuk AI & developer

Project ini **full Cloudflare**:

- **Frontend**: Astro **full static** (`output: 'static'`, tanpa adapter SSR) di `src/`. Hasil build `dist/` disajikan lewat **Workers Static Assets**.
- **Backend (opsional)**: Hono di Workers (`worker/`), **hanya** untuk `/api/*`. Bisa memakai D1, KV, R2, Queues, Rate Limiting, Cron.

Prioritas setiap perubahan, berurutan: **1. aman → 2. benar → 3. hemat resource → 4. cepat**. Jangan korbankan urutan atas demi urutan bawah.

Aturan bertanda **WAJIB** tidak boleh dilanggar tanpa persetujuan eksplisit user. Kalau permintaan user bertentangan dengan aturan WAJIB, jelaskan risikonya dan tanya dulu.

---

## 1. Sebelum menulis kode

- Baca file terkait dulu dan ikuti pola yang sudah ada (komponen di `src/components/`, layout di `src/layouts/`, helper di `worker/lib/`). Jangan bikin pola baru untuk hal yang sudah ada.
- API Astro dan Cloudflare sering berubah. Untuk `astro.config.mjs`, `wrangler.jsonc`, binding, atau limit: cek docs terbaru (Context7 / docs.astro.build / developers.cloudflare.com), jangan mengandalkan ingatan.
- Jalankan `pnpm check` (`astro check`), `pnpm build`, dan `pnpm test` (kalau ada) sebelum menyatakan selesai. Kalau mengubah UI/header/routing, cek juga dengan `pnpm preview` (`astro build && wrangler dev`). `_headers` dan 404 **hanya** berlaku di `wrangler dev`/production, tidak di `astro dev`.
- Dev server: jalankan di background (`astro dev --background`), kelola dengan `astro dev stop` / `astro dev status` / `astro dev logs`.
- `typescript` dikunci di `^6` karena `astro check` belum mendukung TS 7. Jangan naikkan sebelum didukung.
- pnpm 11 memblokir build script dependency. Kalau dependency baru butuh postinstall, izinkan secara eksplisit lewat `pnpm approve-builds <pkg>` (tercatat di `pnpm-workspace.yaml` → `allowBuilds`). Jangan izinkan semua.
- Docs Astro yang perlu dibaca sebelum mengerjakan topik terkait: [routing](https://docs.astro.build/en/guides/routing/), [komponen Astro](https://docs.astro.build/en/basics/astro-components/), [framework components](https://docs.astro.build/en/guides/framework-components/), [content collections](https://docs.astro.build/en/guides/content-collections/), [styling](https://docs.astro.build/en/guides/styling/), [i18n](https://docs.astro.build/en/guides/internationalization/).

## 2. Arsitektur Astro full static — WAJIB

- `output` **harus** tetap `'static'`. **Jangan** menambah `@astrojs/cloudflare` adapter, `export const prerender = false`, `Astro.request` dinamis, atau server islands/actions. Semua halaman di-render saat build.
- Data dinamis (form kontak, counter, dsb.) → endpoint `/api/*` di worker, dipanggil dari client. Bukan SSR.
- Konten (project, blog, CV) → **Content Collections** (`src/content.config.ts`) dengan schema zod. Data diambil saat build, bukan runtime.
- Route dinamis (`[slug].astro`) **wajib** punya `getStaticPaths()`.
- Halaman 404 di `src/pages/404.astro`, dan `wrangler.jsonc` pakai `assets.not_found_handling: "404-page"`.
- Variabel env yang dipakai di halaman hanya yang publik (`PUBLIC_*`) dan akan **ter-bake ke HTML/JS saat build**. Tidak boleh ada secret di `src/`.

## 3. Keamanan — WAJIB

### Frontend (static)
- Security header ada di `public/_headers` (ikut ter-copy ke `dist/`): CSP, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Kalau menambah domain pihak ketiga (script/iframe/font/API/analytics), **perbarui CSP** seminimal mungkin. Jangan pakai `unsafe-eval` atau wildcard `*`.
- CSP saat ini ketat: `script-src 'self'; style-src 'self'` tanpa `unsafe-inline`. Karena itu `build.inlineStylesheets: 'never'` dan `vite.build.assetsInlineLimit: 0` (mencegah Astro meng-inline `<script>` kecil) di `astro.config.mjs` jangan diubah. Data dari server ke script dioper lewat atribut `data-*`, bukan `define:vars` (itu memaksa script inline). Jangan pakai atribut `style="..."`, `<script is:inline>`, atau event handler inline (`onclick=`). Setelah build, pastikan `dist/*.html` tidak berisi `<script>`/`<style>` inline. Kalau terpaksa butuh inline, pakai hash, bukan `unsafe-inline`.
- Jangan pakai `set:html` / `innerHTML` / `dangerouslySetInnerHTML` untuk data yang tidak dipercaya. Markdown dari Content Collections boleh karena dari repo.
- Link eksternal `target="_blank"` **wajib** `rel="noopener noreferrer"`.

### Backend (`/api/*`)
- Endpoint publik (form kontak, dll) **wajib** `rateLimit(...)` + Turnstile (verifikasi Siteverify di server). Endpoint admin **wajib** auth + permission, dicek di server.
- Semua input (`json`, `query`, `param`) divalidasi zod lewat `validate()`. Selalu beri batas panjang/ukuran (`.max()`).
- SQL **hanya** lewat Drizzle atau `prepare().bind()`. Tidak boleh ada string interpolation ke SQL.
- Upload file: cek `content-length` **sebelum** body dibaca, cek ukuran, cek magic bytes, pakai nama file buatan server.
- HTML berisi data user (mis. email notifikasi) **harus** di-escape (`escapeHtml`).
- Error 500 tidak boleh membocorkan stack/pesan internal. Pakai `ApiError` untuk error yang memang untuk user.
- CORS: default same-origin. Jangan `Access-Control-Allow-Origin: *` di endpoint yang menerima tulis/cookie.
- Header API lewat `secureHeaders()` Hono.

### Secret & config
- Secret (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, dll) **hanya** lewat `wrangler secret put`, dan untuk lokal lewat `.dev.vars` (wajib di-gitignore). Jangan pernah taruh di `vars`, `PUBLIC_*`, kode, log, atau commit.
- Tidak boleh `console.log` token, password, isi cookie, atau secret.
- Turnstile **site key** (publik) boleh di `PUBLIC_TURNSTILE_SITE_KEY`; **secret key** hanya di worker.

## 4. Hemat resource Cloudflare — WAJIB

Static assets **gratis dan tidak memanggil worker**. Biaya hanya muncul saat worker jalan: request, **CPU time**, baris D1, operasi KV, operasi R2 (Class A = tulis, Class B = baca), pesan Queue, dan event log.

### Request & CPU
- Semua halaman harus terlayani langsung dari static assets. `run_worker_first` **hanya** `["/api/*"]`. Jangan dilebarkan, jangan pakai worker untuk redirect/rewrite yang bisa ditangani `public/_redirects`.
- Kalau tidak ada kebutuhan `/api`, **jangan** buat worker `main` sama sekali — cukup `assets`.
- Pekerjaan yang tidak perlu ditunggu user (kirim email, webhook) → Queue atau `c.executionCtx.waitUntil()`. Jangan `await` di jalur response.
- Pekerjaan periodik → cron (`scheduled`), jangan dicek per request.

### D1 / KV / R2 / Queues (kalau dipakai)
- D1: gabungkan query terkait dengan `db.batch([...])`. Ambil kolom secukupnya. Tabel yang bisa tumbuh **wajib** `WHERE`/`LIMIT`, cursor pagination (bukan OFFSET), kolom filter ber-index. Jangan menulis kalau data tidak berubah.
- Drizzle batch: jangan SELECT ber-join dengan nama kolom sama di dalam `db.batch` (kolom bertabrakan). Pakai alias unik atau jalankan di luar batch.
- KV: hanya untuk data sering dibaca/jarang ditulis, selalu `expirationTtl`. Jangan untuk counter.
- R2: nama object unik per versi (cache selamanya), batasi ukuran upload, rate limit endpoint tulis. Aset gambar statis portofolio cukup di `src/assets/` (dioptimasi Astro), bukan R2.
- Queues: consumer **wajib** `dead_letter_queue` + `max_retries`, handler idempotent.

### Cache
- Aset ber-hash (`/_astro/*`) → `Cache-Control: public, max-age=31536000, immutable` di `public/_headers`.
- HTML → jangan immutable (biarkan revalidate) supaya deploy baru langsung terlihat.

### Logging
- `observability.head_sampling_rate` = 0.1 di production. Naikkan sementara saat debugging, lalu kembalikan.
- Satu `console.error` dengan `requestId` per error. Tidak ada log per request di jalur normal.

## 5. Frontend cepat & ringan — WAJIB

- **Default zero JS.** Pakai komponen `.astro`. Framework UI (React/Svelte/dll) hanya untuk bagian yang benar-benar interaktif.
- Island **wajib** directive paling malas yang cukup: `client:visible` / `client:idle` / `client:media` lebih dulu; `client:load` hanya kalau harus interaktif seketika. Jangan hydrate seluruh halaman.
- Gambar **wajib** lewat `<Image>` / `<Picture>` dari `astro:assets` (format modern, `width`/`height` jelas, `loading="lazy"` kecuali gambar LCP). Jangan taruh gambar besar mentah di `public/`.
- Font: self-host (`@fontsource` atau `public/fonts`) dengan `font-display: swap` + preload font utama. Hindari Google Fonts CDN (privasi + CSP + request tambahan).
- Import bernama (`import { X } from '...'`), jangan `import *`. Jangan menambah dependency besar tanpa alasan kuat; cek ukuran bundle setelah `pnpm build`. Dependency tak terpakai dihapus.
- Script pihak ketiga (Turnstile, analytics) di-load on-demand / hanya di halaman yang butuh, bukan di layout global. Utamakan Cloudflare Web Analytics.
- Navigasi: `<ClientRouter />` (view transitions) hanya kalau memang dipakai; jangan menambah JS global tanpa manfaat jelas.
- SEO & aksesibilitas: setiap halaman punya `<title>`, meta description, canonical, OG tags (lewat layout/komponen `SEO`), `lang` di `<html>`, alt text, heading berurutan, kontras cukup. Generate `sitemap` (`@astrojs/sitemap`) dan `robots.txt`.
- Target Lighthouse ≥ 95 untuk Performance, Accessibility, Best Practices, SEO.

## 6. Konfigurasi `wrangler.jsonc`

- Minimal (static saja):
  ```jsonc
  {
    "name": "portofolio-ehary",
    "compatibility_date": "YYYY-MM-DD",
    "assets": { "directory": "./dist", "not_found_handling": "404-page" }
  }
  ```
- Dengan API: tambah `"main": "worker/index.ts"`, `assets.binding: "ASSETS"`, dan `assets.run_worker_first: ["/api/*"]`.
- Binding baru → tambahkan tipenya (`wrangler types` / `worker/env.ts`).
- Rate limiter: `namespace_id` unik per akun, `period` hanya 10 atau 60.
- `compatibility_date` hanya dinaikkan dengan sengaja, dan di-test setelahnya.
- Variabel opsional dibuat agar fitur nonaktif kalau kosong (contoh: Turnstile, Resend).
- Jangan menjalankan `wrangler deploy`, `d1 ... --remote`, `secret put`, atau menghapus resource tanpa izin eksplisit user. Itu semua mengubah production.

## 7. Database & migration (kalau pakai D1)

- Perubahan skema = file migration baru `migrations/000N_nama.sql` + update `worker/db/schema.ts`. Tes dulu dengan `pnpm db:migrate:local`. Jangan edit migration lama.
- Migration harus aman untuk data yang ada (kolom baru nullable atau punya default). Hindari `DROP` tanpa persetujuan.

## 8. Checklist sebelum selesai

- [ ] Tetap `output: 'static'`, tanpa adapter/SSR. Route dinamis punya `getStaticPaths()`.
- [ ] Tidak ada secret di `src/`, `PUBLIC_*`, `vars`, kode, atau log.
- [ ] Island pakai `client:*` paling malas; gambar lewat `astro:assets`.
- [ ] CSP di `public/_headers` diperbarui kalau ada domain eksternal baru.
- [ ] Endpoint `/api` baru: rate limit (+ Turnstile kalau publik) atau auth, validasi zod, error aman.
- [ ] `run_worker_first` tetap hanya `/api/*`.
- [ ] Query D1 dibatasi, batch, kolom secukupnya, ada index.
- [ ] `pnpm check` + `pnpm build` (+ `pnpm test`) lolos. Ada perubahan UI/header → cek di `pnpm preview`.
- [ ] Laporkan ke user apa yang belum dites.
