/**
 * Foto mobil dari Wikimedia Commons. Lisensi CC BY-SA 4.0 WAJIB mencantumkan pembuat + lisensi.
 * Ganti dengan foto armada sendiri sebelum launch (lebih meyakinkan, dan bebas kewajiban atribusi).
 */
export type PhotoCredit = { file: string; title: string; author: string; license: 'CC0' | 'CC BY-SA 4.0' };

export const photoCredits: PhotoCredit[] = [
  { file: 'hero-alphard.jpg', title: '2023 Toyota Alphard Hybrid X E-Four.jpg', author: 'TTTNIS', license: 'CC0' },
  { file: 'alphard.jpg', title: '2023 Toyota Alphard Hybrid Z.jpg', author: 'TTTNIS', license: 'CC0' },
  { file: 'ioniq5.jpg', title: 'Hyundai Ioniq 5.jpg', author: 'TTTNIS', license: 'CC0' },
  { file: 'avanza.jpg', title: 'Toyota Avanza 1.5 G 2022.jpg', author: 'Ethan Llamas', license: 'CC BY-SA 4.0' },
  { file: 'xpander.jpg', title: 'Mitsubishi Xpander 1.5 GLS (Expander) 2023 (Cropped).jpg', author: 'Captainmorlypogi1959', license: 'CC BY-SA 4.0' },
  { file: 'innova-zenix.jpg', title: '2023 Kijang Innova Zenix G HV.jpg', author: 'Kompas.com', license: 'CC BY-SA 4.0' },
  { file: 'fortuner.jpg', title: '2021 Toyota Fortuner SRZ 2.7 4x2 (Indonesia) front view 01.jpg', author: 'Andra Febrian', license: 'CC BY-SA 4.0' },
  { file: 'brio.jpg', title: '2023 Honda Brio RS.jpg', author: 'Haysnawri10', license: 'CC BY-SA 4.0' },
  { file: 'hiace-bali.jpg', title: 'Toyota HiAce Premio in Melasti Beach, Bali (25-03-2026).jpg', author: 'Sulthan Naufal', license: 'CC BY-SA 4.0' },
  { file: 'hiace-premio.jpg', title: '2019 Toyota HiAce Premio 2.8 GDH322R (20190722).jpg', author: 'オーバードライブ83', license: 'CC BY-SA 4.0' },
];

export const LICENSE_URL: Record<PhotoCredit['license'], string> = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/deed.id',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/deed.id',
};

export function commonsUrl(title: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title.replaceAll(' ', '_'))}`;
}
