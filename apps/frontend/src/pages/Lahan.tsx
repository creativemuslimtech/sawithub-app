import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import AppLayout from '../components/AppLayout'
import AppTopbar from '../components/AppTopbar'
import Card from '../components/ds/Card'
import Ring from '../components/ds/Ring'
import Sparkline from '../components/ds/Sparkline'
import Chip from '../components/ds/Chip'
import PalmLeaf from '../components/ds/botanical/PalmLeaf'
import { PlusIcon, FilterIcon, DownloadIcon, LeafIcon } from '../components/ds/icons'
import type { Lahan as LahanType } from '../types'

const BLOCK_COLORS = [
  'var(--forest)',
  'var(--forest-3)',
  'var(--amber-2)',
  'var(--c-sky)',
  'var(--terracotta)',
]

function deriveHealth(tahunTanam: number): number {
  const umur = new Date().getFullYear() - tahunTanam
  if (umur < 3) return 54
  if (umur > 15) return 62
  return Math.min(95, 68 + (umur - 3) * 3)
}

function deriveTrend(luas_ha: number): number[] {
  const base = luas_ha * 1.1
  return Array.from({ length: 10 }, (_, i) => +(base * (0.7 + Math.sin(i * 0.9) * 0.2 + i * 0.03)).toFixed(1))
}

function statusLahan(tahunTanam: number): { label: string; tone: 'forest' | 'amber' } {
  const umur = new Date().getFullYear() - tahunTanam
  if (umur > 15) return { label: 'Replanting', tone: 'amber' }
  if (umur < 3) return { label: 'Muda', tone: 'amber' }
  return { label: 'Produktif', tone: 'forest' }
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
  const avgHealth = lahans.length
    ? Math.round(lahans.reduce((s, l) => s + deriveHealth(l.tahun_tanam), 0) / lahans.length)
    : 0

  const headerActions = (
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="sh-btn sh-btn-ghost sh-btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <FilterIcon size={14} /> Filter
      </button>
      <button className="sh-btn sh-btn-ghost sh-btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <DownloadIcon size={14} /> Ekspor
      </button>
      <Link to="/lahan/add" className="sh-btn sh-btn-primary sh-btn-sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
        <PlusIcon size={14} /> Tambah Kebun
      </Link>
    </div>
  )

  return (
    <AppLayout>
      <AppTopbar
        title="Lahan & Kebun"
        headerActions={headerActions}
      />

      <div style={{ padding: '32px 36px 48px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>
            —— {lahans.length} kebun · {totalLuas.toFixed(1)} hektar total
          </div>
          <h1 className="sh-h-2">
            Setiap blok punya{' '}
            <em className="sh-italic" style={{ color: 'var(--forest)' }}>cerita&nbsp;sendiri</em>.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8, maxWidth: 560 }}>
            Catat luas, jumlah pohon, tahun tanam, dan lokasi setiap blok agar laporan per-hektare akurat.
          </p>
        </div>

        {/* Summary stats band */}
        {!loading && lahans.length > 0 && (
          <Card padded={false} style={{ padding: '20px 28px', marginBottom: 22, position: 'relative', overflow: 'hidden' }}>
            <PalmLeaf size={120} style={{ position: 'absolute', right: -10, top: -20, color: 'var(--forest)', opacity: 0.08 }} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ gap: 24, alignItems: 'center' }}>
              {[
                { l: 'Luas total', v: `${totalLuas.toFixed(1)} ha`, sub: `${lahans.length} blok aktif` },
                { l: 'Total pohon', v: totalPohon.toLocaleString('id-ID'), sub: `umur rata ${umurRata.toFixed(0)} thn` },
              ].map((s, i) => (
                <div key={i} style={{ borderLeft: i > 0 ? '1px solid var(--line-2)' : 0, paddingLeft: i > 0 ? 24 : 0 }}>
                  <div className="sh-eyebrow" style={{ marginBottom: 6 }}>{s.l}</div>
                  <div className="sh-num" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{s.sub}</div>
                </div>
              ))}
              {[
                { l: 'Produksi YTD', v: '—', sub: 'belum ada data' },
                { l: 'Pendapatan YTD', v: '—', sub: 'belum ada data' },
              ].map((s, i) => (
                <div key={i} style={{ borderLeft: '1px solid var(--line-2)', paddingLeft: 24 }}>
                  <div className="sh-eyebrow" style={{ marginBottom: 6 }}>{s.l}</div>
                  <div className="sh-num" style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{s.sub}</div>
                </div>
              ))}
              <div style={{ borderLeft: '1px solid var(--line-2)', paddingLeft: 24 }}>
                <div className="sh-eyebrow" style={{ marginBottom: 6 }}>Skor kesehatan</div>
                <Ring pct={avgHealth} label={String(avgHealth)} size={48} strokeWidth={5} />
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>rata-rata kebun</div>
              </div>
            </div>
          </Card>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, height: 240, opacity: 0.5 }} className="animate-pulse" />
            ))}
          </div>
        )}

        {/* Map + list layout */}
        {!loading && lahans.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 18 }}>
            {/* Topographic map panel */}
            <Card padded={false} style={{ padding: 0, overflow: 'hidden', position: 'relative', minHeight: 600 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #DDE5C7 0%, #C6CFAE 70%, #A8B58A 100%)' }}>
                <svg width="100%" height="100%" viewBox="0 0 600 600" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
                  <defs>
                    <pattern id="topo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M0 30 Q 15 22 30 30 T 60 30" stroke="rgba(45, 60, 30, 0.18)" strokeWidth="0.8" fill="none" />
                      <path d="M0 45 Q 15 38 30 45 T 60 45" stroke="rgba(45, 60, 30, 0.14)" strokeWidth="0.8" fill="none" />
                      <path d="M0 15 Q 15 8 30 15 T 60 15" stroke="rgba(45, 60, 30, 0.14)" strokeWidth="0.8" fill="none" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#topo)" />
                  <path d="M 0 380 C 100 360, 200 410, 320 380 S 540 340, 600 360" stroke="#5E8AA8" strokeWidth="6" fill="none" opacity="0.7" />
                  <path d="M 0 380 C 100 360, 200 410, 320 380 S 540 340, 600 360" stroke="#7CA8C2" strokeWidth="2" fill="none" />
                  <path d="M 60 600 L 180 400 L 280 280 L 420 200 L 600 80" stroke="#8A7548" strokeWidth="3" strokeDasharray="6 5" fill="none" opacity="0.6" />
                  {lahans.slice(0, 3).map((l, i) => {
                    const polygons = [
                      { d: "M 60 80 L 220 60 L 240 200 L 80 220 Z", tx: 150, ty: 150, color: 'rgba(45, 90, 61, 0.35)', stroke: 'var(--forest)' },
                      { d: "M 280 240 L 460 220 L 480 360 L 300 380 Z", tx: 380, ty: 310, color: 'rgba(45, 90, 61, 0.3)', stroke: 'var(--forest-3)' },
                      { d: "M 360 460 L 540 440 L 560 560 L 380 580 Z", tx: 460, ty: 520, color: 'rgba(212, 168, 39, 0.28)', stroke: 'var(--amber-2)' },
                    ]
                    const poly = polygons[i]
                    return (
                      <g key={l.id_lahan}>
                        <path d={poly.d} fill={poly.color} stroke={poly.stroke} strokeWidth="2" />
                        <text x={poly.tx} y={poly.ty} textAnchor="middle" fontFamily="Fraunces" fontSize="18" fontWeight="500" fill={poly.stroke} fontStyle="italic">
                          {l.nama_kebun.charAt(0)}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {/* Map controls */}
                <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['Satellite', 'Topografi', 'Hybrid'].map((l, i) => (
                      <button key={l} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 0, background: i === 1 ? 'var(--ink)' : 'rgba(255,255,255,0.9)', color: i === 1 ? 'var(--paper)' : 'var(--ink-2)' }}>{l}</button>
                    ))}
                  </div>
                  <Chip style={{ background: 'rgba(255,255,255,0.95)', borderColor: 'var(--line)' }}>Pekanbaru · Riau</Chip>
                </div>

                {/* Legend */}
                <div style={{ position: 'absolute', bottom: 16, left: 16, padding: 12, background: 'rgba(255,255,255,0.95)', borderRadius: 10, border: '1px solid var(--line)' }}>
                  <div className="sh-eyebrow" style={{ marginBottom: 8 }}>Legenda</div>
                  {lahans.slice(0, 3).map((l, i) => (
                    <div key={l.id_lahan} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: i < 2 ? 6 : 0 }}>
                      <span style={{ width: 12, height: 12, background: BLOCK_COLORS[i], borderRadius: 3 }} />
                      {l.nama_kebun}
                    </div>
                  ))}
                </div>

                {/* Zoom */}
                <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['+', '−'].map(s => (
                    <button key={s} style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--paper)', border: '1px solid var(--line)', fontSize: 16, fontWeight: 500, cursor: 'pointer', color: 'var(--ink)' }}>{s}</button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Kebun cards list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {lahans.map((lahan, idx) => {
                const color = BLOCK_COLORS[idx % BLOCK_COLORS.length]
                const umur = tahunSekarang - lahan.tahun_tanam
                const health = deriveHealth(lahan.tahun_tanam)
                const trend = deriveTrend(lahan.luas_ha)
                const { label: statusLabel, tone } = statusLahan(lahan.tahun_tanam)
                return (
                  <Card key={lahan.id_lahan} style={{ padding: 22, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                    <PalmLeaf size={80} style={{ position: 'absolute', right: 0, top: -10, color, opacity: 0.08 }} />
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                      <Ring pct={health} color={color} size={56} label={String(health)} strokeWidth={5} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 500, fontFamily: 'var(--f-display)' }}>{lahan.nama_kebun}</h3>
                          <Chip tone={tone}>{statusLabel}</Chip>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                          Ditanam {lahan.tahun_tanam} · umur {umur} tahun · {lahan.lokasi || 'Lokasi belum diisi'}
                        </div>
                      </div>
                      <Link to="/lahan/add" className="sh-btn sh-btn-ghost sh-btn-sm" style={{ textDecoration: 'none', alignSelf: 'start' }}>Detail →</Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 16, paddingTop: 16, borderTop: '1px solid var(--line-2)' }}>
                      {[
                        { l: 'Luas', v: `${lahan.luas_ha} ha` },
                        { l: 'Pohon', v: lahan.jumlah_pohon.toLocaleString('id-ID') },
                        { l: 'Bibit', v: lahan.jenis_bibit || '—' },
                        { l: 'Panen terakhir', v: '—' },
                      ].map((s, j) => (
                        <div key={j}>
                          <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{s.l}</div>
                          <div className="sh-num" style={{ fontSize: 15, fontWeight: 500 }}>{s.v}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Sparkline data={trend} width={180} height={32} color={color} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 4 }}>Produksi 10 minggu</div>
                        <div className="sh-progress" style={{ height: 4 }}>
                          <i style={{ width: `${health}%` }} />
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}

              {/* Add new kebun button */}
              <Link
                to="/lahan/add"
                style={{
                  padding: 22, borderRadius: 14, border: '1.5px dashed var(--line)',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 16,
                  textDecoration: 'none',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--forest-soft)', color: 'var(--forest)', display: 'grid', placeItems: 'center' }}>
                  <PlusIcon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Tambah Blok baru</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Catat luas, pohon, dan tahun tanam</div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && lahans.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--forest-soft)', color: 'var(--forest)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
              <LeafIcon size={28} />
            </div>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>Belum ada kebun</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 24, maxWidth: 360 }}>
              Tambahkan kebun pertama kamu untuk mulai mencatat panen dan biaya perawatan.
            </p>
            <Link to="/lahan/add" className="sh-btn sh-btn-primary sh-btn-lg" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <PlusIcon size={16} /> Tambah Kebun Pertama
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
