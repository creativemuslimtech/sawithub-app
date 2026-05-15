export interface User {
  user_id?: string
  public_id?: string
  email: string
  username: string
  full_name: string
  phone?: string
  role?: 'user' | 'admin'
  created_at?: string
  updated_at?: string
  /** Server-backed JSON preferences (e.g. onboarding_done). */
  preferences?: Record<string, unknown>
}

export interface Lahan {
  id_lahan: string
  nama_kebun: string
  jenis_bibit: string
  lokasi: string
  luas_ha: number
  jumlah_pohon: number
  tahun_tanam: number
}

export interface PanenRow {
  id_panen: string
  id_lahan: string
  tanggal_panen: string
  luas_panen_ha: number
  jumlah_janjang: number
  berat_kg: number
  berat_ton: number
  harga_per_kg: number
  total_pendapatan: number
  biaya_panen: number
  hasil_bersih: number
}

export interface PerawatanRow {
  id_perawatan: string
  id_lahan: string
  tanggal_perawatan: string
  jenis_perawatan: string
  bahan: string
  jumlah: number
  satuan: string
  harga_satuan: number
  total_harga_material: number
  biaya_pekerja: number
  biaya: number
  keterangan: string
}

export interface LahanInfo {
  id_lahan: string
  nama_kebun: string
  jenis_bibit: string
  lokasi: string
  luas_ha: number
  jumlah_pohon: number
  tahun_tanam: number
}

export interface PendapatanRow {
  id_pendapatan: string
  id_lahan: string
  tanggal_panen: string
  total_janjang: number
  total_berat_kg: number
  pendapatan_kotor: number
  biaya_total: number
  pendapatan_bersih: number
  catatan: string
}

export interface ChartPoint {
  label: string
  total: number
  pendapatan: number
  net_income: number
  janjang: number
  harga_avg: number
  per_lahan: Record<string, number>
}

export interface BiayaItem {
  jenis: string
  total: number
}

export interface UpcomingItem {
  tanggal: string
  jenis_perawatan: string
  nama_blok: string
  keterangan: string
}

export interface DashboardData {
  period: string
  selected_lahan: string
  lahan_list: LahanInfo[]
  total_berat_ton: number
  total_pendapatan: number
  total_biaya: number
  net_income: number
  chart_data: ChartPoint[]
  biaya_breakdown: BiayaItem[]
  upcoming_perawatan: UpcomingItem[]
  last_harga_per_kg: number
  avg_ton_per_period: number
  recent_panen: PanenRow[]
  recent_perawatan: PerawatanRow[]
  recent_pendapatan: PendapatanRow[]
}

export interface AdminUser {
  user_id?: string
  public_id?: string
  email: string
  username: string
  full_name: string
  phone?: string
  role?: 'user' | 'admin'
  created_at?: string
  updated_at?: string
}

export interface SubscriptionView {
  subscription_status: string
  active_farm_limit: number
  current_active_farm_id: string
  access_mode?: string
  can_checkout?: boolean
  days_remaining?: number
  trial_remaining?: number
  plan_name?: string
  plan_price?: number
}
