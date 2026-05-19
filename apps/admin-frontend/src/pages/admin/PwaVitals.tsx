// TODO[backend-pending]: GET /admin/AppService/pwa/vitals/routes — CWV 75p per route, 28d
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import Card from '../../components/ds/Card'
import Btn from '../../components/ds/Btn'
import Chip from '../../components/ds/Chip'
import { DownloadIcon } from '../../components/ds/icons'

type Verdict = 'good' | 'needs-improvement' | 'poor'

const ROUTES = [
  { r: '/dashboard',         req: '84.2k', lcp: 1.42, lcpC: 'good' as Verdict,              inp: 124, inpC: 'good' as Verdict,              cls: 0.02, clsC: 'good' as Verdict,              ttfb: 280, c: 'var(--forest)' },
  { r: '/panen',             req: '62.8k', lcp: 1.68, lcpC: 'good' as Verdict,              inp: 142, inpC: 'good' as Verdict,              cls: 0.04, clsC: 'good' as Verdict,              ttfb: 312, c: 'var(--forest)' },
  { r: '/panen/add',         req: '48.4k', lcp: 1.84, lcpC: 'good' as Verdict,              inp: 168, inpC: 'good' as Verdict,              cls: 0.06, clsC: 'good' as Verdict,              ttfb: 348, c: 'var(--forest)' },
  { r: '/laporan-keuangan',  req: '42.1k', lcp: 2.62, lcpC: 'needs-improvement' as Verdict, inp: 218, inpC: 'needs-improvement' as Verdict, cls: 0.08, clsC: 'good' as Verdict,              ttfb: 412, c: 'var(--amber-2)', culprit: 'Recharts bundle 184KB · 248 row table' },
  { r: '/kalkulator-pupuk',  req: '18.4k', lcp: 1.94, lcpC: 'good' as Verdict,              inp: 188, inpC: 'good' as Verdict,              cls: 0.06, clsC: 'good' as Verdict,              ttfb: 322, c: 'var(--forest)' },
  { r: '/lahan',             req: '32.6k', lcp: 2.14, lcpC: 'good' as Verdict,              inp: 162, inpC: 'good' as Verdict,              cls: 0.12, clsC: 'needs-improvement' as Verdict, ttfb: 358, c: 'var(--amber-2)', culprit: 'Map tiles lazy load shift' },
  { r: '/harga-tbs',         req: '28.8k', lcp: 1.32, lcpC: 'good' as Verdict,              inp: 98,  inpC: 'good' as Verdict,              cls: 0.02, clsC: 'good' as Verdict,              ttfb: 218, c: 'var(--forest)' },
  { r: '/keuangan',          req: '12.4k', lcp: 3.28, lcpC: 'poor' as Verdict,              inp: 412, inpC: 'poor' as Verdict,              cls: 0.04, clsC: 'good' as Verdict,              ttfb: 624, c: 'var(--terracotta-2)', culprit: '12-bulan aggregation un-cached · main thread blocked' },
  { r: '/profile',           req: '8.6k',  lcp: 1.18, lcpC: 'good' as Verdict,              inp: 84,  inpC: 'good' as Verdict,              cls: 0.01, clsC: 'good' as Verdict,              ttfb: 184, c: 'var(--forest)' },
  { r: '/',                  req: '184k',  lcp: 1.72, lcpC: 'good' as Verdict,              inp: 138, inpC: 'good' as Verdict,              cls: 0.05, clsC: 'good' as Verdict,              ttfb: 268, c: 'var(--forest)' },
]

function verdictColor(v: Verdict) {
  return v === 'good' ? 'var(--forest)' : v === 'needs-improvement' ? 'var(--amber-2)' : 'var(--terracotta-2)'
}

function LcpTrendChart() {
  const days = 14
  const data: Record<string, number[]> = {
    '/dashboard': [1.6, 1.55, 1.5, 1.48, 1.45, 1.42, 1.4, 1.42, 1.4, 1.42, 1.43, 1.42, 1.42, 1.42],
    '/laporan':   [2.92, 2.84, 2.78, 2.72, 2.68, 2.65, 2.62, 2.6, 2.62, 2.62, 2.62, 2.6, 2.62, 2.62],
    '/panen':     [1.9, 1.86, 1.82, 1.78, 1.74, 1.72, 1.7, 1.68, 1.66, 1.68, 1.68, 1.68, 1.68, 1.68],
    '/keuangan':  [3.0, 3.05, 3.1, 3.18, 3.22, 3.24, 3.26, 3.28, 3.28, 3.28, 3.28, 3.28, 3.28, 3.28],
    '/lahan':     [2.4, 2.35, 2.28, 2.24, 2.2, 2.18, 2.16, 2.14, 2.14, 2.14, 2.14, 2.14, 2.14, 2.14],
  }
  const colors: Record<string, string> = {
    '/dashboard': 'var(--forest)',
    '/laporan': 'var(--amber-2)',
    '/panen': 'var(--forest-3)',
    '/keuangan': 'var(--terracotta-2)',
    '/lahan': 'var(--c-bark)',
  }

  const max = 4, min = 0.5
  const w = 700, h = 260, padL = 40, padR = 20, padT = 16, padB = 30
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const stepX = innerW / (days - 1)
  const yFor = (v: number) => padT + innerH - ((v - min) / (max - min)) * innerH
  const line = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${padL + i * stepX} ${yFor(v)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {[1, 2, 3, 4].map((y, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={yFor(y)} y2={yFor(y)} stroke="var(--line-2)" />
          <text x={padL - 8} y={yFor(y) + 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--ink-4)">{y}s</text>
        </g>
      ))}
      <line x1={padL} x2={w - padR} y1={yFor(2.5)} y2={yFor(2.5)} stroke="var(--amber-2)" strokeDasharray="4 3" strokeWidth="1" opacity="0.6" />
      <text x={w - padR - 4} y={yFor(2.5) - 4} fontSize="9" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--amber-2)">good ≤ 2.5s</text>
      <line x1={padL} x2={w - padR} y1={yFor(4)} y2={yFor(4)} stroke="var(--terracotta)" strokeDasharray="4 3" strokeWidth="1" opacity="0.4" />

      {Object.entries(data).map(([k, arr]) => (
        <g key={k}>
          <path d={line(arr)} stroke={colors[k]} strokeWidth="2" fill="none" />
          <text x={padL + (days - 1) * stepX + 6} y={yFor(arr[arr.length - 1]) + 4} fontSize="10" fontFamily="var(--f-mono)" fill={colors[k]}>{k}</text>
        </g>
      ))}
    </svg>
  )
}

export default function PwaVitals() {
  return (
    <AdminLayout
      topbarRight={
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm">Buka Search Console →</Btn>
          <Btn variant="primary" size="sm" leading={<DownloadIcon size={14} />}>Ekspor breakdown</Btn>
        </div>
      }
    >
      {import.meta.env.DEV && <div style={{ background: 'var(--amber-tint)', border: '1px solid rgba(212,168,39,0.35)', borderRadius: 8, padding: '8px 14px', fontSize: 11.5, fontFamily: 'var(--f-mono)', color: 'var(--amber-2)', marginBottom: 16 }}>⚠ Data dummy · API belum tersedia · Lihat IMPLEMENTATION_REPORT.md</div>}

      {/* Breadcrumb */}
      <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--ink-4)', display: 'flex', gap: 6, alignItems: 'center', fontFamily: 'var(--f-mono)' }}>
        <Link to="/admin/apps" style={{ color: 'inherit', textDecoration: 'none' }}>Apps</Link>
        <span style={{ color: 'var(--ink-5)' }}>/</span>
        <Link to="/admin/apps/pwa" style={{ color: 'inherit', textDecoration: 'none' }}>PWA</Link>
        <span style={{ color: 'var(--ink-5)' }}>/</span>
        <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>Web Vitals · per-route</span>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Core Web Vitals · 75p · 28 hari</div>
          <h1 className="sh-h-2">
            <em className="sh-italic" style={{ color: 'var(--forest)' }}>7 dari 10</em> route lulus standar — <em className="sh-italic" style={{ color: 'var(--terracotta-2)' }}>1 route</em> butuh perhatian segera.
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 8, fontFamily: 'var(--f-mono)' }}>
            Sumber: real-user metrics dari sw.js beacon · 1.842.184 measurement
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['28 hari', '7 hari', '24 jam', 'Live'].map((p, i) => (
            <button key={p} style={{
              padding: '8px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
              background: i === 0 ? 'var(--ink)' : 'var(--paper)',
              color: i === 0 ? 'var(--paper)' : 'var(--ink-3)',
              border: i === 0 ? 'none' : '1px solid var(--line-2)',
              cursor: 'pointer', fontFamily: 'var(--f-mono)',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Aggregate gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { l: 'LCP · 75p', v: '1,84', unit: 's', goodPct: 78, niPct: 18, poorPct: 4 },
          { l: 'INP · 75p', v: '148', unit: 'ms', goodPct: 82, niPct: 14, poorPct: 4 },
          { l: 'CLS · 75p', v: '0,04', unit: '', goodPct: 91, niPct: 8, poorPct: 1 },
          { l: 'TTFB · 75p', v: '324', unit: 'ms', goodPct: 96, niPct: 3, poorPct: 1 },
        ].map((m, i) => (
          <Card key={i} padded={false} style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, color: 'var(--forest)' }}>{m.l}</span>
              <Chip tone="forest" style={{ fontFamily: 'var(--f-mono)' }}>{m.goodPct}% good</Chip>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 12 }}>
              <span className="sh-num" style={{ fontSize: 30, fontWeight: 400, letterSpacing: '-0.02em' }}>{m.v}</span>
              <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>{m.unit}</span>
            </div>
            <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${m.goodPct}%`, background: 'var(--forest)' }} />
              <div style={{ width: `${m.niPct}%`, background: 'var(--amber)' }} />
              <div style={{ width: `${m.poorPct}%`, background: 'var(--terracotta)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>
              <span>Good {m.goodPct}%</span>
              <span>NI {m.niPct}%</span>
              <span>Poor {m.poorPct}%</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Per-route table */}
      <Card padded={false} style={{ padding: 0, overflow: 'hidden', marginBottom: 22 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Web Vitals per route · sorted by traffic</div>
            <h3 className="sh-h-4">10 route teratas · 522k visits</h3>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Semua', 'Lulus', 'NI', 'Poor'].map((t, i) => (
              <button key={t} style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 600,
                background: i === 0 ? 'var(--ink)' : 'var(--paper)',
                color: i === 0 ? 'var(--paper)' : 'var(--ink-3)',
                border: i === 0 ? 'none' : '1px solid var(--line-2)', cursor: 'pointer',
                fontFamily: 'var(--f-mono)',
              }}>{t}</button>
            ))}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--f-mono)' }}>
          <thead>
            <tr style={{ background: 'var(--paper-2)' }}>
              {[
                { l: 'Route', a: 'left' as const }, { l: 'Sesi', a: 'right' as const },
                { l: 'LCP (s)', a: 'right' as const }, { l: 'INP (ms)', a: 'right' as const },
                { l: 'CLS', a: 'right' as const }, { l: 'TTFB (ms)', a: 'right' as const },
                { l: 'Verdict', a: 'left' as const },
              ].map(h => (
                <th key={h.l} style={{ padding: '11px 18px', textAlign: h.a, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--ink-4)' }}>{h.l}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ fontSize: 12 }}>
            {ROUTES.map((r, i) => (
              <>
                <tr key={i} style={{ borderTop: '1px solid var(--line-2)', background: r.culprit ? 'var(--amber-tint)' : 'transparent' }}>
                  <td style={{ padding: '13px 18px', color: 'var(--ink-2)', fontWeight: 600 }}>{r.r}</td>
                  <td style={{ padding: '13px 18px', textAlign: 'right', color: 'var(--ink-3)' }}>{r.req}</td>
                  <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                    <span style={{ color: verdictColor(r.lcpC), fontWeight: 600 }}>{r.lcp.toFixed(2)}</span>
                  </td>
                  <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                    <span style={{ color: verdictColor(r.inpC), fontWeight: 600 }}>{r.inp}</span>
                  </td>
                  <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                    <span style={{ color: verdictColor(r.clsC), fontWeight: 600 }}>{r.cls.toFixed(2)}</span>
                  </td>
                  <td style={{ padding: '13px 18px', textAlign: 'right', color: 'var(--ink-3)' }}>{r.ttfb}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <Chip style={{
                      fontFamily: 'var(--f-mono)',
                      background: r.c === 'var(--forest)' ? 'var(--forest-soft)' : r.c === 'var(--amber-2)' ? 'var(--amber-tint)' : 'var(--terra-soft)',
                      color: r.c, borderColor: 'transparent',
                    }}>● {r.c === 'var(--forest)' ? 'lulus' : r.c === 'var(--amber-2)' ? 'perlu perbaikan' : 'buruk'}</Chip>
                  </td>
                </tr>
                {r.culprit && (
                  <tr key={`${i}-culprit`} style={{ background: r.c === 'var(--terracotta-2)' ? 'var(--terra-soft)' : 'var(--amber-tint)' }}>
                    <td colSpan={7} style={{ padding: '8px 18px 12px 36px', fontSize: 11.5, color: 'var(--ink-3)' }}>
                      <span style={{ color: r.c, marginRight: 8, fontFamily: 'var(--f-mono)', fontWeight: 700 }}>↳ root cause</span>
                      {r.culprit}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Worst route deep-dive */}
      <Card padded={false} style={{ padding: 0, marginBottom: 22, overflow: 'hidden', border: '1px solid rgba(184,84,43,0.3)' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--line-2)', background: 'var(--terra-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="sh-eyebrow" style={{ color: 'var(--terracotta-2)', marginBottom: 4 }}>—— Drilldown · paling buruk</div>
            <h3 className="sh-h-4" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--terracotta-2)' }}>/keuangan</span>
              <Chip tone="terra" style={{ fontFamily: 'var(--f-mono)' }}>3 vitals fail</Chip>
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm">Buka recording →</Btn>
            <Btn variant="amber" size="sm">Buat issue · GitHub</Btn>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 0 }}>
          {/* Waterfall */}
          <div style={{ padding: 24, borderRight: '1px solid var(--line-2)' }}>
            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 14 }}>Resource waterfall · session sample</div>
            {[
              { l: 'GET /keuangan (HTML)', start: 0, dur: 624, warn: false, c: 'var(--ink-2)', isMark: false },
              { l: 'GET /assets/index-a8f3.js', start: 280, dur: 412, warn: false, c: 'var(--c-bark)', isMark: false },
              { l: 'GET /assets/recharts-b21c.js', start: 280, dur: 684, warn: true, c: 'var(--terracotta)', isMark: false },
              { l: 'GET /assets/index-c142.css', start: 320, dur: 188, warn: false, c: 'var(--c-sky)', isMark: false },
              { l: 'GET /api/keuangan/12months', start: 720, dur: 1842, warn: true, c: 'var(--terracotta-2)', isMark: false },
              { l: 'Parse + render Recharts', start: 2562, dur: 488, warn: true, c: 'var(--amber-2)', isMark: false },
              { l: 'FCP', start: 1240, dur: 0, warn: false, c: 'var(--c-sky)', isMark: true },
              { l: 'LCP', start: 3280, dur: 0, warn: false, c: 'var(--terracotta-2)', isMark: true },
            ].map((w, i) => (
              <div key={i} style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 180, fontSize: 10.5, fontFamily: 'var(--f-mono)', color: w.warn ? 'var(--terracotta-2)' : 'var(--ink-2)', fontWeight: w.warn ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.l}</div>
                <div style={{ flex: 1, position: 'relative', height: 14, background: 'var(--line-soft)', borderRadius: 3 }}>
                  {w.isMark ? (
                    <div style={{ position: 'absolute', left: `${(w.start / 3500) * 100}%`, top: -1, width: 2, height: 16, background: w.c, transform: 'translateX(-1px)' }}>
                      <div style={{ position: 'absolute', top: -12, left: 4, fontSize: 9, color: w.c, fontFamily: 'var(--f-mono)', fontWeight: 700, whiteSpace: 'nowrap' }}>{w.l}</div>
                    </div>
                  ) : (
                    <div style={{ position: 'absolute', left: `${(w.start / 3500) * 100}%`, width: `${(w.dur / 3500) * 100}%`, height: '100%', background: w.c, borderRadius: 3, opacity: 0.85 }} />
                  )}
                </div>
                <span className="sh-num" style={{ width: 56, fontSize: 10.5, color: 'var(--ink-3)', textAlign: 'right' }}>{w.isMark ? `${w.start}ms` : `${w.dur}ms`}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)', paddingLeft: 190 }}>
              <span>0ms</span><span>1.5s</span><span>3s</span><span>3.5s</span>
            </div>
          </div>

          {/* Affected segments */}
          <div style={{ padding: 24, borderRight: '1px solid var(--line-2)' }}>
            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 14 }}>Segmen terdampak</div>
            {[
              { l: 'Android (low-end · RAM ≤4GB)', v: 68, c: 'var(--terracotta-2)' },
              { l: 'Network 3G / slow-4G', v: 84, c: 'var(--terracotta-2)' },
              { l: 'Pengguna baru (≤ 7d)', v: 42, c: 'var(--amber-2)' },
              { l: 'Cold load (no SW cache)', v: 96, c: 'var(--terracotta-2)' },
              { l: 'Repeat visit (warm)', v: 24, c: 'var(--amber-2)' },
              { l: 'Desktop / WiFi', v: 8, c: 'var(--forest)' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '8px 0', borderTop: i > 0 ? '1px solid var(--line-2)' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11.5 }}>{s.l}</span>
                  <span className="sh-num" style={{ fontSize: 12, fontWeight: 600, color: s.c }}>{s.v}% poor</span>
                </div>
                <div style={{ height: 5, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.v}%`, background: s.c }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: 12, background: 'var(--amber-tint)', borderRadius: 8, fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--ink)' }}>Insight:</strong> 96% sesi cold-load gagal LCP. Service worker tidak precache /keuangan karena data per-bulan unik.
            </div>
          </div>

          {/* Action plan */}
          <div style={{ padding: 24, background: 'var(--paper-2)' }}>
            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 14 }}>Rencana perbaikan · 4 step</div>
            {[
              { n: '01', l: 'Pisah Recharts ke dynamic import', impact: '−420ms LCP', effort: 'S', status: 'ready', c: 'var(--forest)' },
              { n: '02', l: 'Cache /api/keuangan dengan SWR di SW', impact: '−1.2s pada warm', effort: 'M', status: 'ready', c: 'var(--forest)' },
              { n: '03', l: 'Server-side aggregate 12m, kirim payload kecil', impact: '−800ms TTFB', effort: 'L', status: 'scoping', c: 'var(--amber-2)' },
              { n: '04', l: 'Skeleton loader saat fetch', impact: 'perceived −600ms', effort: 'S', status: 'ready', c: 'var(--c-sky)' },
            ].map((a, i) => (
              <div key={i} style={{ padding: 12, background: 'var(--paper)', borderRadius: 8, marginBottom: 8, border: '1px solid var(--line-2)' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 14, fontWeight: 500, color: a.c, marginTop: 1 }}>{a.n}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>{a.l}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Chip tone="forest" style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5 }}>{a.impact}</Chip>
                      <Chip style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, background: 'var(--cream)', borderColor: 'transparent', color: 'var(--ink-3)' }}>effort {a.effort}</Chip>
                      <Chip style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, background: a.status === 'ready' ? 'var(--forest-soft)' : 'var(--amber-tint)', color: a.status === 'ready' ? 'var(--forest)' : 'var(--amber-2)', borderColor: 'transparent' }}>{a.status}</Chip>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 4, padding: 10, background: 'var(--forest-tint)', borderRadius: 8, fontSize: 11.5, color: 'var(--forest)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>Total target LCP:</span>
              <span className="sh-num">3,28s → 1,40s</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Trend + Device type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— LCP trend per route · 14 hari</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Pergerakan top 5 route</h3>
          <LcpTrendChart />
        </Card>
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Performa per tipe device</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>LCP 75p Mei</h3>
          {[
            { l: 'Desktop · Chrome', v: '0,84s', pct: 17, c: 'var(--forest)' },
            { l: 'Tablet · Chrome', v: '1,42s', pct: 28, c: 'var(--forest)' },
            { l: 'Mobile · Chrome (premium)', v: '1,68s', pct: 33, c: 'var(--forest-3)' },
            { l: 'Mobile · Chrome (mid)', v: '2,12s', pct: 42, c: 'var(--c-bark)' },
            { l: 'Mobile · Chrome (low-end)', v: '2,84s', pct: 56, c: 'var(--amber-2)' },
            { l: 'Samsung Internet (low-end)', v: '3,14s', pct: 62, c: 'var(--terracotta)' },
          ].map((d, i) => (
            <div key={i} style={{ padding: '8px 0', borderTop: i > 0 ? '1px solid var(--line-2)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12 }}>{d.l}</span>
                <span className="sh-num" style={{ fontSize: 12.5, fontWeight: 600, color: d.c }}>{d.v}</span>
              </div>
              <div style={{ height: 5, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.pct}%`, background: d.c }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AdminLayout>
  )
}
