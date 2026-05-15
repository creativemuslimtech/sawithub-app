import { z } from 'zod'

export const adminLoginSchema = z.object({
  identifier: z.string().min(1, 'Email atau username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
})
export type AdminLoginInput = z.infer<typeof adminLoginSchema>
