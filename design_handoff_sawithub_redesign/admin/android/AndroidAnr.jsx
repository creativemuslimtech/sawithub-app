/* global React, SH, AdminShell */
const { Card, Btn, Chip, Sparkline, I } = window.SH;

function AndroidAnrPage() {
  return (
    <AdminShell active="apps"
      headerActions={
        <>
          <Btn variant="ghost" size="sm">Buka Crashlytics →</Btn>
          <Btn variant="primary" size="sm" leading={<I.download size={14} />}>Trace bundle (ZIP)</Btn>
        </>
      }
    >
      <div style={{ marginBottom: 12, fontSize: 12, color: "var(--ink-4)", display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--f-mono)" }}>
        <span>Apps</span><span style={{ color: "var(--ink-5)" }}>/</span><span>Android</span><span style={{ color: "var(--ink-5)" }}>/</span><span style={{ color: "var(--ink-2)", fontWeight: 600 }}>ANR · per device</span>
      </div>

      <div style={{ marginBottom: 24, display: "flex", alignItems: "end", justifyContent: "space-between" }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Application Not Responding · 28 hari</div>
          <h1 className="sh-h-2">
            <em className="sh-italic" style={{ color: "var(--forest)" }}>99,94%</em> ANR-free — <em className="sh-italic" style={{ color: "var(--terracotta-2)" }}>14 ANR</em> terkluster di 6 device.
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 8, fontFamily: "var(--f-mono)" }}>
            Sumber: Play Console Vitals + Crashlytics · 4.218 install · ambang Play Bad ≥ 0,47%
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>● Below Play threshold</Chip>
          <Chip style={{ fontFamily: "var(--f-mono)" }}>5 device clusters</Chip>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { l: "ANR rate (28d)", v: "0,18%", sub: "↓ 0,06 pt", c: "var(--forest)" },
          { l: "User-affected", v: "12", sub: "0,28% MAU", c: "var(--amber-2)" },
          { l: "Total ANR", v: "14", sub: "8 unique cluster", c: "var(--c-terra)" },
          { l: "Avg block time", v: "6,8 s", sub: "main thread", c: "var(--terracotta-2)" },
          { l: "Play warning", v: "Tidak", sub: "ambang 0,47%", c: "var(--forest)" },
        ].map((m, i) => (
          <div key={i} style={{ padding: 16, background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 12, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: m.c }} />
            <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{m.l}</div>
            <div className="sh-num" style={{ fontSize: 22, fontWeight: 500, color: m.c === "var(--terracotta-2)" ? m.c : "var(--ink)" }}>{m.v}</div>
            <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Trend + device cluster bubble */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 22 }}>
        <Card padded={false} style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— ANR rate · 30 hari</div>
              <h3 className="sh-h-4">Per versi aplikasi</h3>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: "var(--ink-3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 2, background: "var(--forest)" }} /> v2.4.1</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 2, background: "var(--amber-2)" }} /> v2.4.0</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 2, background: "var(--terracotta)" }} /> v2.3.x</span>
            </div>
          </div>
          <AnrTrendChart />
        </Card>

        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Distribusi ANR · device</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>14 ANR di 6 device cluster</h3>
          <DeviceCluster />
          <div style={{ marginTop: 12, paddingTop: 14, borderTop: "1px solid var(--line-2)", fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--f-mono)", textAlign: "center" }}>
            Ukuran bubble = jumlah ANR · warna = severity
          </div>
        </Card>
      </div>

      {/* Per-device table */}
      <Card padded={false} style={{ padding: 0, marginBottom: 22, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— ANR per device</div>
            <h3 className="sh-h-4">Sorted by ANR count desc</h3>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <select className="sh-input" style={{ height: 34, width: "auto", padding: "0 30px 0 12px", fontSize: 12 }}>
              <option>Semua versi</option>
            </select>
            <select className="sh-input" style={{ height: 34, width: "auto", padding: "0 30px 0 12px", fontSize: 12 }}>
              <option>Semua OS</option>
            </select>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--paper-2)" }}>
              {[
                { l: "Device" }, { l: "Manufacturer" }, { l: "OS / API" }, { l: "RAM" },
                { l: "Install", a: "right" }, { l: "ANR", a: "right" },
                { l: "ANR-free", a: "right" }, { l: "Top cluster" }, { l: "" },
              ].map(h => (
                <th key={h.l} style={{ padding: "11px 18px", textAlign: h.a || "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>{h.l}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ fontSize: 12 }}>
            {[
              { d: "Vivo Y36", make: "Vivo", os: "Android 12", api: 31, ram: "6 GB", n: 295, anr: 6, anrFree: 97.96, cluster: "main thread blocked on /api/keuangan", clusterC: "var(--terracotta-2)", expanded: true },
              { d: "Samsung Galaxy A04", make: "Samsung", os: "Android 13", api: 33, ram: "3 GB", n: 211, anr: 3, anrFree: 98.58, cluster: "Bitmap decode on lowmem", clusterC: "var(--terracotta-2)" },
              { d: "Xiaomi Redmi 9A", make: "Xiaomi", os: "Android 10", api: 29, ram: "2 GB", n: 64, anr: 2, anrFree: 96.88, cluster: "DB migration block startup", clusterC: "var(--amber-2)" },
              { d: "Realme C30", make: "Realme", os: "Android 11", api: 30, ram: "3 GB", n: 122, anr: 1, anrFree: 99.18, cluster: "WebView init blocking", clusterC: "var(--amber-2)" },
              { d: "Infinix Smart 7", make: "Infinix", os: "Android 12", api: 31, ram: "3 GB", n: 169, anr: 1, anrFree: 99.41, cluster: "Coroutine main dispatch", clusterC: "var(--c-sky)" },
              { d: "OPPO A17", make: "OPPO", os: "Android 12", api: 31, ram: "3 GB", n: 84, anr: 1, anrFree: 98.81, cluster: "GSON parse 80kb sync", clusterC: "var(--amber-2)" },
              { d: "Xiaomi Redmi Note 12", make: "Xiaomi", os: "Android 14", api: 34, ram: "4 GB", n: 590, anr: 0, anrFree: 100, cluster: "—", clusterC: "var(--forest)" },
              { d: "Samsung Galaxy A14", make: "Samsung", os: "Android 14", api: 34, ram: "4 GB", n: 464, anr: 0, anrFree: 100, cluster: "—", clusterC: "var(--forest)" },
            ].map((r, i) => (
              <React.Fragment key={i}>
                <tr style={{ borderTop: "1px solid var(--line-2)", background: r.expanded ? "var(--terra-soft)" : "transparent" }}>
                  <td style={{ padding: "13px 18px", fontSize: 12.5, fontWeight: 600 }}>{r.d}</td>
                  <td style={{ padding: "13px 18px", color: "var(--ink-3)" }}>{r.make}</td>
                  <td style={{ padding: "13px 18px", fontFamily: "var(--f-mono)", color: "var(--ink-3)" }}>{r.os} · API {r.api}</td>
                  <td style={{ padding: "13px 18px", fontFamily: "var(--f-mono)", color: "var(--ink-3)" }}>{r.ram}</td>
                  <td style={{ padding: "13px 18px", textAlign: "right", fontFamily: "var(--f-mono)" }}>{r.n.toLocaleString("id-ID")}</td>
                  <td style={{ padding: "13px 18px", textAlign: "right", fontFamily: "var(--f-mono)", fontWeight: 600, color: r.anr > 2 ? "var(--terracotta-2)" : r.anr > 0 ? "var(--amber-2)" : "var(--ink-4)" }}>
                    {r.anr}
                  </td>
                  <td style={{ padding: "13px 18px", textAlign: "right", fontFamily: "var(--f-mono)", fontWeight: 600, color: r.anrFree < 98 ? "var(--terracotta-2)" : r.anrFree < 99.5 ? "var(--amber-2)" : "var(--forest)" }}>
                    {r.anrFree.toFixed(2)}%
                  </td>
                  <td style={{ padding: "13px 18px", fontSize: 11.5, color: r.clusterC }}>
                    {r.cluster}
                  </td>
                  <td style={{ padding: "13px 18px", textAlign: "right" }}>
                    {r.anr > 0 && (
                      <button style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper)", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "var(--ink-2)", fontFamily: "var(--f-mono)" }}>
                        {r.expanded ? "↑ Tutup" : "↓ Detail"}
                      </button>
                    )}
                  </td>
                </tr>
                {r.expanded && <AnrDetailRow />}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Action plan */}
      <Card padded={false} style={{ padding: 24 }}>
        <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Rencana mitigasi</div>
        <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Prioritas perbaikan ANR · target ≤ 0,1% rate</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { n: "01", l: "Pindahkan /api/keuangan ke coroutine IO + cache lokal Room", impact: "−6 ANR", target: "Vivo Y36 cluster", effort: "M", c: "var(--forest)" },
            { n: "02", l: "Stream Bitmap dengan inSampleSize untuk device RAM ≤4GB", impact: "−3 ANR", target: "Samsung A04, Redmi 9A", effort: "S", c: "var(--forest)" },
            { n: "03", l: "Lazy init WebView (jangan di Application.onCreate)", impact: "−1 ANR", target: "Realme C30", effort: "S", c: "var(--forest-3)" },
            { n: "04", l: "Migrasi GSON → kotlinx.serialization (lebih cepat 3×)", impact: "−1 ANR · −80ms startup", target: "OPPO A17 cluster", effort: "L", c: "var(--amber-2)" },
            { n: "05", l: "Strict mode di dev build · catch IO di main lebih awal", impact: "preventif", target: "Semua versi", effort: "S", c: "var(--c-sky)" },
            { n: "06", l: "Targetkan minSdk 26 di Q3 (deprecate Android 7-8)", impact: "drop legacy ANR", target: "1% pengguna", effort: "L", c: "var(--c-bark)" },
          ].map((a, i) => (
            <div key={i} style={{ padding: 16, background: "var(--cream)", border: "1px solid var(--line-2)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "start", gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, fontWeight: 500, color: a.c, marginTop: -2 }}>{a.n}</span>
                <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: "var(--ink)", lineHeight: 1.45 }}>{a.l}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Chip tone="forest" style={{ fontFamily: "var(--f-mono)", fontSize: 9.5 }}>{a.impact}</Chip>
                <Chip style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, background: "var(--cream-2)", borderColor: "transparent", color: "var(--ink-3)" }}>effort {a.effort}</Chip>
              </div>
              <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 8, fontFamily: "var(--f-mono)" }}>{a.target}</div>
            </div>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}

/* Expanded ANR detail row */
function AnrDetailRow() {
  return (
    <tr style={{ background: "var(--terra-soft)" }}>
      <td colSpan={9} style={{ padding: "18px 36px 22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 22 }}>
          {/* Stack trace */}
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 8, color: "var(--terracotta-2)" }}>—— Stack trace · 6 occurrences</div>
            <div style={{ background: "var(--ink)", color: "var(--paper)", padding: 18, borderRadius: 10, fontFamily: "var(--f-mono)", fontSize: 11.5, lineHeight: 1.65 }}>
              <div style={{ color: "#FF8B6B", marginBottom: 6, fontWeight: 600 }}>ANR · Input dispatching timed out (Waiting to send non-key event because the touched window has not finished processing certain input events)</div>
              <div style={{ color: "rgba(251,248,241,0.6)" }}>"main" prio=5 tid=1 Native · main thread blocked 6.842s</div>
              <div style={{ marginTop: 8, color: "rgba(251,248,241,0.85)" }}>
                <div>  at <span style={{ color: "#FFD66B" }}>java.net.SocketInputStream.read</span>(SocketInputStream.java:171)</div>
                <div>  at <span style={{ color: "#FFD66B" }}>okhttp3.internal.connection.RealConnection.connectSocket</span>(:84)</div>
                <div>  at <span style={{ color: "#FFD66B" }}>com.sawithub.app.api.KeuanganRepository.fetchYearly</span>(<span style={{ color: "#FF8B6B" }}>KeuanganRepository.kt:142</span>)</div>
                <div>  at <span style={{ color: "#FFD66B" }}>com.sawithub.app.ui.keuangan.KeuanganViewModel.load</span>(<span style={{ color: "#FF8B6B" }}>KeuanganViewModel.kt:88</span>)</div>
                <div>  at <span style={{ color: "#FFD66B" }}>kotlinx.coroutines.android.HandlerContext.dispatch</span>(:62)</div>
                <div style={{ color: "rgba(251,248,241,0.4)" }}>  ... 12 more frames</div>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 8 }}>—— Diagnosis · Vivo Y36</div>
            <div style={{ background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "var(--f-mono)", fontSize: 11.5 }}>
                {[
                  ["Cluster ID", "anr_keu_3a8f"],
                  ["First seen", "v2.4.0 · 6 hari lalu"],
                  ["Devices", "1 model · 6 sesi"],
                  ["OS range", "Android 12"],
                  ["Network", "100% 3G/slow-4G"],
                  ["Foreground", "Saat membuka /keuangan tab"],
                  ["Block duration", "min 5.2s · max 8.1s · avg 6.8s"],
                  ["Memory at ANR", "avg 482 MB / 6 GB"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ink-4)" }}>{k}</span>
                    <span style={{ color: "var(--ink-2)", fontWeight: 600, textAlign: "right", maxWidth: 200 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: 12, background: "var(--cream)", borderRadius: 8, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.55 }}>
                <strong style={{ color: "var(--ink)" }}>Root cause:</strong> network call dijalankan di main thread saat slow connection.
                Vivo Y36 punya CPU governor agresif yang men-throttle saat suhu naik.
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                <Btn variant="primary" size="sm" style={{ flex: 1 }}>Assign ke @yusran</Btn>
                <Btn variant="ghost" size="sm">Buka di Crashlytics →</Btn>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

function AnrTrendChart() {
  const days = 30;
  // ANR rate as percentage
  const v241 = Array.from({ length: days }, (_, i) => 0.08 + Math.sin(i / 5) * 0.04 + (Math.random() - 0.5) * 0.02);
  const v240 = Array.from({ length: days }, (_, i) => 0.32 + Math.sin(i / 4) * 0.1 + (i > 15 ? -0.05 : 0));
  const v23x = Array.from({ length: days }, (_, i) => 0.54 + Math.sin(i / 3) * 0.12 + (Math.random() - 0.5) * 0.08);
  const max = 0.8;
  const w = 700, h = 240, padL = 44, padR = 12, padT = 16, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const stepX = innerW / (days - 1);
  const yFor = (v) => padT + innerH - (v / max) * innerH;
  const line = (arr) => arr.map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX} ${yFor(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {[0, 0.2, 0.4, 0.6, 0.8].map((y, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={yFor(y)} y2={yFor(y)} stroke="var(--line-2)" />
          <text x={padL - 8} y={yFor(y) + 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--ink-4)">{y.toFixed(1)}%</text>
        </g>
      ))}
      {/* Play threshold */}
      <line x1={padL} x2={w - padR} y1={yFor(0.47)} y2={yFor(0.47)} stroke="var(--terracotta)" strokeDasharray="4 3" strokeWidth="1" opacity="0.6" />
      <text x={w - padR - 4} y={yFor(0.47) - 4} fontSize="9" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--terracotta-2)">Play bad ≥ 0.47%</text>

      <path d={line(v23x)} stroke="var(--terracotta)" strokeWidth="1.8" fill="none" />
      <path d={line(v240)} stroke="var(--amber-2)" strokeWidth="2" fill="none" />
      <path d={line(v241)} stroke="var(--forest)" strokeWidth="2.4" fill="none" />
    </svg>
  );
}

function DeviceCluster() {
  const data = [
    { d: "Vivo Y36", x: 38, y: 56, r: 22, c: "var(--terracotta-2)", n: 6 },
    { d: "Samsung A04", x: 64, y: 32, r: 16, c: "var(--terracotta-2)", n: 3 },
    { d: "Redmi 9A", x: 22, y: 22, r: 12, c: "var(--amber-2)", n: 2 },
    { d: "Realme C30", x: 78, y: 64, r: 9, c: "var(--amber-2)", n: 1 },
    { d: "Infinix Smart 7", x: 50, y: 80, r: 9, c: "var(--c-sky)", n: 1 },
    { d: "OPPO A17", x: 12, y: 70, r: 9, c: "var(--amber-2)", n: 1 },
  ];
  return (
    <div style={{ position: "relative", height: 240, background: "var(--cream)", borderRadius: 10, border: "1px solid var(--line-2)", overflow: "hidden" }}>
      {/* Grid */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(45, 60, 30, 0.08)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>

      {/* Axis labels */}
      <div style={{ position: "absolute", left: 8, top: 8, fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>RAM rendah ↑</div>
      <div style={{ position: "absolute", left: 8, bottom: 8, fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>RAM tinggi ↓</div>
      <div style={{ position: "absolute", right: 8, bottom: 8, fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>OS lama →</div>

      {/* Bubbles */}
      {data.map((b, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${b.x}%`, top: `${b.y}%`,
          transform: "translate(-50%, -50%)",
        }}>
          <div style={{
            width: b.r * 2, height: b.r * 2,
            borderRadius: 99, background: `${b.c}55`,
            border: `2px solid ${b.c}`,
            display: "grid", placeItems: "center",
            color: "var(--paper)", fontSize: 11, fontWeight: 700, fontFamily: "var(--f-mono)",
          }}>
            {b.n}
          </div>
          <div style={{ position: "absolute", top: b.r * 2 + 4, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "var(--ink-2)", fontWeight: 600, whiteSpace: "nowrap", fontFamily: "var(--f-mono)" }}>
            {b.d}
          </div>
        </div>
      ))}
    </div>
  );
}

window.AndroidAnrPage = AndroidAnrPage;
