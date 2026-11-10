import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const KATEGORI = {
  'city-car': 'City car',
  mpv: 'MPV keluarga',
  suv: 'SUV',
  minibus: 'Minibus rombongan',
  premium: 'Premium',
  listrik: 'Mobil listrik',
} as const;

export type Kategori = keyof typeof KATEGORI;

const armada = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/armada' }),
  schema: ({ image }) =>
    z
      .object({
        nama: z.string().max(60),
        kategori: z.enum(Object.keys(KATEGORI) as [Kategori, ...Kategori[]]),
        gambar: image(),
        alt: z.string().max(140),
        kapasitas: z.number().int().min(2).max(20),
        transmisi: z.enum(['manual', 'matic', 'manual/matic']),
        bbm: z.enum(['bensin', 'solar', 'listrik', 'hybrid']),
        /** Harga mulai, rupiah. Lepas kunci per 24 jam, dengan sopir per 12 jam. */
        harga: z.object({
          lepasKunci: z.number().int().positive().optional(),
          denganSopir: z.number().int().positive().optional(),
        }),
        populer: z.boolean().default(false),
        tersedia: z.boolean().default(true),
        urutan: z.number().int().default(0),
      })
      .refine((d) => d.harga.lepasKunci || d.harga.denganSopir, {
        message: 'Minimal satu harga (lepasKunci atau denganSopir) wajib diisi',
      }),
});

export const collections = { armada };
