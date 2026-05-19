/* global React, SH, AdminShell */
const { Card, Btn, Chip, Sparkline, Ring, I, PalmLeaf } = window.SH;

function AdminAppsPage() {
  return (
    <AdminShell active="apps"
      headerActions={
        <>
          <Btn variant="ghost" size="sm" leading={<I.download size={14} />}>Rilis catatan</Btn>
          <Btn variant="primary" size="sm">Trigger update push</Btn>
        </>
      }
    >
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "end", justifyContent: "space-between" }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Aplikasi & Rilis · Mei 2026</div>
          <h1 className="sh-h-2">
            <em className="sh-italic" style={{ color: "var(--forest)" }}>8.642</em> instalasi aktif — <em className="sh-italic" style={{ color: "var(--amber-2)" }}>78%</em> sudah di versi terbaru.
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 8, fontFamily: "var(--f-mono)" }}>
            PWA web 3.842 · Android 4.218 · iOS 582 (beta) · Crash-free 99,82%
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" size="sm">Statuspage publik →</Btn>
          <Btn variant="ghost" size="sm">Google Play console →</Btn>
        </div>
      </div>

      {/* Platform overview cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 22 }}>
        {/* PWA */}
        <Card padded={false} style={{ padding: 24, position: "relative", overflow: "hidden", borderTop: "3px solid var(--forest)" }}>
          <PalmLeaf size={120} style={{ position: "absolute", right: -20, top: -10, color: "var(--forest)", opacity: 0.06 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--forest-soft)", color: "var(--forest)", display: "grid", placeItems: "center" }}>
              <PwaIcon size={22} />
            </div>
            <div>
              <div className="sh-eyebrow" style={{ color: "var(--forest)" }}>—— Progressive Web App</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>Web · sawithub.com</div>
            </div>
          </div>
          <div className="sh-num" style={{ fontSize: 36, fontWeight: 500, color: "var(--forest)", letterSpacing: "-0.02em" }}>3.842</div>
          <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 4 }}>instalasi aktif · 44% pengguna</div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line-2)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { l: "Versi terbaru", v: "v2.4.1", sub: "94% adopsi" },
              { l: "Avg session", v: "8m 42s", sub: "↑ 12%" },
              { l: "Lighthouse", v: "94/100", sub: "performance" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 9.5, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "var(--f-mono)" }}>{s.l}</div>
                <div className="sh-num" style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Android */}
        <Card padded={false} style={{ padding: 24, position: "relative", overflow: "hidden", borderTop: "3px solid var(--amber)" }}>
          <PalmLeaf size={120} style={{ position: "absolute", right: -20, top: -10, color: "var(--amber-2)", opacity: 0.06 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--amber-tint)", color: "var(--amber-2)", display: "grid", placeItems: "center" }}>
              <AndroidIcon size={24} />
            </div>
            <div>
              <div className="sh-eyebrow" style={{ color: "var(--amber-2)" }}>—— Android</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>Play Store · com.sawithub</div>
            </div>
          </div>
          <div className="sh-num" style={{ fontSize: 36, fontWeight: 500, color: "var(--amber-2)", letterSpacing: "-0.02em" }}>4.218</div>
          <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 4 }}>instalasi aktif · 49% pengguna</div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line-2)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { l: "Versi terbaru", v: "v2.4.1", sub: "78% adopsi" },
              { l: "Rating Play", v: "4,6 ★", sub: "1.842 ulasan" },
              { l: "Crash-free", v: "99,82%", sub: "↑ 0,1 pt" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 9.5, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "var(--f-mono)" }}>{s.l}</div>
                <div className="sh-num" style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* iOS (beta) */}
        <Card padded={false} style={{ padding: 24, position: "relative", overflow: "hidden", borderTop: "3px solid var(--ink-4)", opacity: 0.92 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--cream-2)", color: "var(--ink-2)", display: "grid", placeItems: "center" }}>
              <IosIcon size={22} />
            </div>
            <div>
              <div className="sh-eyebrow" style={{ color: "var(--ink-3)" }}>—— iOS</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                TestFlight <Chip tone="amber" style={{ fontFamily: "var(--f-mono)" }}>BETA</Chip>
              </div>
            </div>
          </div>
          <div className="sh-num" style={{ fontSize: 36, fontWeight: 500, color: "var(--ink-2)", letterSpacing: "-0.02em" }}>582</div>
          <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 4 }}>tester aktif · 7% pengguna</div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line-2)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { l: "Build", v: "0.9.4-rc2", sub: "submit 18 Mei" },
              { l: "Crash-free", v: "99,2%", sub: "12 crash" },
              { l: "Target rilis", v: "Q3 2026", sub: "produksi" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 9.5, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: ".1em", fontFamily: "var(--f-mono)" }}>{s.l}</div>
                <div className="sh-num" style={{ fontSize: 14, fontWeight: 500, marginTop: 3 }}>{s.v}</div>
                <div style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* PWA Detail Block */}
      <Card padded={false} style={{ padding: 0, marginBottom: 22, overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--line-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--forest-soft)", color: "var(--forest)", display: "grid", placeItems: "center" }}>
              <PwaIcon size={18} />
            </div>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Detail PWA</div>
              <h3 className="sh-h-4">Progressive Web App · service worker v2.4.1</h3>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>● Healthy</Chip>
            <Chip style={{ fontFamily: "var(--f-mono)" }}>Manifest valid</Chip>
            <Chip style={{ fontFamily: "var(--f-mono)" }}>HTTPS ✓</Chip>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 0 }}>
          {/* Install funnel */}
          <div style={{ padding: 24, borderRight: "1px solid var(--line-2)" }}>
            <div className="sh-eyebrow" style={{ marginBottom: 14 }}>Funnel install · 30 hari</div>
            {[
              { l: "Visit sawithub.com", v: "184.2k", pct: 100, c: "var(--forest)" },
              { l: "Lihat install prompt", v: "62.8k", pct: 34, c: "var(--forest-3)" },
              { l: "Klik 'Install'", v: "12.4k", pct: 6.7, c: "var(--amber-2)" },
              { l: "Install selesai", v: "8.842", pct: 4.8, c: "var(--amber)" },
              { l: "Buka setelah install", v: "8.421", pct: 4.6, c: "var(--c-bark)" },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{s.l}</span>
                  <span className="sh-num" style={{ fontSize: 12, fontWeight: 500 }}>{s.v}</span>
                </div>
                <div style={{ height: 6, background: "var(--line-soft)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.pct}%`, background: s.c }} />
                </div>
              </div>
            ))}
          </div>

          {/* Browser breakdown */}
          <div style={{ padding: 24, borderRight: "1px solid var(--line-2)" }}>
            <div className="sh-eyebrow" style={{ marginBottom: 14 }}>Browser · semua sesi</div>
            {[
              { l: "Chrome (mobile)", v: 58, ua: "v124+", c: "var(--forest)" },
              { l: "Chrome (desktop)", v: 18, ua: "v124+", c: "var(--forest-3)" },
              { l: "Samsung Internet", v: 12, ua: "v25", c: "var(--amber)" },
              { l: "Safari (mobile)", v: 7, ua: "v17", c: "var(--c-sky)" },
              { l: "Firefox", v: 3, ua: "v125", c: "var(--c-terra)" },
              { l: "Lainnya", v: 2, ua: "—", c: "var(--ink-4)" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: i > 0 ? "1px solid var(--line-2)" : 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: b.c, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{b.l}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-4)", fontFamily: "var(--f-mono)", marginTop: 1 }}>{b.ua}</div>
                </div>
                <span className="sh-num" style={{ fontSize: 13, fontWeight: 500, color: b.c, width: 40, textAlign: "right" }}>{b.v}%</span>
              </div>
            ))}
          </div>

          {/* Service Worker health */}
          <div style={{ padding: 24, background: "var(--paper-2)" }}>
            <div className="sh-eyebrow" style={{ marginBottom: 14 }}>Service Worker · runtime</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { l: "Cache hit ratio", v: "92,4%", c: "var(--forest)", bar: 92, sub: "184 MB / 200 MB allocated" },
                { l: "Offline ready", v: "98,1%", c: "var(--forest)", bar: 98, sub: "instalasi yang bisa offline" },
                { l: "Push subscribed", v: "64,2%", c: "var(--amber-2)", bar: 64, sub: "2.467 device subscribed" },
                { l: "Background sync queue", v: "12", c: "var(--c-sky)", sub: "panen tertunda · auto-retry" },
                { l: "Update channel", v: "stable", c: "var(--forest)", sub: "v2.4.1 → check setiap 6 jam" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{s.l}</span>
                    <span className="sh-num" style={{ fontSize: 12.5, fontWeight: 600, color: s.c }}>{s.v}</span>
                  </div>
                  {s.bar !== undefined && (
                    <div style={{ height: 5, background: "var(--line-soft)", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                      <div style={{ height: "100%", width: `${s.bar}%`, background: s.c }} />
                    </div>
                  )}
                  <div style={{ fontSize: 10.5, color: "var(--ink-4)" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Android Detail Block */}
      <Card padded={false} style={{ padding: 0, marginBottom: 22, overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--line-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--amber-tint)", color: "var(--amber-2)", display: "grid", placeItems: "center" }}>
              <AndroidIcon size={20} />
            </div>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Detail Android</div>
              <h3 className="sh-h-4">Native APK · Kotlin · minSdk 24 (Android 7)</h3>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>● Healthy</Chip>
            <Chip style={{ fontFamily: "var(--f-mono)" }}>Play Console ✓</Chip>
            <Btn variant="ghost" size="sm">Lihat ANR & crashes →</Btn>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 0 }}>
          {/* App version adoption */}
          <div style={{ padding: 24, borderRight: "1px solid var(--line-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="sh-eyebrow">Adopsi versi aplikasi</div>
              <span style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>4.218 install aktif</span>
            </div>
            {[
              { v: "v2.4.1", build: 241, code: "2410", pct: 78, count: 3290, status: "latest", date: "12 Mei 2026", color: "var(--forest)" },
              { v: "v2.4.0", build: 240, code: "2400", pct: 14, count: 590, status: "supported", date: "2 Mei 2026", color: "var(--forest-3)" },
              { v: "v2.3.2", build: 232, code: "2320", pct: 5, count: 211, status: "supported", date: "18 Apr 2026", color: "var(--c-bark)" },
              { v: "v2.3.0", build: 230, code: "2300", pct: 2, count: 84, status: "deprecated", date: "8 Apr 2026", color: "var(--amber-2)" },
              { v: "v2.2.x", build: 220, code: "2200", pct: 1, count: 43, status: "force-update", date: "12 Mar 2026", color: "var(--terracotta-2)" },
            ].map((v, i) => (
              <div key={i} style={{ padding: "10px 0", borderTop: i > 0 ? "1px solid var(--line-2)" : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span className="sh-num" style={{ fontSize: 13.5, fontWeight: 600, color: v.color, width: 64 }}>{v.v}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>build #{v.code}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>· {v.date}</span>
                  {v.status === "latest" && <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>LATEST</Chip>}
                  {v.status === "supported" && <Chip style={{ fontFamily: "var(--f-mono)", background: "var(--cream-2)", borderColor: "transparent", color: "var(--ink-3)" }}>supported</Chip>}
                  {v.status === "deprecated" && <Chip tone="amber" style={{ fontFamily: "var(--f-mono)" }}>deprecated</Chip>}
                  {v.status === "force-update" && <Chip tone="terra" style={{ fontFamily: "var(--f-mono)" }}>force-update</Chip>}
                  <span style={{ marginLeft: "auto" }}>
                    <span className="sh-num" style={{ fontSize: 12, color: "var(--ink-3)", marginRight: 8 }}>{v.count.toLocaleString("id-ID")}</span>
                    <span className="sh-num" style={{ fontSize: 12, fontWeight: 600, color: v.color, width: 36, display: "inline-block", textAlign: "right" }}>{v.pct}%</span>
                  </span>
                </div>
                <div style={{ height: 6, background: "var(--line-soft)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${v.pct}%`, background: v.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* OS distribution */}
          <div style={{ padding: 24, borderRight: "1px solid var(--line-2)" }}>
            <div className="sh-eyebrow" style={{ marginBottom: 14 }}>Android OS version</div>
            {[
              { v: "Android 14", api: "API 34", pct: 32, count: 1350, c: "var(--forest)" },
              { v: "Android 13", api: "API 33", pct: 28, count: 1181, c: "var(--forest-3)" },
              { v: "Android 12", api: "API 31", pct: 18, count: 759, c: "var(--c-bark)" },
              { v: "Android 11", api: "API 30", pct: 12, count: 506, c: "var(--amber-2)" },
              { v: "Android 10", api: "API 29", pct: 6, count: 253, c: "var(--c-terra)" },
              { v: "Android 9", api: "API 28", pct: 3, count: 127, c: "var(--c-sky)" },
              { v: "Android 7-8", api: "API 24-27", pct: 1, count: 42, c: "var(--ink-4)" },
            ].map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: o.c }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{o.v}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>{o.api}</div>
                </div>
                <span className="sh-num" style={{ fontSize: 11, color: "var(--ink-4)", width: 50, textAlign: "right" }}>{o.count.toLocaleString("id-ID")}</span>
                <span className="sh-num" style={{ fontSize: 12, fontWeight: 500, color: o.c, width: 36, textAlign: "right" }}>{o.pct}%</span>
              </div>
            ))}
          </div>

          {/* Device + APK */}
          <div style={{ padding: 24, background: "var(--paper-2)" }}>
            <div className="sh-eyebrow" style={{ marginBottom: 14 }}>APK Bundle v2.4.1</div>
            <div style={{ padding: 14, background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 10, marginBottom: 14, fontFamily: "var(--f-mono)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--ink-4)" }}>versionCode</span>
                <span style={{ fontSize: 12, color: "var(--ink), fontWeight: 600" }}>2410</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--ink-4)" }}>size (download)</span>
                <span className="sh-num" style={{ fontSize: 12, fontWeight: 600 }}>18,4 MB</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--ink-4)" }}>size (installed)</span>
                <span className="sh-num" style={{ fontSize: 12, fontWeight: 600 }}>42,1 MB</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--ink-4)" }}>signing</span>
                <span style={{ fontSize: 11.5, color: "var(--forest)", fontWeight: 600 }}>✓ Play App Signing</span>
              </div>
            </div>
            <div className="sh-eyebrow" style={{ marginBottom: 10, marginTop: 18 }}>Top devices</div>
            {[
              { d: "Xiaomi Redmi Note 12", pct: 14, c: "var(--forest)" },
              { d: "Samsung Galaxy A14", pct: 11, c: "var(--forest-3)" },
              { d: "OPPO A78", pct: 9, c: "var(--c-bark)" },
              { d: "Vivo Y36", pct: 7, c: "var(--amber-2)" },
              { d: "Realme C55", pct: 6, c: "var(--c-terra)" },
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderTop: i > 0 ? "1px solid var(--line-2)" : 0 }}>
                <span style={{ fontSize: 12 }}>{d.d}</span>
                <span className="sh-num" style={{ fontSize: 12, fontWeight: 500, color: d.c }}>{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Crash + Release timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
        <Card padded={false} style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Crash-free sessions · 30 hari</div>
              <h3 className="sh-h-4">Stabilitas per platform</h3>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11.5 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 2, background: "var(--forest)" }} /> PWA</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 2, background: "var(--amber)" }} /> Android</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 2, background: "var(--ink-4)", borderTop: "2px dashed var(--ink-4)" }} /> iOS beta</span>
            </div>
          </div>
          <CrashChart />
        </Card>

        <Card padded={false} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line-2)" }}>
            <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Release timeline · 60 hari</div>
            <h3 className="sh-h-4">7 rilis · 2 hotfix</h3>
          </div>
          <div style={{ padding: 24 }}>
            {[
              { v: "v2.4.1", date: "12 Mei 2026", platform: "PWA + Android", type: "feat", note: "Kalkulator pupuk v2 (rollout 25%)", color: "var(--forest)" },
              { v: "v2.4.0", date: "2 Mei 2026", platform: "PWA + Android", type: "minor", note: "Laporan keuangan editorial · pengingat WhatsApp", color: "var(--forest)" },
              { v: "v2.3.2", date: "18 Apr 2026", platform: "Android", type: "hotfix", note: "Fix crash saat input panen besar > 5 ton", color: "var(--terracotta-2)" },
              { v: "v2.3.1", date: "14 Apr 2026", platform: "PWA", type: "hotfix", note: "Service worker tidak update otomatis", color: "var(--terracotta-2)" },
              { v: "v2.3.0", date: "8 Apr 2026", platform: "PWA + Android + iOS-beta", type: "minor", note: "Onboarding wizard · Indonesian voice input", color: "var(--forest)" },
              { v: "v2.2.4", date: "22 Mar 2026", platform: "Android", type: "patch", note: "Localization fixes · Android 14 compat", color: "var(--forest-3)" },
            ].map((r, i, arr) => (
              <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 14, position: "relative" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 99, background: r.color, marginTop: 4, border: "2px solid var(--paper)", boxShadow: "0 0 0 2px " + r.color + "33" }} />
                  {i < arr.length - 1 && <div style={{ position: "absolute", left: 5, top: 18, width: 2, bottom: -14, background: "var(--line)" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span className="sh-num" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{r.v}</span>
                    <Chip style={{
                      fontFamily: "var(--f-mono)", fontSize: 10,
                      background: r.type === "hotfix" ? "var(--terra-soft)" : r.type === "feat" ? "var(--amber-soft)" : "var(--cream-2)",
                      color: r.type === "hotfix" ? "var(--terracotta-2)" : r.type === "feat" ? "var(--amber-2)" : "var(--ink-3)",
                      borderColor: "transparent",
                    }}>{r.type}</Chip>
                    <span style={{ fontSize: 10.5, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>· {r.platform}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.45 }}>{r.note}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 3, fontFamily: "var(--f-mono)" }}>{r.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

/* Icons */
function PwaIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 5h18v11H3z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 19h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 11 12 8l3 3M12 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AndroidIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12a7 7 0 0 1 14 0v6H5v-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 9 5.5 7M17 9l1.5-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="13" r="0.9" fill="currentColor" />
      <circle cx="15" cy="13" r="0.9" fill="currentColor" />
      <path d="M3 14v4M21 14v4M9 18v3M15 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IosIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M16 7c-1 0-2 1-2 2 0 1 1 2 2 2 1.2 0 2.4 0.7 2.4 2.4 0 2-1.6 3.4-2.6 4-1 0.6-2 0.8-3.8 0.8s-3-0.2-4-0.8C7 16.8 5.4 15.4 5.4 13.4 5.4 11.7 6.6 11 7.8 11c1 0 2-1 2-2s-1-2-2-2c-1.5 0-3.5 1-3.5 4 0 3 2.4 5 5 6.2 1.8 0.8 3.7 0.8 5.4 0 2.6-1.2 5-3.2 5-6.2 0-3-2-4-3.5-4Z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <circle cx="16" cy="5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function CrashChart() {
  const days = 30;
  const pwa     = Array.from({ length: days }, (_, i) => 99.7 + Math.sin(i / 3) * 0.15 + Math.random() * 0.08);
  const android = Array.from({ length: days }, (_, i) => 99.82 + Math.sin(i / 4) * 0.1 + (i === 18 ? -0.4 : 0));
  const ios     = Array.from({ length: days }, (_, i) => 99.2 + Math.sin(i / 2) * 0.4 + (Math.random() - 0.5) * 0.4);
  const min = 98.4, max = 100;
  const w = 700, h = 240, padL = 44, padR = 16, padT = 16, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const stepX = innerW / (days - 1);
  const yFor = (v) => padT + innerH - ((v - min) / (max - min)) * innerH;
  const line = (data) => data.map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX} ${yFor(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {[98.5, 99, 99.5, 100].map((y, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={yFor(y)} y2={yFor(y)} stroke="var(--line-2)" />
          <text x={padL - 8} y={yFor(y) + 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--ink-4)">{y.toFixed(1)}%</text>
        </g>
      ))}
      <line x1={padL} x2={w - padR} y1={yFor(99.5)} y2={yFor(99.5)} stroke="var(--amber-2)" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
      <text x={w - padR - 4} y={yFor(99.5) - 4} fontSize="9" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--amber-2)">SLO 99,5%</text>

      <path d={line(ios)} stroke="var(--ink-4)" strokeWidth="1.6" fill="none" strokeDasharray="5 3" />
      <path d={line(android)} stroke="var(--amber)" strokeWidth="2" fill="none" />
      <path d={line(pwa)} stroke="var(--forest)" strokeWidth="2.2" fill="none" />

      {/* Annotation on android dip */}
      <g>
        <circle cx={padL + 18 * stepX} cy={yFor(android[18])} r="4" fill="var(--paper)" stroke="var(--amber-2)" strokeWidth="2" />
        <line x1={padL + 18 * stepX} x2={padL + 18 * stepX} y1={yFor(android[18]) + 8} y2={yFor(android[18]) + 24} stroke="var(--amber-2)" strokeWidth="1" />
        <rect x={padL + 18 * stepX - 56} y={yFor(android[18]) + 24} width="112" height="20" rx="4" fill="var(--ink)" />
        <text x={padL + 18 * stepX} y={yFor(android[18]) + 38} fontSize="10" textAnchor="middle" fontFamily="var(--f-mono)" fill="var(--paper)">v2.3.0 OOM bug</text>
      </g>
    </svg>
  );
}

window.AdminAppsPage = AdminAppsPage;
