import { z } from 'zod'

export const lahanSchema = z.object({
  nama_kebun: z.string().min(1, 'Nama kebun wajib diisi'),
  jenis_bibit: z.string().min(1, 'Jenis bibit wajib diisi'),
  lokasi: z.string().min(1, 'Lokasi wajib diisi'),
  luas_ha: z.string().refine(v => parseFloat(v) > 0, { message: 'Luas harus lebih dari 0' }),
  jumlah_pohon: z.string().refine(v => parseInt(v) > 0, { message: 'Jumlah pohon harus lebih dari 0' }),
  tahun_tanam: z.string().refine(v => {
    const year = parseInt(v)
    return year >= 1900 && year <= new Date().getFullYear()
  }, { message: 'Tahun tanam tidak valid' }),
})
export type LahanInput = z.infer<typeof lahanSchema>
