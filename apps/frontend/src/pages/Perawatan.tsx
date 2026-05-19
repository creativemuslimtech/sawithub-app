import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, ResponsiveContainer,
} from 'recharts'
import api from '../api/client'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import AppTopbar from '../components/AppTopbar'
import { PlusIcon } from '../components/ds/icons'
import type { PerawatanRow, Lahan } from '../types'
import { formatRupiahDisplay } from '../utils/rupiah'

const rp = formatRupiahDisplay

function fmtDate(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', timeZone: 'Asia/Jakarta' })
}

const JENIS_COLORS: Record<string, string> = {
  pemupukan: 'var(--c1)',
  pupuk: 'var(--c1)',
  penyemprotan: 'var(--c3)',
  semprot: 'var(--c3)',
  pruning: 'var(--c5)',
  weeding: 'var(--c6)',
  tebas: 'var(--c6)',
  default: 'var(--c2)',
}

function getColor(jenis: string): string {
  const key = jenis?.toLowerCase() || ''
  for (const [k, v] of Object.entries(JENIS_COLORS)) {
    if (key.includes(k)) return v
  }
  return JENIS_COLORS.default
}

function JenisIcon({ jenis, color }: { jenis: string; color: string }) {
  const key = jenis?.toLowerCase() || ''
  if (key.includes('pupuk') || key.includes('pemupukan')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color === 'white' ? 'white' : color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
        <path d="M12 6v6l4 2" />
      </svg>
    )
  }
  if (key.includes('semprot') || key.includes('penyemprotan')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3l18 18M10.5 10.5A3 3 0 0 1 13 13" /><path d="M5 19a7 7 0 0 1 7-7" /><path d="M21 3a16 16 0 0 0-4.97 3.03" />
      </svg>
    )
  }
  if (key.includes('pruning')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3v18M18 3v18M3 9h18M3 15h18" />
      </svg>
    )
  }
  if (key.includes('weeding') || key.includes('tebas')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-0 5-4 9-10 9z" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  )
}

export default function Perawatan() {
  const [perawatans, setPerawatans] = useState<PerawatanRow[]>([])
  const [lahans, setLahans] = useState<Lahan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/CoreMaintenanceService'),
      api.get('/CorePlotService'),
    ]).then(([pr, lr]) => {
      setPerawatans(pr.data || [])
      setLahans(lr.data || [])
    }).catch(() => toast.error('Gagal memuat data perawatan'))
      .finally(() => setLoading(false))
  }, [])

  const lahanMap = Object.fromEntries(lahans.map(l => [l.id_lahan, l.nama_kebun]))

  const totalBiaya = perawatans.reduce((s, p) => s + (p.biaya || p.total_harga_material + p.biaya_pekerja || 0), 0)
  const totalMaterial = perawatans.reduce((s, p) => s + (p.total_harga_material || 0), 0)
  const totalTenaga = perawatans.reduce((s, p) => s + (p.biaya_pekerja || 0), 0)
  const totalLuas = lahans.reduce((s, l) => s + l.luas_ha, 0)
  const perHektare = totalLuas > 0 ? totalBiaya / totalLuas : 0

  const sorted = [...perawatans].sort((a, b) =>
    new Date(b.tanggal_perawatan).getTime() - new Date(a.tanggal_perawatan).getTime()
  )

  // Build sparkline data for KPI cards (rolling 8 periods from monthly sums)
  const biayaByMonth = sorted.slice(0, 8).map(p => p.biaya || (p.total_harga_material + p.biaya_pekerja) || 0)
  const materialByMonth = sorted.slice(0, 8).map(p => p.total_harga_material || 0)
  const tenagaByMonth = sorted.slice(0, 8).map(p => p.biaya_pekerja || 0)

  // Build category breakdown
  const categoryMap: Record<string, number> = {}
  for (const p of perawatans) {
    const key = p.jenis_perawatan || 'Lainnya'
    categoryMap[key] = (categoryMap[key] || 0) + (p.biaya || p.total_harga_material + p.biaya_pekerja || 0)
  }
  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const legend = [
    { label: 'Pupuk', color: 'var(--c1)' },
    { label: 'Semprot', color: 'var(--c3)' },
    { label: 'Pruning', color: 'var(--c5)' },
    { label: 'Weeding', color: 'var(--c6)' },
  ]

  return (
    <AppLayout>
      <AppTopbar
        title="Perawatan Kebun"
        subtitle="Catat Rawat"
        actions={
          <Link
            to="/perawatan/add"
            className="sh-btn sh-btn-primary sh-btn-sm"
            style={{ borderRadius: 999, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <PlusIcon size={14} /> Catat Perawatan
          </Link>
        }
      />
      <div style={{ padding: '32px 36px 48px' }}>

        {/* KPI cards */}
        {!loading && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-5">
            {[
              { label: 'Biaya rawat', value: rp(totalBiaya), sub: `${perawatans.length} catatan`, accent: 'var(--c2)', data: biayaByMonth, stroke: 'var(--c2)', fill: 'rgba(217,106,44,0.18)' },
              { label: 'Material', value: rp(totalMaterial), sub: 'pupuk + pestisida', accent: 'var(--c4)', data: materialByMonth, stroke: 'var(--c4)', fill: 'rgba(28,142,138,0.18)' },
              { label: 'Tenaga kerja', value: rp(totalTenaga), sub: 'biaya pekerja', accent: 'var(--c5)', data: tenagaByMonth, stroke: 'var(--c5)', fill: 'rgba(125,58,107,0.18)' },
              { label: 'Per hektare', value: rp(perHektare), sub: 'biaya rawat / ha', accent: 'var(--c3)', data: biayaByMonth, stroke: 'var(--c3)', fill: 'rgba(212,160,23,0.18)' },
            ].map(({ label, value, sub, accent, data, stroke, fill }) => (
              <div key={label} className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-5"
                style={{ borderTop: `3px solid ${accent}` }}>
                <p className="sh-eyebrow mb-1">{label}</p>
                <p className="num text-2xl font-bold text-ink mt-1" style={{ letterSpacing: '-0.02em' }}>{value}</p>
                <p className="text-xs text-ink-4 mt-0.5">{sub}</p>
                {data.length > 1 && (
                  <div className="mt-3 -mx-1">
                    <ResponsiveContainer width="100%" height={48}>
                      <AreaChart data={data.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} fill={fill} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Left: timeline */}
          <div className="lg:col-span-3">
            <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="display text-xl font-bold text-ink">Timeline perawatan</h3>
                <div className="flex gap-3">
                  {legend.map(({ label, color }) => (
                    <span key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3">
                      <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'var(--paper-2)' }} />)}
                </div>
              ) : sorted.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm text-ink-4">Belum ada data perawatan.</p>
                  <Link to="/perawatan/add" className="mt-3 inline-flex text-sm font-semibold" style={{ color: 'var(--terracotta-2)' }}>+ Catat perawatan pertama →</Link>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[18px] top-0 bottom-0 w-0.5" style={{ background: 'var(--line)' }} />
                  {sorted.map((p) => {
                    const color = getColor(p.jenis_perawatan)
                    const biaya = p.biaya || (p.total_harga_material + p.biaya_pekerja) || 0
                    const lahanName = lahanMap[p.id_lahan] || `Lahan #${p.id_lahan}`
                    return (
                      <div key={p.id_perawatan} className="flex gap-4 py-3.5 relative">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10"
                          style={{ background: color }}
                        >
                          <JenisIcon jenis={p.jenis_perawatan} color="white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-mono text-[11px] text-ink-4">{fmtDate(p.tanggal_perawatan)}</p>
                              <p className="text-[14.5px] font-bold text-ink mt-0.5">{p.jenis_perawatan}</p>
                              <div className="flex flex-wrap gap-3 mt-1 text-xs text-ink-3">
                                <span>{lahanName}</span>
                                {p.bahan && <span>· {p.jumlah} {p.satuan} {p.bahan}</span>}
                                {p.biaya_pekerja > 0 && <span>· TK: {rp(p.biaya_pekerja)}</span>}
                              </div>
                            </div>
                            <p className="num text-base font-bold text-ink shrink-0 ml-4">{rp(biaya)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {sorted.length > 0 && (
                <div className="mt-4 pt-4 border-t border-line flex justify-between items-center text-xs text-ink-3">
                  <span>{sorted.length} catatan perawatan</span>
                  <Link to="/perawatan/add" className="font-semibold" style={{ color: 'var(--terracotta-2)' }}>+ Catat perawatan baru →</Link>
                </div>
              )}
            </div>
          </div>

          {/* Right: breakdown + AI insight */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Category breakdown */}
            <div className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-6">
              <p className="sh-eyebrow mb-1">Biaya per jenis</p>
              <h3 className="display text-xl font-bold text-ink mt-1 mb-5">Komposisi rawat</h3>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'var(--paper-2)' }} />)}
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-ink-4">Belum ada data</p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {categories.map(([name, amount]) => {
                    const pct = totalBiaya > 0 ? (amount / totalBiaya) * 100 : 0
                    const color = getColor(name)
                    return (
                      <div key={name}>
                        <div className="flex justify-between mb-1.5 text-sm">
                          <span className="font-semibold text-ink">{name}</span>
                          <span className="num font-bold text-xs">
                            {rp(amount)} <span className="text-ink-4 font-normal">· {pct.toFixed(0)}%</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--paper-2)' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* AI insight card */}
            <div
              className="rounded-lg-1 p-5"
              style={{ background: 'var(--terra-soft)', border: '1px solid rgba(217,106,44,0.22)' }}
            >
              <div className="flex gap-3 items-start">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--terracotta)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--terracotta-2)' }}>Saran AI</p>
                  <p className="text-sm leading-relaxed mt-1" style={{ color: 'var(--ink-2)' }}>
                    Bandingkan biaya rawat per hektare dengan hasil panen untuk melihat efisiensi kebun.
                    Cek <strong>Kalkulator Pupuk</strong> untuk hitung ulang dosis sesuai umur tanaman.
                  </p>
                  <Link
                    to="/kalkulator-pupuk"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold"
                    style={{ color: 'var(--terracotta-2)' }}
                  >
                    Buka kalkulator →
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick add */}
            <div
              className="rounded-lg-1 p-5"
              style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}
            >
              <p className="sh-eyebrow mb-1">Tambah catatan baru</p>
              <p className="text-sm text-ink-3 mt-1 mb-4 leading-relaxed">
                Catat pupuk, semprot, pruning, atau pekerjaan lainnya lengkap dengan bahan dan tenaga kerja.
              </p>
              <Link
                to="/perawatan/add"
                className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--ink)' }}
              >
                Buka formulir perawatan →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
