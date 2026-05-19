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
const KUNJUNGAN_META = { label: 'Kunjungan', accent: 'var(--c-sky)' }

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

function fmtCurrency(v: number) { return 'Rp ' + v.toLocaleString('id-ID') }
function fmtNumber(v: number) { return v.toLocaleString('id-ID', { maximumFractionDigits: 2 }) }

function formatCell(value: unknown, format?: ColDef['format']) {
  if (value === null || value === undefined || value === '' || value === '-') {
    return <span style={{ color: 'var(--ink-5)' }}>—</span>
  }
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  switch (format) {
    case 'currency':
      return <span style={{ color: 'var(--forest)', fontWeight: 600 }}>{fmtCurrency(isNaN(num) ? 0 : num)}</span>
    case 'weight':
    case 'number':
      return <span style={{ fontFamily: 'var(--f-mono)' }}>{isNaN(num) ? String(value) : fmtNumber(num)}</span>
    case 'date':
      return <span style={{ color: 'var(--ink-4)', whiteSpace: 'nowrap', fontFamily: 'var(--f-mono)', fontSize: 12 }}>{fmtDate(String(value))}</span>
    case 'badge-device': {
      const v = String(value).toLowerCase()
      const isWeb = v === 'web'
      return (
        <span className="sh-chip" style={{ color: isWeb ? 'var(--c-sky)' : 'var(--forest-3)', background: isWeb ? 'rgba(74,122,140,0.12)' : 'var(--forest-soft)' }}>
          {isWeb ? 'Web' : 'Mobile'}
        </span>
      )
    }
    case 'truncate':
      return (
        <span title={String(value)} style={{ color: 'var(--ink-3)' }}>
          {String(value).length > 40 ? String(value).substring(0, 40) + '…' : String(value)}
        </span>
      )
    default:
      return <span style={{ color: 'var(--ink-2)' }}>{String(value)}</span>
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
    } catch {
      setFetchError(true)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search])

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
          description="Data kunjungan: cari cepat, lalu gunakan paging lokal agar tabel besar tetap ringan dibaca."
        />

        <AdminPanel eyebrow="Kontrol Data" title="Data kunjungan" description="Filter dengan pencarian. Kolom mencakup IP, lokasi, perangkat, halaman, dan waktu.">
          <div style={{ display: 'flex', gap: 10 }}>
            <AdminSearchField value={search} onChange={setSearch} placeholder="Cari data kunjungan..." className="flex-1" />
            {search && (
              <button onClick={() => setSearch('')} className="sh-btn sh-btn-ghost sh-btn-sm" style={{ borderRadius: 10 }}>Bersihkan</button>
            )}
          </div>
        </AdminPanel>

        {loading ? (
          <AdminSkeleton rows={6} height="h-16" />
        ) : fetchError ? (
          <AdminEmptyState
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            title="Gagal memuat data"
            description="Terjadi kesalahan saat mengambil data dari server."
          />
        ) : filteredData.length === 0 ? (
          <AdminEmptyState
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>}
            title={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada data kunjungan'}
            description={search ? 'Hapus pencarian atau coba kata kunci lain.' : 'Data kunjungan muncul setelah pengguna mengakses platform.'}
          />
        ) : (
          <AdminPanel eyebrow={KUNJUNGAN_META.label} title={`Tabel ${KUNJUNGAN_META.label}`} description={`${visibleRows.length.toLocaleString('id-ID')} dari ${filteredData.length.toLocaleString('id-ID')} baris.`}>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto" style={{ borderRadius: 10, border: '1px solid var(--line-2)', overflow: 'hidden' }}>
              <table className="w-full min-w-max" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line-2)' }}>
                    <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>#</th>
                    {COLS.map(col => (
                      <th key={col.key} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-4)', fontFamily: 'var(--f-mono)', whiteSpace: 'nowrap' }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, idx) => (
                    <tr key={`${row.id ?? idx}-${idx}`} style={{ borderBottom: '1px solid var(--line-2)' }} className="transition hover:bg-[var(--paper-2)]">
                      <td style={{ padding: '11px 18px', fontSize: 11, color: 'var(--ink-5)', fontFamily: 'var(--f-mono)' }}>
                        {(page - 1) * rowsPerPage + idx + 1}
                      </td>
                      {COLS.map(col => (
                        <td key={col.key} style={{ padding: '11px 18px', fontSize: 13 }}>
                          {formatCell(row[col.key], col.format)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {visibleRows.map((row, idx) => (
                <article key={`${row.id ?? idx}-mobile`} className="sh-card" style={{ padding: 14, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {String(row.ip_address ?? KUNJUNGAN_META.label)}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {String(row.country ?? row.page ?? '-')}
                      </p>
                    </div>
                    <span className="sh-chip" style={{ color: 'var(--c-sky)' }}>#{(page - 1) * rowsPerPage + idx + 1}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                    {COLS.slice(0, 5).map(col => (
                      <div key={col.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--cream)', borderRadius: 8 }}>
                        <p style={{ fontSize: 11, color: 'var(--ink-4)' }}>{col.label}</p>
                        <div style={{ fontSize: 12 }}>{formatCell(row[col.key], col.format)}</div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <AdminPagination page={page} totalPages={totalPages} totalLabel={`Halaman ${page} dari ${totalPages} · ${filteredData.length.toLocaleString('id-ID')} baris`} onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />
            )}
          </AdminPanel>
        )}
      </div>
    </AdminLayout>
  )
}
