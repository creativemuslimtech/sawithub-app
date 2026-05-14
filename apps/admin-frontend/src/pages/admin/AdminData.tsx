import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  AdminEmptyState,
  AdminPageHero,
  AdminPagination,
  AdminPanel,
  AdminSearchField,
  AdminSkeleton,
} from '../../components/AdminUI'
import api from '../../api/client'

const DATA_TYPE = 'kunjungan' as const

const KUNJUNGAN_META = { label: 'Kunjungan', icon: '🌐', accent: '#ec4899' }

interface ColDef {
  key: string
  label: string
  format?: 'currency' | 'date' | 'weight' | 'number' | 'badge-device' | 'truncate'
}

const COLS: ColDef[] = [
  { key: 'ip_address', label: 'IP Address' },
  { key: 'country', label: 'Negara' },
  { key: 'city', label: 'Kota' },
  { key: 'device_type', label: 'Perangkat', format: 'badge-device' },
  { key: 'page', label: 'Halaman', format: 'truncate' },
  { key: 'created_at', label: 'Waktu', format: 'date' },
]

function fmtDate(raw: string) {
  if (!raw || raw === '-') return '-'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }) +
    ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}

function fmtCurrency(v: number) {
  return 'Rp ' + v.toLocaleString('id-ID')
}

function fmtNumber(v: number) {
  return v.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

function formatCell(value: unknown, format?: ColDef['format']) {
  if (value === null || value === undefined || value === '' || value === '-') {
    return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
  }
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  switch (format) {
    case 'currency':
      return <span style={{ color: '#4ade80' }}>{fmtCurrency(isNaN(num) ? 0 : num)}</span>
    case 'weight':
      return <span>{isNaN(num) ? String(value) : fmtNumber(num)}</span>
    case 'number':
      return <span>{isNaN(num) ? String(value) : fmtNumber(num)}</span>
    case 'date':
      return <span style={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{fmtDate(String(value))}</span>
    case 'badge-device': {
      const v = String(value).toLowerCase()
      const isWeb = v === 'web'
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{
          background: isWeb ? 'rgba(56,189,248,0.15)' : 'rgba(167,139,250,0.15)',
          color: isWeb ? '#38bdf8' : '#a78bfa',
        }}>
          {isWeb ? '🖥 Web' : '📱 Mobile'}
        </span>
      )
    }
    case 'truncate':
      return <span title={String(value)} style={{ color: 'rgba(255,255,255,0.55)' }}>
        {String(value).length > 40 ? String(value).substring(0, 40) + '…' : String(value)}
      </span>
    default:
      return <span>{String(value)}</span>
  }
}

export default function AdminData() {
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    try {
      const { data: response } = await api.get(`/admin/data?type=${DATA_TYPE}`)
      const rows: Record<string, unknown>[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : []
      setData(rows)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setFetchError(true)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(1)
  }, [search])

  const filteredData = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return data
    return data.filter(row => Object.values(row).some(value => String(value ?? '').toLowerCase().includes(needle)))
  }, [data, search])
  const rowsPerPage = 12
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage))
  const visibleRows = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <AdminLayout maxWidth="max-w-7xl">
      <div className="space-y-6">
        <AdminPageHero
          eyebrow="Data Explorer"
          title="Semua data platform dalam pola baca yang lebih rapi."
          description="Data kunjungan: cari cepat, lalu gunakan paging lokal agar tabel besar tetap ringan dibaca. Tampilan mobile berubah menjadi kartu ringkas supaya informasi tetap informatif tanpa geser horizontal berlebihan."
          accent={KUNJUNGAN_META.accent}
        />

        <AdminPanel
          eyebrow="Kontrol Data"
          title="Data kunjungan"
          description="Filter dengan pencarian di bawah. Kolom mencakup IP, lokasi, perangkat, halaman, dan waktu."
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <AdminSearchField
              value={search}
              onChange={setSearch}
              placeholder="Cari data kunjungan..."
              className="flex-1"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="rounded-2xl px-4 py-3 text-sm font-medium transition"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Bersihkan
              </button>
            )}
          </div>
        </AdminPanel>

        {loading ? (
          <AdminSkeleton rows={6} height="h-16" />
        ) : fetchError ? (
          <div className="rounded-[28px] py-12 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="mb-3 text-3xl">⚠️</div>
            <p className="text-sm font-semibold text-white">Gagal memuat data</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/40">
              Terjadi kesalahan saat mengambil data dari server. Periksa koneksi atau coba lagi.
            </p>
            <button
              onClick={fetchData}
              className="mt-5 rounded-2xl px-5 py-2.5 text-sm font-semibold transition"
              style={{ background: 'rgba(236,72,153,0.12)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.25)' }}
            >
              Coba lagi
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <AdminEmptyState
            icon={KUNJUNGAN_META.icon}
            title={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada data kunjungan'}
            description={search ? 'Hapus pencarian atau coba kata kunci lain untuk melihat hasil.' : 'Data kunjungan akan muncul di sini setelah pengguna mengakses platform.'}
          />
        ) : (
          <AdminPanel
            eyebrow={KUNJUNGAN_META.label}
            title={`Tabel ${KUNJUNGAN_META.label}`}
            description={`Menampilkan ${visibleRows.length.toLocaleString('id-ID')} dari ${filteredData.length.toLocaleString('id-ID')} baris yang sesuai.`}
          >
            <div className="hidden overflow-x-auto rounded-2xl md:block"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <table className="w-full min-w-max">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase"
                      style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>#</th>
                    {COLS.map(col => (
                      <th key={col.key}
                        className="px-5 py-3.5 text-left text-xs font-semibold uppercase whitespace-nowrap"
                        style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em' }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, idx) => (
                    <tr key={`${row.id ?? idx}-${idx}`}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {(page - 1) * rowsPerPage + idx + 1}
                      </td>
                      {COLS.map(col => (
                        <td key={col.key} className="px-5 py-3.5 text-sm text-white">
                          {formatCell(row[col.key], col.format)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {visibleRows.map((row, idx) => (
                <article
                  key={`${row.id ?? idx}-mobile`}
                  className="rounded-[24px] p-4"
                  style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{String(row.username ?? row.nama_kebun ?? row.ip_address ?? KUNJUNGAN_META.label)}</p>
                      <p className="text-xs text-white/35 truncate">{String(row.user_email ?? row.page ?? row.country ?? 'Data platform')}</p>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color: KUNJUNGAN_META.accent, background: `${KUNJUNGAN_META.accent}18` }}>
                      #{(page - 1) * rowsPerPage + idx + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {COLS.slice(0, 5).map(col => (
                      <div key={col.key} className="rounded-2xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-[11px] text-white/30">{col.label}</p>
                        <div className="mt-1 text-sm text-white">{formatCell(row[col.key], col.format)}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <AdminPagination
                page={page}
                totalPages={totalPages}
                totalLabel={`Halaman ${page} dari ${totalPages} · ${filteredData.length.toLocaleString('id-ID')} baris`}
                onPrev={() => setPage(p => p - 1)}
                onNext={() => setPage(p => p + 1)}
              />
            )}
          </AdminPanel>
        )}
      </div>
    </AdminLayout>
  )
}
