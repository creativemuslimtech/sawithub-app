import { z } from 'zod'

export const panenSchema = z.object({
  id_lahan: z.string().min(1, 'Kebun wajib dipilih'),
  tanggal_panen: z.string().min(1, 'Tanggal panen wajib diisi'),
  luas_panen_ha: z.string().refine(v => parseFloat(v) > 0, { message: 'Luas panen harus lebih dari 0' }),
  jumlah_janjang: z.string().refine(v => parseInt(v) > 0, { message: 'Jumlah janjang harus lebih dari 0' }),
  berat_kg: z.string().refine(v => parseFloat(v) > 0, { message: 'Berat harus lebih dari 0' }),
  harga_per_kg: z.string().min(1, 'Harga per kg wajib diisi'),
  biaya_panen: z.string().min(1, 'Biaya panen wajib diisi'),
})
export type PanenInput = z.infer<typeof panenSchema>
