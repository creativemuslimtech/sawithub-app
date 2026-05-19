// TODO[backend-pending]: GET /admin/AppService/android/versions — Version adoption, crash-free, ANR-free per version
// TODO[backend-pending]: GET /admin/AppService/android/devices — OS, device distribution
// TODO[backend-pending]: GET /admin/AppService/android/crashes — Top crash clusters
// TODO[backend-pending]: GET /admin/AppService/android/reviews — Play Store rating summary
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import Card from '../../components/ds/Card'
import Btn from '../../components/ds/Btn'
import Chip from '../../components/ds/Chip'
import { DownloadIcon } from '../../components/ds/icons'

function StarIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
    </svg>
  )
}

export default function AndroidDetail() {
  return (
    <AdminLayout
      topbarRight={
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm">Play Console →</Btn>
          <Btn variant="primary" size="sm" leading={<DownloadIcon size={14} />}>Unduh AAB v2.4.2</Btn>
        </div>
      }
    >
      {import.meta.env.DEV && <div style={{ background: 'var(--amber-tint)', border: '1px solid rgba(212,168,39,0.35)', borderRadius: 8, padding: '8px 14px', fontSize: 11.5, fontFamily: 'var(--f-mono)', color: 'var(--amber-2)', marginBottom: 16 }}>⚠ Data dummy · API belum tersedia · Lihat IMPLEMENTATION_REPORT.md</div>}

      {/* Breadcrumb */}
      <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--ink-4)', display: 'flex', gap: 6, alignItems: 'center', fontFamily: 'var(--f-mono)' }}>
        <Link to="/admin/apps" style={{ color: 'inherit', textDecoration: 'none' }}>Apps</Link>
        <span style={{ color: 'var(--ink-5)' }}>/</span>
        <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>Android</span>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Android · com.sawithub.app</div>
          <h1 className="sh-h-2">
            <em className="sh-italic" style={{ color: 'var(--amber-2)' }}>4.218</em> install aktif · <em className="sh-italic" style={{ color: 'var(--forest)' }}>78%</em> sudah di versi terbaru.
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 8, fontFamily: 'var(--f-mono)' }}>
            Play rating 4,6 ★ · Crash-free 99,82% · ANR-free 99,94% · 12 hari sejak rilis v2.4.1
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Chip tone="forest" style={{ fontFamily: 'var(--f-mono)' }}>● Play Console healthy</Chip>
          <Chip style={{ fontFamily: 'var(--f-mono)' }}>Signed by Play</Chip>
        </div>
      </div>

      {/* Top KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { l: 'Install aktif', v: '4.218', sub: '+248 minggu ini', c: 'var(--amber)' },
          { l: 'Total install', v: '12.842', sub: 'lifetime', c: 'var(--forest)' },
          { l: 'Crash-free', v: '99,82%', sub: '↑ 0,12 pt', c: 'var(--forest)' },
          { l: 'ANR-free', v: '99,94%', sub: 'stabil', c: 'var(--forest-3)' },
          { l: 'Play rating', v: '4,6 ★', sub: '1.842 ulasan', c: 'var(--amber-2)' },
          { l: 'Uninstall 28d', v: '2,4%', sub: '↓ 0,3 pt', c: 'var(--c-bark)' },
        ].map((m, i) => (
          <div key={i} style={{ padding: 16, background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: m.c }} />
            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{m.l}</div>
            <div className="sh-num" style={{ fontSize: 22, fontWeight: 500 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Version adoption table */}
      <Card padded={false} style={{ padding: 0, marginBottom: 22, overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Adopsi versi · 4.218 install aktif</div>
            <h3 className="sh-h-4">Distribusi semua versi yang masih terinstall</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm">Force update v2.2.x</Btn>
            <Btn variant="ghost" size="sm" leading={<DownloadIcon size={14} />}>Ekspor</Btn>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--paper-2)' }}>
              {[
                { l: 'Versi' }, { l: 'Build #' }, { l: 'Rilis' }, { l: 'Status' },
                { l: 'Install', a: 'right' as const }, { l: 'Adopsi', a: 'right' as const },
                { l: 'Crash-free', a: 'right' as const }, { l: 'ANR-free', a: 'right' as const }, { l: '' },
              ].map(h => (
                <th key={h.l} style={{ padding: '12px 18px', textAlign: h.a || 'left', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>{h.l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { v: 'v2.4.1', code: 2410, date: '12 Mei 2026', status: 'latest', count: 3290, pct: 78, cf: 99.82, anr: 99.94, color: 'var(--forest)' },
              { v: 'v2.4.0', code: 2400, date: '2 Mei 2026', status: 'supported', count: 590, pct: 14, cf: 99.78, anr: 99.92, color: 'var(--forest-3)' },
              { v: 'v2.3.2', code: 2320, date: '18 Apr 2026', status: 'supported', count: 211, pct: 5, cf: 99.6, anr: 99.88, color: 'var(--c-bark)' },
              { v: 'v2.3.1', code: 2310, date: '14 Apr 2026', status: 'supported', count: 84, pct: 2, cf: 99.4, anr: 99.82, color: 'var(--c-bark)' },
              { v: 'v2.3.0', code: 2300, date: '8 Apr 2026', status: 'deprecated', count: 43, pct: 1, cf: 98.42, anr: 99.6, color: 'var(--amber-2)', flag: 'OOM bug' },
              { v: 'v2.2.4', code: 2240, date: '22 Mar 2026', status: 'force-update', count: 0, pct: 0, cf: 97.8, anr: 99.4, color: 'var(--terracotta-2)' },
              { v: 'v2.4.2', code: 2420, date: 'Pending · 18 Mei', status: 'release-candidate', count: 0, pct: 0, cf: null, anr: null, color: 'var(--c-sky)', isPending: true },
            ].map((r, i) => (
              <tr key={i} style={{
                borderTop: '1px solid var(--line-2)',
                background: r.isPending ? 'var(--amber-tint)' : r.status === 'force-update' ? 'var(--terra-soft)' : 'transparent',
                opacity: r.status === 'force-update' ? 0.7 : 1,
              }}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: r.color, flexShrink: 0 }} />
                    <span className="sh-num" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{r.v}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>#{r.code}</td>
                <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>{r.date}</td>
                <td style={{ padding: '14px 18px' }}>
                  {r.status === 'latest' && <Chip tone="forest" style={{ fontFamily: 'var(--f-mono)' }}>LATEST</Chip>}
                  {r.status === 'supported' && <Chip style={{ fontFamily: 'var(--f-mono)', background: 'var(--paper)', borderColor: 'var(--line-2)', color: 'var(--ink-3)' }}>supported</Chip>}
                  {r.status === 'deprecated' && <Chip tone="amber" style={{ fontFamily: 'var(--f-mono)' }}>deprecated{r.flag ? ` · ${r.flag}` : ''}</Chip>}
                  {r.status === 'force-update' && <Chip tone="terra" style={{ fontFamily: 'var(--f-mono)' }}>force-update</Chip>}
                  {r.status === 'release-candidate' && <Chip tone="amber" style={{ fontFamily: 'var(--f-mono)' }}>RC · internal track</Chip>}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <span className="sh-num" style={{ fontSize: 13, fontWeight: 500 }}>{r.count.toLocaleString('id-ID')}</span>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                    <div style={{ width: 80, height: 6, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${r.pct}%`, height: '100%', background: r.color }} />
                    </div>
                    <span className="sh-num" style={{ fontSize: 12, fontWeight: 600, color: r.color, width: 32, textAlign: 'right' }}>{r.pct}%</span>
                  </div>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <span className="sh-num" style={{ fontSize: 12.5, fontWeight: 500, color: r.cf !== null && r.cf < 99 ? 'var(--terracotta-2)' : 'var(--ink-2)' }}>
                    {r.cf !== null ? `${r.cf.toFixed(2)}%` : '—'}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <span className="sh-num" style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-2)' }}>
                    {r.anr !== null ? `${r.anr.toFixed(2)}%` : '—'}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <button style={{ width: 28, height: 28, borderRadius: 7, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-4)' }}>
                    <MoreIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* OS + Device + APK */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 22 }}>
        {/* Android OS */}
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Android OS version</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Distribusi sistem operasi</h3>
          {[
            { v: 'Android 14', api: 'API 34', pct: 32, count: 1350, c: 'var(--forest)', code: 'U' },
            { v: 'Android 13', api: 'API 33', pct: 28, count: 1181, c: 'var(--forest-3)', code: 'T' },
            { v: 'Android 12', api: 'API 31', pct: 18, count: 759, c: 'var(--c-bark)', code: 'S' },
            { v: 'Android 11', api: 'API 30', pct: 12, count: 506, c: 'var(--amber-2)', code: 'R' },
            { v: 'Android 10', api: 'API 29', pct: 6, count: 253, c: 'var(--c-terra)', code: 'Q' },
            { v: 'Android 9', api: 'API 28', pct: 3, count: 127, c: 'var(--c-sky)', code: 'P' },
            { v: 'Android 7–8', api: 'API 24-27', pct: 1, count: 42, c: 'var(--ink-4)', code: 'N/O' },
          ].map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i > 0 ? '1px solid var(--line-2)' : undefined }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${o.c}14`, color: o.c, border: `1px solid ${o.c}28`,
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--f-display)', fontSize: 14, fontWeight: 500, fontStyle: 'italic',
              }}>{o.code}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{o.v}</div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>{o.api}</div>
              </div>
              <span className="sh-num" style={{ fontSize: 11, color: 'var(--ink-4)', width: 50, textAlign: 'right' }}>{o.count.toLocaleString('id-ID')}</span>
              <span className="sh-num" style={{ fontSize: 13, fontWeight: 600, color: o.c, width: 40, textAlign: 'right' }}>{o.pct}%</span>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: 12, background: 'var(--amber-tint)', borderRadius: 8, fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--ink)' }}>Catatan:</strong> 1% pengguna masih di Android 7-8. Pertimbangkan raise ke API 26 di Q3 2026.
          </div>
        </Card>

        {/* Top devices */}
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Top devices</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>20 model dominan · 84%</h3>
          {[
            { d: 'Xiaomi Redmi Note 12', make: 'Xiaomi', ram: '4 GB', pct: 14, count: 590, crash: 99.84 },
            { d: 'Samsung Galaxy A14', make: 'Samsung', ram: '4 GB', pct: 11, count: 464, crash: 99.78 },
            { d: 'OPPO A78', make: 'OPPO', ram: '8 GB', pct: 9, count: 380, crash: 99.92 },
            { d: 'Vivo Y36', make: 'Vivo', ram: '6 GB', pct: 7, count: 295, crash: 99.86 },
            { d: 'Realme C55', make: 'Realme', ram: '4 GB', pct: 6, count: 253, crash: 99.74 },
            { d: 'Samsung Galaxy A04', make: 'Samsung', ram: '3 GB', pct: 5, count: 211, crash: 98.84 },
            { d: 'Infinix Smart 7', make: 'Infinix', ram: '3 GB', pct: 4, count: 169, crash: 99.42 },
            { d: 'Lainnya (208 model)', make: 'Various', ram: '—', pct: 44, count: 1856, crash: 99.6 },
          ].map((d, i) => (
            <div key={i} style={{ padding: '9px 0', borderTop: i > 0 ? '1px solid var(--line-2)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{d.d}</div>
                <span className="sh-num" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--forest)' }}>{d.pct}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>
                <span>{d.make} · RAM {d.ram} · {d.count}</span>
                <span style={{ color: d.crash < 99 ? 'var(--terracotta-2)' : 'var(--forest)' }}>● {d.crash}% crash-free</span>
              </div>
            </div>
          ))}
        </Card>

        {/* APK bundle */}
        <Card padded={false} style={{ padding: 24, background: 'var(--paper-2)' }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— App Bundle · v2.4.1</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Berkas rilis & signing</h3>
          <div style={{ padding: 16, background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 10, marginBottom: 14, fontFamily: 'var(--f-mono)' }}>
            {([
              ['versionName', '2.4.1'],
              ['versionCode', '2410'],
              ['minSdkVersion', '24 · Android 7'],
              ['targetSdkVersion', '34 · Android 14'],
              ['compileSdkVersion', '34'],
              ['package', 'com.sawithub.app'],
              ['signing', 'Play App Signing ✓'],
              ['bundle (AAB)', '82,4 MB'],
              ['base APK download', '18,4 MB'],
              ['installed (avg)', '42,1 MB'],
            ] as [string, string][]).map(([k, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: i > 0 ? '1px solid var(--line-2)' : undefined }}>
                <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{k}</span>
                <span style={{ fontSize: 11.5, color: 'var(--ink)', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>Size breakdown · base APK</div>
          {[
            { l: 'Native libs (arm64-v8a)', v: 7.8, pct: 42 },
            { l: 'DEX (Kotlin code)', v: 4.2, pct: 23 },
            { l: 'Resources (drawables, fonts)', v: 3.4, pct: 18 },
            { l: 'Assets (botanical SVGs)', v: 1.8, pct: 10 },
            { l: 'Lainnya', v: 1.2, pct: 7 },
          ].map((s, i) => (
            <div key={i} style={{ padding: '5px 0', fontSize: 11.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span>{s.l}</span>
                <span className="sh-num" style={{ color: 'var(--ink-3)' }}>{s.v} MB</span>
              </div>
              <div style={{ height: 4, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.pct}%`, background: 'var(--c-bark)' }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Crashes + Play ratings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 22 }}>
        {/* Top crashes */}
        <Card padded={false} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Top crash clusters · 28 hari</div>
              <h3 className="sh-h-4">8 cluster · 42 crash · 0,18% sesi terdampak</h3>
            </div>
            <Btn variant="ghost" size="sm">Buka di Firebase Crashlytics →</Btn>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--f-mono)' }}>
            <thead>
              <tr style={{ background: 'var(--paper-2)' }}>
                {['Cluster', 'Versi', 'OS', 'Device', 'Sesi', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--ink-4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ fontSize: 11.5 }}>
              {[
                { c: 'OutOfMemoryError · BitmapFactory.decodeStream:482', v: 'v2.3.0+', os: 'Android 10-11', dev: 'RAM ≤4GB', n: 18, st: 'open', sev: 'var(--terracotta-2)' },
                { c: 'NullPointerException · DashboardActivity.onResume:124', v: 'v2.4.0', os: 'Android 13+', dev: 'Samsung A04', n: 8, st: 'open', sev: 'var(--amber-2)' },
                { c: 'TimeoutException · ApiClient.post:218', v: 'v2.4.0-2.4.1', os: 'All', dev: 'All', n: 6, st: 'investigating', sev: 'var(--amber-2)' },
                { c: 'SecurityException · LocationManager.request:88', v: 'v2.4.1', os: 'Android 14', dev: 'Xiaomi (MIUI 14)', n: 4, st: 'fix-pending', sev: 'var(--c-sky)' },
                { c: 'IllegalStateException · Fragment not attached:1402', v: 'v2.4.0+', os: 'All', dev: 'All', n: 3, st: 'fixed (v2.4.2)', sev: 'var(--forest)' },
                { c: 'IOException · OkHttpClient.execute:120', v: 'v2.3.x', os: 'Android 9', dev: 'All', n: 2, st: 'wontfix', sev: 'var(--ink-4)' },
                { c: 'ANR · main thread blocked > 5s on init', v: 'v2.4.0', os: 'Android 12', dev: 'Vivo Y36', n: 1, st: 'fixed (v2.4.1)', sev: 'var(--forest)' },
              ].map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--line-2)' }}>
                  <td style={{ padding: '11px 18px', color: 'var(--ink-2)', fontWeight: 500 }}>{r.c}</td>
                  <td style={{ padding: '11px 18px', color: 'var(--ink-3)' }}>{r.v}</td>
                  <td style={{ padding: '11px 18px', color: 'var(--ink-3)' }}>{r.os}</td>
                  <td style={{ padding: '11px 18px', color: 'var(--ink-3)' }}>{r.dev}</td>
                  <td style={{ padding: '11px 18px', color: 'var(--ink-2)', fontWeight: 600 }}>{r.n}</td>
                  <td style={{ padding: '11px 18px', color: r.sev, fontWeight: 600 }}>● {r.st}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Play Store ratings */}
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Play Store ratings</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>1.842 ulasan · 4,6 ★ avg</h3>
          <div style={{ display: 'flex', gap: 16, marginBottom: 22, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="sh-num" style={{ fontSize: 48, fontWeight: 400, color: 'var(--amber-2)', letterSpacing: '-0.025em', lineHeight: 1 }}>4,6</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 6, color: 'var(--amber)' }}>
                {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} size={12} />)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6 }}>1.842 ulasan</div>
            </div>
            <div style={{ flex: 1 }}>
              {[
                { s: 5, n: 1284, pct: 70 },
                { s: 4, n: 312, pct: 17 },
                { s: 3, n: 142, pct: 8 },
                { s: 2, n: 62, pct: 3 },
                { s: 1, n: 42, pct: 2 },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 11 }}>
                  <span style={{ width: 24, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>{r.s} ★</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--line-soft)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${r.pct}%`, background: r.s >= 4 ? 'var(--forest)' : r.s === 3 ? 'var(--amber-2)' : 'var(--terracotta)' }} />
                  </div>
                  <span className="sh-num" style={{ width: 44, textAlign: 'right', color: 'var(--ink-4)' }}>{r.n}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ paddingTop: 14, borderTop: '1px solid var(--line-2)' }}>
            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>Ulasan terbaru</div>
            {[
              { n: 'Pak Hadi', stars: 5, text: 'Aplikasinya enteng dan offline juga bisa. Cocok untuk di kebun.', date: '2 hari', reply: false },
              { n: 'Ibu Lina', stars: 3, text: 'Sering loading lama waktu buka laporan. Tolong diperbaiki.', date: '5 hari', reply: true },
              { n: 'Pak Wisnu', stars: 5, text: 'Kalkulator pupuknya akurat sekali. Terima kasih.', date: '1 minggu', reply: false },
            ].map((r, i) => (
              <div key={i} style={{ padding: '10px 0', borderTop: i > 0 ? '1px solid var(--line-2)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{r.n}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ color: 'var(--amber)', display: 'flex', gap: 1 }}>
                      {Array.from({ length: r.stars }).map((_, j) => <StarIcon key={j} size={11} />)}
                    </div>
                    <span style={{ fontSize: 10.5, color: 'var(--ink-4)', fontFamily: 'var(--f-mono)' }}>{r.date}</span>
                  </div>
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>"{r.text}"</p>
                {r.reply && <Chip tone="forest" style={{ marginTop: 4, fontSize: 9.5 }}>✓ Dijawab tim</Chip>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Permissions + Pre-launch */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Permissions diminta · v2.4.1</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Manifest declarations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { p: 'INTERNET', reason: 'API calls', level: 'normal', granted: 100 },
              { p: 'ACCESS_NETWORK_STATE', reason: 'Cek koneksi', level: 'normal', granted: 100 },
              { p: 'POST_NOTIFICATIONS', reason: 'Pengingat panen', level: 'runtime', granted: 78 },
              { p: 'ACCESS_FINE_LOCATION', reason: 'Tag lokasi kebun (opsional)', level: 'runtime', granted: 42 },
              { p: 'CAMERA', reason: 'Foto setruk timbangan', level: 'runtime', granted: 64 },
              { p: 'READ_MEDIA_IMAGES', reason: 'Pilih foto dari galeri', level: 'runtime', granted: 58 },
            ].map((p, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'var(--cream)', borderRadius: 8, border: '1px solid var(--line-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11.5, fontWeight: 600, color: 'var(--ink)' }}>{p.p}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Chip style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, background: p.level === 'runtime' ? 'var(--amber-tint)' : 'var(--paper)', color: p.level === 'runtime' ? 'var(--amber-2)' : 'var(--ink-3)', borderColor: 'transparent' }}>{p.level}</Chip>
                    <span className="sh-num" style={{ fontSize: 12, fontWeight: 600, color: p.granted >= 75 ? 'var(--forest)' : p.granted >= 50 ? 'var(--amber-2)' : 'var(--terracotta-2)' }}>{p.granted}%</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{p.reason}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Pre-launch report · v2.4.2 RC</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Google Play robot test · 14 device</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
            {[
              { l: 'Stability', v: '✓', n: '0 crash', c: 'var(--forest)' },
              { l: 'Performance', v: '✓', n: 'Startup 1,2s', c: 'var(--forest)' },
              { l: 'Accessibility', v: '2 saran', n: 'Contrast labels', c: 'var(--amber-2)' },
              { l: 'Security', v: '✓', n: 'No issues', c: 'var(--forest)' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 12, background: 'var(--cream)', borderRadius: 10, border: '1px solid var(--line-2)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: s.c, fontFamily: 'var(--f-display)' }}>{s.v}</div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 6 }}>{s.l}</div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 4 }}>{s.n}</div>
              </div>
            ))}
          </div>
          <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>Aksesibilitas — 2 saran</div>
          {[
            { l: "Tombol 'Catat panen' di FAB tidak punya contentDescription", sev: 'med' },
            { l: "Rasio kontras 'eyebrow' text 3,8:1 (target 4,5)", sev: 'low' },
          ].map((a, i) => (
            <div key={i} style={{ padding: '10px 12px', background: 'var(--amber-tint)', borderRadius: 8, marginBottom: 6, display: 'flex', gap: 10, alignItems: 'start' }}>
              <span style={{ color: a.sev === 'med' ? 'var(--amber-2)' : 'var(--c-sky)', marginTop: 2 }}>●</span>
              <span style={{ fontSize: 12, color: 'var(--ink-2)', flex: 1 }}>{a.l}</span>
              <Chip style={{ fontFamily: 'var(--f-mono)', fontSize: 9.5, background: 'var(--paper)', color: 'var(--ink-3)', borderColor: 'var(--line)' }}>{a.sev}</Chip>
            </div>
          ))}
        </Card>
      </div>

      {/* Nav to ANR */}
      <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
        <Link to="/admin/apps/android/anr">
          <Btn variant="ghost" size="sm">ANR per device →</Btn>
        </Link>
      </div>
    </AdminLayout>
  )
}
