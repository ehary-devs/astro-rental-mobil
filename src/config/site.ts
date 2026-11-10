/**
 * Satu sumber data usaha. Semua nilai di sini publik dan ter-bake ke HTML saat build.
 * JANGAN taruh secret di file ini.
 *
 * TODO (pemilik usaha): ganti semua nilai contoh di bawah dengan data asli.
 */
export const site = {
  name: 'Lintas Rent',
  /** Dipakai di logo: bagian depan, huruf aksen, bagian belakang. */
  logo: { before: 'l', accent: 'i', after: 'ntas' },
  tagline: 'Sewa mobil lepas kunci dan dengan sopir',
  city: 'Semarang',
  /** Nomor WhatsApp admin, format internasional tanpa + atau 0 di depan. CONTOH, ganti. */
  whatsapp: '6281234567890',
  /** Nomor tampil (boleh pakai spasi). */
  phoneDisplay: '0812-3456-7890',
  email: 'halo@lintasrent.example.com',
  address: 'Jl. Pemuda No. 118, Sekayu, Semarang Tengah, Kota Semarang 50132',
  hours: 'Setiap hari, 06.00 - 22.00 WIB',
  mapsUrl: 'https://maps.google.com/?q=Simpang+Lima+Semarang',
  /** Kosongkan array untuk menyembunyikan ikon sosial. Contoh: { label: 'Instagram', href: 'https://instagram.com/akunmu', icon: 'instagram' } */
  social: [] as { label: string; href: string; icon: 'instagram' | 'facebook' | 'tiktok' | 'youtube' }[],
  /** Promo di banner. Set `active: false` untuk menyembunyikan. Nilai CONTOH. */
  promo: {
    active: true,
    car: 'Hyundai Ioniq 5',
    title: 'Coba mobil listrik, tanpa beli bensin',
    value: '20%',
    detail: 'Diskon sewa Ioniq 5 minimal 3 hari',
  },
} as const;

/** Penanda agar admin bisa menghitung lead yang datang dari website. */
export const WA_SOURCE_TAG = '(via website)';

/** Link wa.me dengan pesan terisi. Pesan di-encode di sini, jangan encode dua kali. */
export function waLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Pesan default untuk tombol "Chat admin". */
export const waGreeting = `Halo Admin ${site.name}, saya mau tanya soal sewa mobil. ${WA_SOURCE_TAG}`;

/** Rp350rb / Rp1,2jt untuk kartu; nominal lengkap untuk teks aksesibel. */
export function formatHargaSingkat(n: number): string {
  if (n >= 1_000_000) {
    const jt = n / 1_000_000;
    return `Rp${jt.toLocaleString('id-ID', { maximumFractionDigits: 1 })}jt`;
  }
  return `Rp${Math.round(n / 1000)}rb`;
}

export function formatHargaLengkap(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}
