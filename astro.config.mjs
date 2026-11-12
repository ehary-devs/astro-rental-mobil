// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO: ganti dengan domain production sebelum deploy (dipakai canonical, OG, sitemap).
  site: 'https://rentalmobil.example.com',
  // WAJIB static (lihat AGENTS.md §2). Jangan tambah adapter SSR.
  output: 'static',
  build: {
    // CSP style-src 'self' tanpa unsafe-inline → jangan diubah (AGENTS.md §3).
    inlineStylesheets: 'never',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Astro meng-inline <script> kecil ke HTML → diblokir CSP script-src 'self'. 0 = selalu file eksternal.
      assetsInlineLimit: 0,
    },
  },
  integrations: [sitemap()],
});
