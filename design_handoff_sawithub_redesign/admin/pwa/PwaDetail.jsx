/* global React, SH, AdminShell */
const { Card, Btn, Chip, Sparkline, Ring, I, PalmLeaf } = window.SH;

function PwaDetailPage() {
  return (
    <AdminShell active="apps"
      headerActions={
        <>
          <Btn variant="ghost" size="sm" leading={<I.download size={14} />}>Unduh manifest</Btn>
          <Btn variant="primary" size="sm">Force update push</Btn>
        </>
      }
    >
      {/* Header */}
      <div style={{ marginBottom: 12, fontSize: 12, color: "var(--ink-4)", display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--f-mono)" }}>
        <span>Apps</span><span style={{ color: "var(--ink-5)" }}>/</span><span style={{ color: "var(--ink-2)", fontWeight: 600 }}>PWA</span>
      </div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "end", justifyContent: "space-between" }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Progressive Web App · sawithub.com</div>
          <h1 className="sh-h-2">
            <em className="sh-italic" style={{ color: "var(--forest)" }}>3.842</em> installasi PWA aktif — service worker <em className="sh-italic" style={{ color: "var(--amber-2)" }}>v2.4.1</em> stabil.
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 8, fontFamily: "var(--f-mono)" }}>
            Lighthouse 94 · Crash-free 99,82% · Cache hit 92,4% · Push opted 64%
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>● HTTPS ✓</Chip>
          <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>● Manifest valid</Chip>
          <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>● SW healthy</Chip>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { l: "Install aktif", v: "3.842", sub: "+184 minggu ini", c: "var(--forest)" },
          { l: "Buka 7 hari", v: "2.984", sub: "77,7% retained", c: "var(--forest-3)" },
          { l: "Standalone mode", v: "84,2%", sub: "vs browser tab", c: "var(--c-bark)" },
          { l: "Push subscribed", v: "2.467", sub: "64,2% opt-in", c: "var(--amber)" },
          { l: "Avg session", v: "8m 42s", sub: "↑ 12% vs Apr", c: "var(--amber-2)" },
          { l: "Lighthouse", v: "94/100", sub: "Performance", c: "var(--c-sky)" },
        ].map((m, i) => (
          <div key={i} style={{ padding: 16, background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 12, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: m.c }} />
            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{m.l}</div>
            <div className="sh-num" style={{ fontSize: 22, fontWeight: 500 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Web Vitals */}
      <Card padded={false} style={{ padding: 24, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Core Web Vitals · 75th percentile</div>
            <h3 className="sh-h-4">Pengalaman real pengguna · 28 hari</h3>
          </div>
          <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>✓ All thresholds pass</Chip>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {[
            { l: "LCP", n: "Largest Contentful Paint", v: "1,84", unit: "s", good: 2.5, poor: 4.0, value: 1.84, c: "var(--forest)", trend: [2.4, 2.2, 2.1, 2.0, 1.9, 1.85, 1.84] },
            { l: "INP", n: "Interaction to Next Paint", v: "148", unit: "ms", good: 200, poor: 500, value: 148, c: "var(--forest)", trend: [220, 200, 180, 165, 158, 150, 148] },
            { l: "CLS", n: "Cumulative Layout Shift", v: "0,04", unit: "", good: 0.1, poor: 0.25, value: 0.04, c: "var(--forest)", trend: [0.12, 0.1, 0.08, 0.06, 0.05, 0.04, 0.04] },
          ].map((m, i) => (
            <div key={i} style={{ padding: 18, background: "var(--cream)", borderRadius: 12, border: "1px solid var(--line-2)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 14, fontWeight: 700, color: m.c }}>{m.l}</span>
                <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>Good</Chip>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-4)" }}>{m.n}</div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="sh-num" style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.025em", color: "var(--ink)" }}>{m.v}</span>
                <span style={{ fontSize: 14, color: "var(--ink-4)" }}>{m.unit}</span>
              </div>
              {/* Threshold bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ position: "relative", height: 6, background: "linear-gradient(90deg, #7BC97B 0%, #7BC97B 50%, var(--amber) 50%, var(--amber) 80%, var(--terracotta) 80%, var(--terracotta) 100%)", borderRadius: 99 }}>
                  <div style={{ position: "absolute", left: `${Math.min((m.value / m.poor) * 100, 100)}%`, top: -3, width: 2, height: 12, background: "var(--ink)", transform: "translateX(-1px)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>
                  <span>0</span><span>good &lt; {m.good}{m.unit}</span><span>poor &gt; {m.poor}{m.unit}</span>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <Sparkline data={m.trend} width={200} height={36} color={m.c} fill={false} />
                <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4, fontFamily: "var(--f-mono)" }}>Tren 7 hari: membaik</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Install funnel + Manifest + Browser */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 22 }}>
        {/* Install funnel */}
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Install funnel · 30 hari</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Beforeinstallprompt event</h3>
          {[
            { l: "Visit sawithub.com", v: "184.200", pct: 100, c: "var(--forest)" },
            { l: "Memenuhi kriteria PWA", v: "168.450", pct: 91, c: "var(--forest-3)", drop: "-9%" },
            { l: "Lihat install banner", v: "62.840", pct: 34, c: "var(--c-bark)", drop: "-63%" },
            { l: "Klik 'Pasang aplikasi'", v: "12.420", pct: 6.7, c: "var(--amber-2)", drop: "-80%" },
            { l: "User pilih 'Pasang'", v: "9.184", pct: 5.0, c: "var(--amber)", drop: "-26%" },
            { l: "Install selesai", v: "8.842", pct: 4.8, c: "var(--forest)" },
            { l: "Buka setelah install", v: "8.421", pct: 4.6, c: "var(--forest-3)" },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{s.l}</span>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {s.drop && <Chip tone="terra" style={{ fontFamily: "var(--f-mono)", fontSize: 10 }}>{s.drop}</Chip>}
                  <span className="sh-num" style={{ fontSize: 12, fontWeight: 500 }}>{s.v}</span>
                </span>
              </div>
              <div style={{ height: 6, background: "var(--line-soft)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${s.pct}%`, background: s.c }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Manifest */}
        <Card padded={false} style={{ padding: 0, overflow: "hidden", background: "var(--ink)", color: "var(--paper)" }}>
          <div style={{ padding: "16px 20px", background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--f-mono)" }}>
            <span style={{ fontSize: 12, color: "rgba(251,248,241,0.6)" }}>manifest.json</span>
            <span style={{ fontSize: 10.5, color: "var(--forest-3)" }}>● valid</span>
          </div>
          <pre style={{ padding: 20, margin: 0, fontFamily: "var(--f-mono)", fontSize: 11.5, lineHeight: 1.6, color: "var(--paper)", overflow: "hidden" }}>
{`{
  "name": "SawitHub — Kebun Sawit",
  "short_name": "SawitHub",
  "id": "/?source=pwa",
  "start_url": "/dashboard?source=pwa",
  "display": "standalone",
  "theme_color": `}<span style={{ color: "#FFD66B" }}>{`"#1A3D2B"`}</span>{`,
  "background_color": `}<span style={{ color: "#FFD66B" }}>{`"#F5F0E8"`}</span>{`,
  "orientation": "portrait",
  "scope": "/",
  "lang": "id-ID",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192" },
    { "src": "/icon-512.png", "sizes": "512x512" },
    { "src": "/icon-mask.png", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "Catat panen", "url": "/panen/add" },
    { "name": "Harga TBS", "url": "/harga-tbs" }
  ],
  "categories": ["agriculture","productivity"]
}`}
          </pre>
        </Card>

        {/* Browser breakdown */}
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Browser pengguna</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Sesi 30 hari</h3>
          {[
            { l: "Chrome (Android)", v: 58, ua: "v124-126", c: "var(--forest)", pwa: 89 },
            { l: "Chrome (Desktop)", v: 18, ua: "v124+", c: "var(--forest-3)", pwa: 42 },
            { l: "Samsung Internet", v: 12, ua: "v25", c: "var(--amber)", pwa: 78 },
            { l: "Safari (Mobile)", v: 7, ua: "v17", c: "var(--c-sky)", pwa: 24 },
            { l: "Firefox", v: 3, ua: "v125", c: "var(--c-terra)", pwa: 12 },
            { l: "Lainnya", v: 2, ua: "—", c: "var(--ink-4)", pwa: 0 },
          ].map((b, i, arr) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--line-2)" : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{b.l}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-4)", marginLeft: 8, fontFamily: "var(--f-mono)" }}>{b.ua}</span>
                </div>
                <span className="sh-num" style={{ fontSize: 12, fontWeight: 600, color: b.c }}>{b.v}%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: "var(--line-soft)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${b.pwa}%`, background: b.c, opacity: 0.6 }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--f-mono)", width: 80, textAlign: "right" }}>{b.pwa}% install PWA</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Service Worker state */}
      <Card padded={false} style={{ padding: 24, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Service Worker · sw.js</div>
            <h3 className="sh-h-4">Cache, sync & push runtime</h3>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>activated</Chip>
            <Chip style={{ fontFamily: "var(--f-mono)" }}>scope: /</Chip>
            <Chip style={{ fontFamily: "var(--f-mono)" }}>updated 2h ago</Chip>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 18 }}>
          {/* Cache strategies */}
          <div>
            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 12 }}>Cache strategies aktif</div>
            {[
              { name: "static-precache", strategy: "Cache-first", hit: 99.2, size: "4,2 MB", count: 142, c: "var(--forest)" },
              { name: "api-cache", strategy: "Stale-while-revalidate", hit: 88.4, size: "62,4 MB", count: "12.4k", c: "var(--forest-3)" },
              { name: "image-cache", strategy: "Cache-first · 30d", hit: 94.2, size: "112,8 MB", count: 8420, c: "var(--c-bark)" },
              { name: "harga-tbs", strategy: "Network-first · 5m", hit: 24.0, size: "0,4 MB", count: 184, c: "var(--amber-2)" },
            ].map((c, i) => (
              <div key={i} style={{ padding: "10px 12px", background: "var(--cream)", borderRadius: 8, marginBottom: 6, border: "1px solid var(--line-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--f-mono)", color: "var(--ink)" }}>{c.name}</span>
                  <span className="sh-num" style={{ fontSize: 12, fontWeight: 600, color: c.c }}>{c.hit}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>
                  <span>{c.strategy}</span>
                  <span>{c.count} entries · {c.size}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Storage breakdown */}
          <div>
            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 12 }}>Storage usage</div>
            <div style={{ padding: 14, background: "var(--cream)", borderRadius: 10, border: "1px solid var(--line-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>Total used / quota</span>
                <span className="sh-num" style={{ fontSize: 12, fontWeight: 600 }}>184 MB / 200 MB</span>
              </div>
              <div style={{ height: 8, background: "var(--line-soft)", borderRadius: 99, overflow: "hidden", display: "flex" }}>
                <div style={{ width: "62%", background: "var(--c-bark)" }} />
                <div style={{ width: "31%", background: "var(--forest-3)" }} />
                <div style={{ width: "5%", background: "var(--forest)" }} />
                <div style={{ width: "1%", background: "var(--amber-2)" }} />
                <div style={{ width: "1%", background: "var(--line)" }} />
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { l: "Image cache", v: "112 MB", c: "var(--c-bark)" },
                  { l: "API cache", v: "62 MB", c: "var(--forest-3)" },
                  { l: "Precache", v: "4 MB", c: "var(--forest)" },
                  { l: "IndexedDB (offline draft)", v: "2 MB", c: "var(--amber-2)" },
                  { l: "Sisa quota", v: "16 MB", c: "var(--line)" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: s.c }} />
                      {s.l}
                    </span>
                    <span className="sh-num" style={{ color: "var(--ink-3)" }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Background sync + push */}
          <div>
            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 12 }}>Background sync queue</div>
            <div style={{ padding: 14, background: "var(--cream)", borderRadius: 10, border: "1px solid var(--line-2)", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="sh-num" style={{ fontSize: 28, fontWeight: 500 }}>12</span>
                <Chip tone="forest" style={{ alignSelf: "start", fontFamily: "var(--f-mono)" }}>retrying</Chip>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Catatan panen tertunda · auto-retry tiap 5 menit</div>
              <div style={{ marginTop: 10, fontSize: 10.5, color: "var(--ink-4)", fontFamily: "var(--f-mono)", paddingTop: 10, borderTop: "1px solid var(--line-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>POST /api/panen</span><span>8</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>POST /api/perawatan</span><span>3</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>PATCH /api/lahan</span><span>1</span></div>
              </div>
            </div>

            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 10, marginTop: 16 }}>Push notifications</div>
            <div style={{ padding: 14, background: "var(--cream)", borderRadius: 10, border: "1px solid var(--line-2)" }}>
              {[
                { l: "Subscribed", v: "2.467", c: "var(--forest)" },
                { l: "Sent 7d", v: "18.420", c: "var(--ink-2)" },
                { l: "Delivered", v: "94,8%", c: "var(--forest)" },
                { l: "Clicked", v: "12,4%", c: "var(--amber-2)" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderTop: i > 0 ? "1px solid var(--line-2)" : 0, fontSize: 12 }}>
                  <span style={{ color: "var(--ink-3)" }}>{s.l}</span>
                  <span className="sh-num" style={{ fontWeight: 600, color: s.c }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Recent install events */}
      <Card padded={false} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--line-2)" }}>
          <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Install events · live</div>
          <h3 className="sh-h-4">Beforeinstallprompt activity</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--f-mono)" }}>
          <thead>
            <tr style={{ background: "var(--paper-2)" }}>
              {["Waktu", "Event", "User", "Browser · OS", "Outcome"].map(h => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-4)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ fontSize: 12 }}>
            {[
              { t: "14:32:04", e: "appinstalled", u: "rohman.tani", ua: "Chrome 124 · Android 14", out: "Pasang berhasil · pertama kali", c: "var(--forest)" },
              { t: "14:28:42", e: "beforeinstallprompt.shown", u: "anonim", ua: "Samsung Internet 25 · Android 13", out: "Banner ditampilkan", c: "var(--ink-3)" },
              { t: "14:24:18", e: "beforeinstallprompt.dismissed", u: "anonim", ua: "Chrome 124 · Android 12", out: "User tutup banner", c: "var(--terracotta-2)" },
              { t: "14:18:08", e: "appinstalled", u: "hartini.kopsawit", ua: "Chrome 125 · Windows 11", out: "Pasang di desktop", c: "var(--forest)" },
              { t: "14:14:54", e: "sw.update.found", u: "system", ua: "all clients · 1.842 sesi", out: "v2.4.1 → push ke semua client", c: "var(--c-sky)" },
            ].map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--line-2)" }}>
                <td style={{ padding: "11px 20px", color: "var(--ink-4)" }}>{r.t}</td>
                <td style={{ padding: "11px 20px", color: "var(--forest)", fontWeight: 600 }}>{r.e}</td>
                <td style={{ padding: "11px 20px", color: "var(--ink-2)" }}>{r.u}</td>
                <td style={{ padding: "11px 20px", color: "var(--ink-3)" }}>{r.ua}</td>
                <td style={{ padding: "11px 20px", color: r.c, fontWeight: 500 }}>● {r.out}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}

window.PwaDetailPage = PwaDetailPage;
