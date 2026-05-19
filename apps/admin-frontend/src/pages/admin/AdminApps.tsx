// TODO[backend-pending]: GET /admin/AppService/installs — PWA/Android/iOS install counts
// TODO[backend-pending]: GET /admin/AppService/versions — Per-platform version adoption
// TODO[backend-pending]: GET /admin/AppService/vitals — Crash-free rate, ANR, startup time
// TODO[backend-pending]: GET /admin/AppService/releases — Release history
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { DownloadIcon } from '../../components/ds/icons'

const DUMMY_PLATFORMS = [
  {
    key: 'pwa', label: 'Progressive Web App', url: 'web · sawithub.com',
    installs: 3842, pct: 44, color: 'var(--forest)',
    version: 'v2.4.1', adoption: '94%', session: '8m 42s', score: '94/100',
    scoreLabel: 'Lighthouse',
  },
  {
    key: 'android', label: 'Android', url: 'Google Play · com.sawithub.app',
    installs: 4218, pct: 49, color: 'var(--c-sky)',
    version: '2.4.1 (142)', adoption: '72%', session: '11m 18s', score: '99.82%',
    scoreLabel: 'Crash-free',
  },
  {
    key: 'ios', label: 'iOS Beta', url: 'TestFlight · closed beta',
    installs: 582, pct: 7, color: 'var(--amber-2)',
    version: '2.4.0 (38)', adoption: '91%', session: '9m 55s', score: '99.94%',
    scoreLabel: 'Crash-free',
  },
]

const DUMMY_RELEASES = [
  { version: 'v2.4.1', date: '12 Mei 2026', platforms: ['PWA', 'Android'], type: 'patch', notes: 'Fix kalkulasi berat panen pada lahan baru, perbaikan sinkronisasi jadwal.' },
  { version: 'v2.4.0', date: '1 Mei 2026', platforms: ['PWA', 'Android', 'iOS'], type: 'minor', notes: 'Halaman Laporan Keuangan baru, ekspor PDF batch, push notifikasi jadwal.' },
  { version: 'v2.3.2', date: '18 Apr 2026', platforms: ['PWA'], type: 'patch', notes: 'Hotfix autentikasi WA saat session expired.' },
]

const TYPE_STYLE: Record<string, React.CSSProperties> = {
  patch: { background: 'var(--paper)', color: 'var(--ink-3)', border: '1px solid var(--line-2)' },
  minor: { background: 'var(--forest-soft)', color: 'var(--forest)', border: '1px solid var(--forest-soft)' },
  major: { background: 'var(--amber-tint)', color: 'var(--amber-2)', border: '1px solid var(--amber-tint)' },
}

export default function AdminApps() {
  return (
    <AdminLayout
      topbarRight={
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 36, borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--paper)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer' }}>
            <DownloadIcon size={14} /> Rilis catatan
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 36, borderRadius: 8, border: 'none', background: 'var(--forest)', fontSize: 12.5, fontWeight: 600, color: 'var(--paper)', cursor: 'pointer' }}>
            Trigger update push
          </button>
        </div>
      }
    >
      {import.meta.env.DEV && <div style={{ background: 'var(--amber-tint)', border: '1px solid rgba(212,168,39,0.35)', borderRadius: 8, padding: '8px 14px', fontSize: 11.5, fontFamily: 'var(--f-mono)', color: 'var(--amber-2)', marginBottom: 16 }}>⚠ Data dummy · API belum tersedia · Lihat IMPLEMENTATION_REPORT.md</div>}

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <p className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Aplikasi & Rilis · Mei 2026</p>
        <h1 className="sh-h-2">
          <em className="sh-italic" style={{ color: 'var(--forest)' }}>8.642</em> instalasi aktif —{' '}
          <em className="sh-italic" style={{ color: 'var(--amber-2)' }}>78%</em> sudah di versi terbaru.
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 8, fontFamily: 'var(--f-mono)' }}>
          PWA web 3.842 · Android 4.218 · iOS 582 (beta) · Crash-free 99,82%
        </p>
      </div>

      {/* Platform overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        {DUMMY_PLATFORMS.map((p) => (
          <Link key={p.key} to={p.key === 'pwa' ? '/admin/apps/pwa' : p.key === 'android' ? '/admin/apps/android' : '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="sh-card" style={{ padding: 24, borderTop: `3px solid ${p.color}` }}>
            <div style={{ marginBottom: 16 }}>
              <p className="sh-eyebrow" style={{ color: p.color, marginBottom: 4 }}>—— {p.label}</p>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{p.url}</div>
            </div>
            <div className="sh-num" style={{ fontSize: 36, fontWeight: 500, color: p.color, letterSpacing: '-0.02em' }}>
              {p.installs.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>instalasi aktif · {p.pct}% pengguna</div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { l: 'Versi terbaru', v: p.version, sub: `${p.adoption} adopsi` },
                { l: 'Avg session', v: p.session, sub: '↑ 12%' },
                { l: p.scoreLabel, v: p.score, sub: 'rating' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 9.5, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--f-mono)' }}>{s.l}</div>
                  <div className="sh-num" style={{ fontSize: 13, fontWeight: 500, marginTop: 3, color: 'var(--ink)' }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 1 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
          </Link>
        ))}
      </div>

      {/* Version adoption bars */}
      <div className="sh-card" style={{ padding: 24, marginBottom: 22 }}>
        <p className="sh-eyebrow" style={{ marginBottom: 8 }}>Adopsi versi</p>
        <h3 className="sh-h-4" style={{ marginBottom: 20 }}>Version Adoption · Semua Platform</h3>
        {[
          { v: 'v2.4.1', pct: 78, users: '6.741', color: 'var(--forest)' },
          { v: 'v2.4.0', pct: 15, users: '1.296', color: 'var(--forest-3)' },
          { v: 'v2.3.x', pct: 5, users: '432', color: 'var(--amber-2)' },
          { v: '< v2.3', pct: 2, users: '173', color: 'var(--terracotta-2)' },
        ].map((row) => (
          <div key={row.v} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600, color: 'var(--ink)' }}>{row.v}</span>
              <span style={{ color: 'var(--ink-3)' }}>{row.users} pengguna · <strong style={{ color: row.color }}>{row.pct}%</strong></span>
            </div>
            <div style={{ height: 8, background: 'var(--paper-2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Release history */}
      <div className="sh-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line-2)' }}>
          <p className="sh-eyebrow" style={{ marginBottom: 4 }}>Rilis</p>
          <h3 className="sh-h-4">Riwayat Rilis</h3>
        </div>
        <div>
          {DUMMY_RELEASES.map((rel, i) => (
            <div key={rel.version} style={{ padding: '16px 24px', borderTop: i > 0 ? '1px solid var(--line-2)' : 'none', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 80 }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{rel.version}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{rel.date}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minWidth: 140 }}>
                {rel.platforms.map(p => (
                  <span key={p} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'var(--paper)', border: '1px solid var(--line-2)', color: 'var(--ink-3)' }}>{p}</span>
                ))}
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 99, ...TYPE_STYLE[rel.type] }}>{rel.type}</span>
              <p style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{rel.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
