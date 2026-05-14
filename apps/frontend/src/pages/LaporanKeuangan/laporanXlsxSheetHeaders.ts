/**
 * Column header rows for laporan keuangan XLSX (QA-02 regression anchor).
 * Keep in sync with tests/fixtures/laporan-xlsx-expected-headers.json.
 */
export const LAPORAN_XLSX_RINGKASAN_TABLE_HEADER = ['Ringkasan Uang', 'Nilai Utama', 'Catatan Singkat'] as const

export const LAPORAN_XLSX_TREN_FINANSIAL_HEADER = [
  'Periode',
  'Produksi (Ton)',
  'Pendapatan',
  'Biaya Panen',
  'Biaya Perawatan',
  'Total Biaya',
  'Laba Bersih',
  'Harga Rata-rata/Kg',
] as const

export const LAPORAN_XLSX_URUTAN_KEBUN_HEADER = [
  'Peringkat',
  'Kebun',
  'Luas (Ha)',
  'Jumlah Panen',
  'Total Ton',
  'Produktivitas (T/Ha)',
  'Total Pendapatan',
  'Laba Bersih',
] as const

export const LAPORAN_XLSX_DAFTAR_PANEN_HEADER = [
  'Tanggal',
  'Kebun',
  'Luas (Ha)',
  'Janjang',
  'Berat (Kg)',
  'Berat (Ton)',
  'Harga/Kg',
  'Pendapatan',
  'Biaya Panen',
  'Laba Bersih',
  'Produktivitas (T/Ha)',
  'Catatan',
] as const

/** Plain object for parity checks against tests/fixtures/laporan-xlsx-expected-headers.json */
export const LAPORAN_XLSX_HEADERS_FIXTURE_RECORD = {
  ringkasanTableHeader: [...LAPORAN_XLSX_RINGKASAN_TABLE_HEADER],
  dataSheetHeaders: {
    'Tren Finansial': [...LAPORAN_XLSX_TREN_FINANSIAL_HEADER],
    'Urutan Kebun': [...LAPORAN_XLSX_URUTAN_KEBUN_HEADER],
    'Daftar Panen': [...LAPORAN_XLSX_DAFTAR_PANEN_HEADER],
  },
} as const
