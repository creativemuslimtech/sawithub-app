import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import type { Lahan as LahanType } from '../types'

const CAT_COLORS = ['var(--c1)', 'var(--c2)', 'var(--c4)', 'var(--c5)', 'var(--c6)', 'var(--c3)']

function statusLahan(tahunTanam: number): { label: string; chip: string } {
  const umur = new Date().getFullYear() - tahunTanam
  if (umur > 15) return { label: 'Replanting', chip: 'chip-warn' }
  if (umur < 3) return { label: 'Belum panen', chip: 'chip-warn' }
  return { label: 'Aktif', chip: 'chip-emerald' }
}

export default function Lahan() {
  const [lahans, setLahans] = useState<LahanType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchLahans() }, [])

  async function fetchLahans() {
    setLoading(true)
    try {
      const res = await api.get('/CorePlotService')
      setLahans(res.data || [])
    } catch {
      toast.error('Gagal memuat data lahan')
    } finally {
      setLoading(false)
    }
  }

  const totalLuas = lahans.reduce((s, l) => s + l.luas_ha, 0)
  const totalPohon = lahans.reduce((s, l) => s + l.jumlah_pohon, 0)
  const tahunSekarang = new Date().getFullYear()
  const umurRata = lahans.length
    ? lahans.reduce((s, l) => s + (tahunSekarang - l.tahun_tanam), 0) / lahans.length
    : 0

  return (
    <AppLayout>
      <div className="px-7 py-7 pb-12">
        {/* Page header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="eyebrow mb-2">Data Kebun</p>
            <h1 className="display text-4xl font-bold text-ink" style={{ letterSpacing: '-0.025em' }}>Lahan</h1>
            <p className="mt-2 text-sm text-ink-3 max-w-xl">
              Catat nama kebun, luas, jumlah pohon, tahun tanam, dan lokasi setiap blok.
              Data ini dipakai untuk laporan per-hektare dan kalkulator pupuk.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to="/lahan/add"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-emerald-2 transition-colors"
            >
              + Tambah Kebun
            </Link>
          </div>
        </div>

        {/* Summary stat pills */}
        {!loading && lahans.length > 0 && (
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total Kebun', value: `${lahans.length} blok`, color: 'var(--c1)' },
              { label: 'Total Luas', value: `${totalLuas.toFixed(1)} Ha`, color: 'var(--c4)' },
              { label: 'Jumlah Pohon', value: totalPohon.toLocaleString('id-ID'), color: 'var(--c2)' },
              { label: 'Umur Rata-rata', value: `${umurRata.toFixed(0)} tahun`, color: 'var(--c5)' },
              { label: 'Jenis Bibit', value: `${new Set(lahans.map(l => l.jenis_bibit).filter(Boolean)).size} jenis`, color: 'var(--c3)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-4 flex flex-col gap-1">
                <span className="eyebrow" style={{ color: 'var(--ink-4)' }}>{label}</span>
                <span className="num text-xl font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface border border-line rounded-lg-1 h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Farm cards grid */}
        {!loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lahans.map((lahan, idx) => {
              const color = CAT_COLORS[idx % CAT_COLORS.length]
              const umur = tahunSekarang - lahan.tahun_tanam
              const { label: statusLabel, chip: statusChip } = statusLahan(lahan.tahun_tanam)
              return (
                <div key={lahan.id_lahan} className="bg-surface border border-line rounded-lg-1 shadow-card-sm p-5 relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: color }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                      </div>
                      <div>
                        <p className="display text-base font-bold text-ink" style={{ letterSpacing: '-0.015em' }}>
                          {lahan.nama_kebun}
                        </p>
                        <p className="text-xs text-ink-4 mt-0.5 flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {lahan.lokasi || '—'}
                        </p>
                      </div>
                    </div>
                    <span className={`chip ${statusChip} text-[11px]`}>{statusLabel}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-line">
                    {[
                      { label: 'Luas', value: `${lahan.luas_ha} Ha` },
                      { label: 'Pohon', value: lahan.jumlah_pohon.toLocaleString('id-ID') },
                      { label: 'Umur', value: `${umur} thn` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[11px] text-ink-4">{label}</p>
                        <p className="num text-base font-bold text-ink mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bibit */}
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-ink-4">
                      Bibit: <strong className="text-ink">{lahan.jenis_bibit || '—'}</strong>
                    </span>
                    <Link
                      to="/lahan/add"
                      className="inline-flex items-center gap-1 font-bold"
                      style={{ color: 'var(--emerald-2)' }}
                    >
                      Edit →
                    </Link>
                  </div>
                </div>
              )
            })}

            {/* Add new tile */}
            <Link
              to="/lahan/add"
              className="flex items-center justify-center rounded-lg-1 border-2 border-dashed border-line bg-white min-h-[240px] cursor-pointer hover:border-emerald transition-colors"
              style={{ borderStyle: 'dashed' }}
            >
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'var(--paper-2)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" stroke="var(--emerald-2)">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <p className="display text-base font-bold text-ink">Tambah Kebun Baru</p>
                <p className="text-xs text-ink-4 mt-1">Isi nama, luas, jumlah pohon, dan tahun tanam.</p>
              </div>
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!loading && lahans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--emerald-soft)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-2)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <p className="display text-xl font-bold text-ink mb-2">Belum ada kebun</p>
            <p className="text-sm text-ink-3 mb-6 max-w-sm">
              Tambahkan kebun pertama kamu untuk mulai mencatat panen dan biaya perawatan.
            </p>
            <Link
              to="/lahan/add"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-emerald-2 transition-colors"
            >
              + Tambah Kebun Pertama
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
