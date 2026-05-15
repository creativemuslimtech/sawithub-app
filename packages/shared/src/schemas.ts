import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email atau username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  username: z.string().min(3, 'Username minimal 3 karakter').regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})
export type SignupInput = z.infer<typeof signupSchema>

// Lahan schema
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

// Panen schema
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
