/**
 * Data halaman kota layanan, jenis layanan, dan rute populer.
 * Dipakai footer dan route `/kota/[slug]`, `/layanan/[slug]`, `/rute/[slug]` (di-build statis).
 *
 * TODO (pemilik usaha): sesuaikan copy, cakupan, dan perkiraan jarak/waktu dengan kondisi asli.
 */
import type { CollectionEntry } from 'astro:content';

type Car = CollectionEntry<'armada'>;

export interface Tanya {
  q: string;
  a: string;
}

export interface InfoPage {
  slug: string;
  /** Label pendek untuk footer & breadcrumb. */
  nama: string;
  /** Judul H1. */
  judul: string;
  /** Satu-dua kalimat di bawah H1, juga dipakai meta description. */
  ringkas: string;
  /** Poin keunggulan / yang perlu diketahui. */
  poin: string[];
  /** Pesan WA yang diisikan (tanpa salam & tag sumber, ditambahkan di template). */
  pesan: string;
  /** Saring mobil yang cocok. Default: semua yang tersedia. */
  filterMobil?: (car: Car) => boolean;
  /** Tanya jawab khusus halaman ini, tampil di atas FAQ umum. Opsional. */
  faq?: Tanya[];
}

export interface RutePage extends InfoPage {
  dari: string;
  ke: string;
  /** Perkiraan, kondisi normal. */
  jarak: string;
  waktu: string;
  /** Opsi skema perjalanan. Kosong = skema umum (sekali jalan, pulang-pergi, beberapa hari). */
  skema?: { judul: string; desc: string }[];
}

const pakaiSopir = (c: Car) => Boolean(c.data.harga.denganSopir);
const lepasKunci = (c: Car) => Boolean(c.data.harga.lepasKunci);

export const kota: InfoPage[] = [
  {
    slug: 'semarang',
    nama: 'Semarang',
    judul: 'Rental mobil Semarang',
    ringkas:
      'Garasi kami di Semarang Tengah. Mobil bisa diambil sendiri atau diantar ke rumah, hotel, Stasiun Tawang, dan Bandara Ahmad Yani.',
    poin: [
      'Antar jemput mobil gratis di dalam Kota Semarang',
      'Lepas kunci atau dengan sopir yang hafal jalan kota',
      'Cocok untuk dinas, wisata Kota Lama, dan acara keluarga',
      'Admin aktif setiap hari, 06.00 - 22.00 WIB',
    ],
    pesan: 'saya mau sewa mobil di Semarang.',
  },
  {
    slug: 'yogyakarta',
    nama: 'Yogyakarta',
    judul: 'Rental mobil Yogyakarta',
    ringkas:
      'Mobil dari Semarang bisa diantar ke Yogyakarta, atau berangkat bareng sopir kami dari Semarang untuk wisata dan acara di Jogja.',
    poin: [
      'Antar mobil ke hotel, stasiun, atau Bandara YIA (biaya antar sesuai jarak)',
      'Paket dengan sopir untuk wisata Malioboro, Prambanan, dan pantai selatan',
      'Mobil keluarga sampai minibus rombongan',
      'Konfirmasi harga dan jadwal antar lewat WhatsApp',
    ],
    pesan: 'saya mau sewa mobil untuk di Yogyakarta.',
  },
  {
    slug: 'solo',
    nama: 'Solo',
    judul: 'Rental mobil Solo',
    ringkas:
      'Sewa mobil untuk di Solo dan sekitarnya. Lewat tol, Semarang - Solo sekitar 1,5 jam, jadi mobil bisa diantar di hari yang sama.',
    poin: [
      'Antar mobil ke alamat di Solo (biaya antar sesuai jarak)',
      'Dengan sopir untuk acara keluarga, dinas, atau wisata Keraton',
      'Pilihan mobil hemat sampai premium',
      'Bisa lanjut ke Tawangmangu atau Sragen',
    ],
    pesan: 'saya mau sewa mobil untuk di Solo.',
  },
  {
    slug: 'magelang',
    nama: 'Magelang',
    judul: 'Rental mobil Magelang',
    ringkas:
      'Mobil untuk wisata Borobudur, Ketep, dan sekitar Magelang. Berangkat dari Semarang atau kami antar ke Magelang.',
    poin: [
      'Dengan sopir yang paham rute wisata Magelang',
      'Antar mobil ke hotel atau penginapan (biaya antar sesuai jarak)',
      'SUV untuk jalur menanjak ke Ketep dan Dieng',
      'Bisa dikombinasikan dengan rute ke Yogyakarta',
    ],
    pesan: 'saya mau sewa mobil untuk di Magelang.',
  },
  {
    slug: 'salatiga',
    nama: 'Salatiga',
    judul: 'Rental mobil Salatiga',
    ringkas:
      'Salatiga hanya sekitar 1 jam dari Semarang lewat tol. Mobil bisa diantar untuk acara kampus, keluarga, atau wisata Kopeng.',
    poin: [
      'Antar mobil ke Salatiga di hari yang sama',
      'Lepas kunci atau dengan sopir',
      'Cocok untuk wisuda, nikahan, dan kunjungan keluarga',
      'Bisa lanjut ke Bandungan atau Kopeng',
    ],
    pesan: 'saya mau sewa mobil untuk di Salatiga.',
  },
  {
    slug: 'kudus',
    nama: 'Kudus',
    judul: 'Rental mobil Kudus',
    ringkas:
      'Sewa mobil untuk di Kudus dan pantura timur: dinas, ziarah, atau acara keluarga. Mobil diantar dari Semarang.',
    poin: [
      'Antar mobil ke Kudus (biaya antar sesuai jarak)',
      'Dengan sopir untuk rombongan ziarah dan dinas',
      'Minibus untuk rombongan sampai 14 orang',
      'Bisa lanjut ke Jepara, Pati, atau Muria',
    ],
    pesan: 'saya mau sewa mobil untuk di Kudus.',
  },
];

export const layanan: InfoPage[] = [
  {
    slug: 'lepas-kunci',
    nama: 'Lepas kunci',
    judul: 'Sewa mobil lepas kunci',
    ringkas: 'Setir sendiri, bebas atur jadwal. Harga per 24 jam, mobil bisa diambil di garasi atau diantar ke alamat Anda.',
    poin: [
      'Dihitung per 24 jam, toleransi keterlambatan 1 jam',
      'Syarat: KTP, SIM A aktif, dan satu dokumen pendukung',
      'Deposit dikembalikan penuh setelah mobil kembali tanpa kerusakan',
      'BBM, tol, dan parkir ditanggung penyewa',
    ],
    pesan: 'saya mau sewa mobil lepas kunci.',
    faq: [
      {
        q: 'Dokumen apa saja yang perlu disiapkan?',
        a: 'KTP dan SIM A yang masih berlaku, ditambah satu dokumen pendukung seperti KK, NPWP, atau ID karyawan. Foto dokumen cukup dikirim lewat WhatsApp untuk verifikasi.',
      },
      {
        q: 'Bagaimana dengan deposit?',
        a: 'Deposit dibayar saat serah terima dan dikembalikan penuh setelah mobil kembali tanpa kerusakan.',
      },
      {
        q: 'Bagaimana kalau terlambat mengembalikan mobil?',
        a: 'Ada toleransi 1 jam. Setelah itu dihitung overtime 10% dari harga harian per jam, dan lewat 5 jam dihitung satu hari penuh.',
      },
    ],
    filterMobil: lepasKunci,
  },
  {
    slug: 'dengan-sopir',
    nama: 'Dengan sopir',
    judul: 'Sewa mobil dengan sopir',
    ringkas: 'Tinggal duduk, sopir kami yang menyetir. Harga per 12 jam, cukup KTP pemesan.',
    poin: [
      'Sopir berpengalaman dan hafal rute Jawa Tengah - DIY',
      'Dijemput di alamat Anda',
      'Syarat cukup KTP pemesan',
      'BBM, tol, parkir, makan sopir, dan overtime di luar harga sewa',
    ],
    pesan: 'saya mau sewa mobil dengan sopir.',
    faq: [
      {
        q: 'Berapa lama durasi sewa dengan sopir?',
        a: 'Harga dengan sopir dihitung per 12 jam, termasuk mobil dan jasa sopir. Lewat dari itu dihitung overtime.',
      },
      {
        q: 'Apa saja yang belum termasuk harga sewa?',
        a: 'BBM, tol, parkir, makan sopir, dan overtime dibayar terpisah, kecuali Anda memilih paket all in. Detailnya dikonfirmasi admin sebelum pemesanan.',
      },
      {
        q: 'Apa syaratnya?',
        a: 'Cukup KTP pemesan. Sopir menjemput di alamat yang Anda tentukan.',
      },
    ],
    filterMobil: pakaiSopir,
  },
  {
    slug: 'antar-jemput-bandara',
    nama: 'Antar jemput bandara',
    judul: 'Antar jemput bandara',
    ringkas:
      'Dijemput tepat waktu di Bandara Ahmad Yani Semarang, YIA Yogyakarta, atau Adi Soemarmo Solo. Kirim nomor penerbangan, kami pantau jadwalnya.',
    poin: [
      'Sopir menunggu di pintu kedatangan',
      'Jadwal disesuaikan bila pesawat delay',
      'Muat bagasi keluarga sampai rombongan',
      'Harga sekali jalan atau pulang-pergi, dikonfirmasi admin',
    ],
    pesan: 'saya mau pesan antar jemput bandara.',
    faq: [
      {
        q: 'Bandara mana saja yang dilayani?',
        a: 'Bandara Ahmad Yani Semarang, YIA Yogyakarta, dan Adi Soemarmo Solo.',
      },
      {
        q: 'Bagaimana kalau pesawat saya delay?',
        a: 'Kirim nomor penerbangan saat memesan. Kami pantau jadwalnya dan menyesuaikan waktu jemput.',
      },
      {
        q: 'Bisa pesan sekali jalan saja?',
        a: 'Bisa, sekali jalan atau pulang-pergi. Harga dikonfirmasi admin sesuai bandara dan alamat tujuan.',
      },
    ],
    filterMobil: pakaiSopir,
  },
  {
    slug: 'sewa-bulanan',
    nama: 'Sewa bulanan',
    judul: 'Sewa mobil bulanan',
    ringkas:
      'Untuk kebutuhan kantor, proyek, atau pribadi jangka panjang. Harga per bulan lebih hemat dibanding sewa harian.',
    poin: [
      'Harga khusus untuk sewa 1 bulan atau lebih',
      'Servis berkala ditanggung kami',
      'Mobil pengganti bila ada kendala',
      'Bisa lepas kunci atau dengan sopir',
    ],
    pesan: 'saya mau tanya harga sewa mobil bulanan.',
    faq: [
      {
        q: 'Berapa lama minimal sewa bulanan?',
        a: 'Harga khusus berlaku untuk sewa 1 bulan atau lebih. Hubungi admin untuk penawaran sesuai unit dan durasi.',
      },
      {
        q: 'Siapa yang menanggung servis berkala?',
        a: 'Servis berkala ditanggung kami. Bila ada kendala pada mobil, kami siapkan mobil pengganti.',
      },
      {
        q: 'Bisa sewa bulanan dengan sopir?',
        a: 'Bisa, sewa bulanan tersedia lepas kunci atau dengan sopir.',
      },
    ],
  },
  {
    slug: 'mobil-pengantin',
    nama: 'Mobil pengantin',
    judul: 'Sewa mobil pengantin',
    ringkas: 'Mobil premium bersih dan wangi untuk hari pernikahan, lengkap dengan sopir berpakaian rapi.',
    poin: [
      'Pilihan mobil premium dan SUV',
      'Sopir berpakaian rapi dan tepat waktu',
      'Bisa dihias (dekorasi disediakan penyewa atau vendor)',
      'Pesan jauh hari, terutama di musim nikah',
    ],
    pesan: 'saya mau sewa mobil pengantin.',
    faq: [
      {
        q: 'Apakah mobil pengantin sudah termasuk dekorasi?',
        a: 'Belum. Mobil bisa dihias, dengan dekorasi disediakan penyewa atau vendor dekorasi Anda.',
      },
      {
        q: 'Kapan sebaiknya memesan?',
        a: 'Sebaiknya jauh hari, terutama di musim nikah, supaya mobil pilihan Anda masih tersedia.',
      },
      {
        q: 'Apakah sudah termasuk sopir?',
        a: 'Ya, mobil pengantin disewakan dengan sopir berpakaian rapi dan tepat waktu.',
      },
    ],
    filterMobil: (c) => pakaiSopir(c) && ['premium', 'suv', 'listrik'].includes(c.data.kategori),
  },
];

export const rute: RutePage[] = [
  {
    slug: 'semarang-yogyakarta',
    nama: 'Semarang - Yogyakarta',
    judul: 'Sewa mobil Semarang - Yogyakarta',
    dari: 'Semarang',
    ke: 'Yogyakarta',
    jarak: '± 120 km',
    waktu: '± 3 jam',
    ringkas: 'Rute favorit untuk liburan dan acara keluarga. Bisa sekali jalan, pulang-pergi, atau beberapa hari di Jogja.',
    poin: [
      'Lewat Ambarawa dan Magelang, bisa mampir Borobudur',
      'Dengan sopir yang hafal jalur dan tempat istirahat',
      'Bisa drop di hotel, stasiun, atau Bandara YIA',
      'BBM, tol, dan parkir di luar harga sewa',
    ],
    pesan: 'saya mau sewa mobil rute Semarang - Yogyakarta.',
    faq: [
      {
        q: 'Bisa mampir ke Borobudur di perjalanan?',
        a: 'Bisa. Rute lewat Ambarawa dan Magelang, jadi mampir Borobudur bisa diatur bersama sopir. Sampaikan rencana Anda saat memesan.',
      },
      {
        q: 'Bisa diantar sampai Bandara YIA?',
        a: 'Bisa, drop di hotel, stasiun, atau Bandara YIA.',
      },
    ],
    filterMobil: pakaiSopir,
  },
  {
    slug: 'semarang-solo',
    nama: 'Semarang - Solo',
    judul: 'Sewa mobil Semarang - Solo',
    dari: 'Semarang',
    ke: 'Solo',
    jarak: '± 100 km',
    waktu: '± 1,5 - 2 jam lewat tol',
    ringkas: 'Cepat lewat tol Semarang - Solo. Cocok untuk dinas sehari, kondangan, atau ke Bandara Adi Soemarmo.',
    poin: [
      'Lewat tol Trans Jawa, perjalanan nyaman',
      'Bisa pulang-pergi di hari yang sama',
      'Lepas kunci atau dengan sopir',
      'BBM, tol, dan parkir di luar harga sewa',
    ],
    pesan: 'saya mau sewa mobil rute Semarang - Solo.',
    faq: [
      {
        q: 'Bisa pulang-pergi di hari yang sama?',
        a: 'Bisa. Lewat tol, perjalanan Semarang - Solo cukup singkat sehingga pulang-pergi sehari sangat memungkinkan.',
      },
      {
        q: 'Rute ini bisa lepas kunci?',
        a: 'Bisa, rute Semarang - Solo tersedia lepas kunci maupun dengan sopir.',
      },
    ],
  },
  {
    slug: 'semarang-dieng',
    nama: 'Semarang - Dieng',
    judul: 'Sewa mobil Semarang - Dieng',
    dari: 'Semarang',
    ke: 'Dieng',
    jarak: '± 120 km',
    waktu: '± 3,5 - 4 jam',
    ringkas: 'Jalur pegunungan menanjak dan berkelok. Kami sarankan pakai sopir dan mobil yang bertenaga.',
    poin: [
      'Sopir berpengalaman di jalur Wonosobo - Dieng',
      'Disarankan SUV atau MPV bertenaga untuk tanjakan',
      'Berangkat dini hari untuk sunrise Sikunir',
      'BBM, tol, parkir, dan tiket wisata di luar harga sewa',
    ],
    pesan: 'saya mau sewa mobil rute Semarang - Dieng.',
    faq: [
      {
        q: 'Mobil apa yang cocok untuk ke Dieng?',
        a: 'Kami sarankan SUV atau MPV bertenaga karena jalurnya menanjak dan berkelok, dan menggunakan sopir yang berpengalaman di jalur Wonosobo - Dieng.',
      },
      {
        q: 'Bisa berangkat dini hari untuk sunrise Sikunir?',
        a: 'Bisa. Sampaikan jadwal yang Anda inginkan, admin akan mengatur jam jemput bersama sopir.',
      },
    ],
    filterMobil: (c) => pakaiSopir(c) && c.data.kategori !== 'city-car',
  },
  {
    slug: 'yogyakarta-borobudur',
    nama: 'Yogyakarta - Borobudur',
    judul: 'Sewa mobil Yogyakarta - Borobudur',
    dari: 'Yogyakarta',
    ke: 'Borobudur',
    jarak: '± 40 km',
    waktu: '± 1 - 1,5 jam',
    ringkas: 'Paket setengah hari atau seharian ke Candi Borobudur, bisa lanjut ke Punthuk Setumbu atau Ketep.',
    poin: [
      'Dijemput di hotel Yogyakarta',
      'Bisa berangkat subuh untuk sunrise',
      'Sopir bisa sarankan jadwal kunjungan',
      'BBM, parkir, dan tiket wisata di luar harga sewa',
    ],
    pesan: 'saya mau sewa mobil rute Yogyakarta - Borobudur.',
    faq: [
      {
        q: 'Bisa dijemput di hotel Yogyakarta?',
        a: 'Bisa, sopir menjemput di hotel Anda di Yogyakarta.',
      },
      {
        q: 'Bisa lanjut ke tempat wisata lain?',
        a: 'Bisa, misalnya ke Punthuk Setumbu atau Ketep. Sopir bisa menyarankan jadwal kunjungan.',
      },
    ],
    filterMobil: pakaiSopir,
  },
  {
    slug: 'semarang-karimunjawa',
    nama: 'Semarang - Karimunjawa (pelabuhan)',
    judul: 'Sewa mobil Semarang - Pelabuhan Jepara',
    dari: 'Semarang',
    ke: 'Pelabuhan Kartini, Jepara',
    jarak: '± 90 km',
    waktu: '± 2 - 2,5 jam',
    ringkas:
      'Antar ke Pelabuhan Kartini Jepara untuk menyeberang ke Karimunjawa, dan jemput lagi saat Anda pulang. Mobil tidak ikut menyeberang.',
    poin: [
      'Sampai pelabuhan sebelum jadwal kapal',
      'Bisa dijemput lagi sesuai jadwal kapal pulang',
      'Muat bagasi dan perlengkapan snorkeling',
      'BBM, tol, dan parkir di luar harga sewa',
    ],
    pesan: 'saya mau sewa mobil antar ke Pelabuhan Jepara (Karimunjawa).',
    faq: [
      {
        q: 'Apakah mobil ikut menyeberang ke Karimunjawa?',
        a: 'Tidak. Kami mengantar sampai Pelabuhan Kartini Jepara, lalu menjemput lagi sesuai jadwal kapal pulang Anda.',
      },
      {
        q: 'Jam berapa sebaiknya berangkat dari Semarang?',
        a: 'Sampaikan jadwal kapal Anda saat memesan. Admin akan mengatur jam jemput supaya Anda tiba di pelabuhan sebelum kapal berangkat.',
      },
    ],
    skema: [
      { judul: 'Antar ke pelabuhan', desc: 'Dijemput di alamat Anda di Semarang dan diantar sampai Pelabuhan Kartini Jepara.' },
      { judul: 'Jemput dari pelabuhan', desc: 'Dijemput di Pelabuhan Kartini saat kapal pulang tiba, lalu diantar ke alamat tujuan.' },
      { judul: 'Antar & jemput lagi', desc: 'Paket lengkap berangkat dan pulang, jadwal jemput menyesuaikan kapal kembali.' },
    ],
    filterMobil: pakaiSopir,
  },
];
