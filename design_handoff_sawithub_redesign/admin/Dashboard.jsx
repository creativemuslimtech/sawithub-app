/* global React, SH, AdminShell */
const { Card, Btn, Chip, Sparkline, Ring, I, PalmFrond, PalmLeaf, SoilWaves } = window.SH;

function AdminDashboardPage() {
  return (
    <AdminShell active="overview"
      headerActions={
        <>
          <Btn variant="ghost" size="sm" leading={<I.download size={14} />}>Ekspor</Btn>
          <Btn variant="primary" size="sm">Buka command palette</Btn>
        </>
      }
    >
      {/* Editorial header */}
      <div style={{ marginBottom: 24, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between" }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Command Center · Live</div>
            <h1 className="sh-h-2" style={{ maxWidth: 760 }}>
              <em className="sh-italic" style={{ color: "var(--forest)" }}>12.418</em> petani aktif tercatat — <em className="sh-italic" style={{ color: "var(--amber-2)" }}>847</em> sedang online sekarang.
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 8, fontFamily: "var(--f-mono)" }}>
              Disegarkan otomatis setiap 30 detik · Terakhir <span style={{ color: "var(--forest)" }}>14:32:08 WIB</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["1 jam", "Hari ini", "7 hari", "30 hari", "YTD"].map((p, i) => (
              <button key={p} style={{
                padding: "8px 14px", borderRadius: 99, fontSize: 12.5, fontWeight: 600,
                background: i === 1 ? "var(--ink)" : "var(--paper)",
                color: i === 1 ? "var(--paper)" : "var(--ink-3)",
                border: i === 1 ? 0 : "1px solid var(--line-2)",
                cursor: "pointer",
                fontFamily: "var(--f-mono)",
              }}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Top metrics row — denser, ops-style */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { l: "Petani", v: "12.418", delta: "+184", color: "var(--forest)", trend: [10, 12, 11, 14, 15, 16, 18] },
          { l: "Online", v: "847", delta: "↑ live", color: "var(--amber-2)", live: true, trend: [820, 850, 830, 870, 820, 840, 847] },
          { l: "Kebun", v: "28.642", delta: "+412", color: "var(--c-bark)", trend: [24, 25, 26, 26, 27, 28, 28] },
          { l: "Panen", v: "4,2 jt", delta: "+8.2k", color: "var(--forest-3)", trend: [3.5, 3.7, 3.8, 3.9, 4, 4.1, 4.2] },
          { l: "Volume TBS", v: "186 kt", delta: "+2,4 kt", color: "var(--c-sky)", trend: [170, 174, 178, 180, 182, 184, 186] },
          { l: "Pendapatan platform", v: "Rp 2,4 M", delta: "+12%", color: "var(--amber)", trend: [2, 2.1, 2.2, 2.2, 2.3, 2.3, 2.4] },
        ].map((m, i) => (
          <div key={i} style={{
            position: "relative",
            padding: 14, borderRadius: 12,
            background: "var(--paper)", border: "1px solid var(--line-2)",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: m.color }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 600, fontFamily: "var(--f-mono)" }}>{m.l}</span>
              {m.live && <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--terracotta)", boxShadow: "0 0 6px var(--terracotta)" }} />}
            </div>
            <div className="sh-num" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>{m.v}</div>
            <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "end" }}>
              <span style={{ fontSize: 11, color: m.delta.startsWith("↑") || m.delta.startsWith("+") ? "var(--forest)" : "var(--terracotta-2)", fontFamily: "var(--f-mono)", fontWeight: 500 }}>
                {m.delta}
              </span>
              <Sparkline data={m.trend} width={56} height={20} color={m.color} fill={false} />
            </div>
          </div>
        ))}
      </div>

      {/* Big chart + secondary panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, marginBottom: 22 }}>
        <Card padded={false} style={{ padding: 24, position: "relative", overflow: "hidden" }}>
          <PalmLeaf size={120} style={{ position: "absolute", right: 24, top: 24, color: "var(--forest)", opacity: 0.05 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Aktivitas platform · 14 hari</div>
              <h3 className="sh-h-4">Kunjungan, signup & tingkat retensi</h3>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { l: "Visitors", c: "var(--forest)" },
                { l: "Signups", c: "var(--amber)" },
                { l: "Retention 30d", c: "var(--c-terra)", dashed: true },
              ].map(l => (
                <div key={l.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 12, height: 0, borderTop: l.dashed ? `2px dashed ${l.c}` : `2px solid ${l.c}` }} />
                  <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{l.l}</span>
                </div>
              ))}
            </div>
          </div>

          <AdminPlatformChart />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line-2)" }}>
            {[
              { l: "Visitors / hari", v: "18.4k", sub: "↑ 12,4%" },
              { l: "Konversi", v: "8,2%", sub: "↑ 0,4 pt" },
              { l: "Retensi 30d", v: "64,8%", sub: "↑ 2,1 pt" },
              { l: "Churn 90d", v: "2,4%", sub: "↓ 0,3 pt", terra: false },
            ].map((s, i) => (
              <div key={i} style={{ padding: i > 0 ? "0 0 0 18px" : "0 18px 0 0", borderLeft: i > 0 ? "1px solid var(--line-2)" : 0 }}>
                <div className="sh-eyebrow" style={{ fontSize: 10 }}>{s.l}</div>
                <div className="sh-num" style={{ fontSize: 20, fontWeight: 500, marginTop: 6 }}>{s.v}</div>
                <Chip tone="forest" style={{ marginTop: 6 }}>{s.sub}</Chip>
              </div>
            ))}
          </div>
        </Card>

        {/* Geographic split */}
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Sebaran provinsi</div>
          <h3 className="sh-h-4" style={{ marginBottom: 20 }}>Top 8 · 18 provinsi aktif</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {[
              { p: "Riau", v: 4218, pct: 34 },
              { p: "Sumatera Utara", v: 2104, pct: 17 },
              { p: "Jambi", v: 1546, pct: 12 },
              { p: "Sumatera Selatan", v: 1318, pct: 11 },
              { p: "Kalimantan Tengah", v: 982, pct: 8 },
              { p: "Aceh", v: 728, pct: 6 },
              { p: "Kalimantan Barat", v: 612, pct: 5 },
              { p: "Lain-lain (11)", v: 910, pct: 7 },
            ].map((r, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 500, color: "var(--ink-2)" }}>{r.p}</span>
                  <span className="sh-num" style={{ color: "var(--ink-3)" }}>{r.v.toLocaleString("id-ID")} <span style={{ color: "var(--ink-5)" }}>· {r.pct}%</span></span>
                </div>
                <div className="sh-progress" style={{ height: 5 }}>
                  <i style={{ width: `${r.pct * 2.5}%`, background: i === 0 ? "var(--amber)" : i < 4 ? "var(--forest)" : "var(--forest-3)" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Data health + Alerts side-by-side */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, marginBottom: 22 }}>
        <Card padded={false} style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Kualitas data</div>
              <h3 className="sh-h-4">Skor kelengkapan data per modul</h3>
            </div>
            <Chip tone="forest">Skor agregat 87,4</Chip>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { l: "Catatan panen", pct: 96, color: "var(--forest)" },
              { l: "Biaya rawat", pct: 84, color: "var(--forest-3)" },
              { l: "Lokasi geo", pct: 78, color: "var(--amber-2)" },
              { l: "Foto kebun", pct: 62, color: "var(--c-terra)" },
            ].map((d, i) => (
              <div key={i} style={{ padding: 16, background: "var(--cream)", borderRadius: 12, textAlign: "center" }}>
                <Ring pct={d.pct} color={d.color} label={String(d.pct)} size={68} strokeWidth={6} />
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 10 }}>{d.l}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4, fontFamily: "var(--f-mono)" }}>
                  {d.pct > 85 ? "Baik" : d.pct > 75 ? "Cukup" : "Perlu perbaikan"}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padded={false} style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6, color: "var(--terracotta-2)" }}>—— Alerts aktif</div>
              <h3 className="sh-h-4">4 perhatian, 1 kritis</h3>
            </div>
            <a style={{ fontSize: 12, color: "var(--forest)", fontWeight: 600, alignSelf: "center" }}>Semua →</a>
          </div>
          {[
            { sev: "critical", t: "Queue email backlog naik ke 1.240", time: "8 menit lalu", source: "notif-worker" },
            { sev: "warn", t: "Latensi /panen/list 1.2s (p95)", time: "24 menit lalu", source: "core-api" },
            { sev: "warn", t: "Disk node-3 di 82%", time: "1 jam lalu", source: "infra" },
            { sev: "warn", t: "Stripe webhook signature mismatch ×3", time: "2 jam lalu", source: "billing" },
            { sev: "info", t: "Backup harian selesai (4,2 GB)", time: "3 jam lalu", source: "db-ops" },
          ].map((a, i, arr) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--line-2)" : 0, alignItems: "start" }}>
              <span style={{
                marginTop: 3,
                width: 10, height: 10, borderRadius: 99,
                background: a.sev === "critical" ? "var(--terracotta)" : a.sev === "warn" ? "var(--amber-2)" : "var(--c-sky)",
                flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{a.t}</div>
                <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 3, fontFamily: "var(--f-mono)" }}>
                  {a.source} · {a.time}
                </div>
              </div>
              <button style={{ fontSize: 11, color: "var(--forest)", fontWeight: 600, background: "transparent", border: 0, cursor: "pointer" }}>Lihat</button>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent activity feed */}
      <Card padded={false} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--line-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Stream live</div>
            <h3 className="sh-h-4">Aktivitas pengguna terbaru</h3>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Semua", "Signup", "Panen", "Bayar", "Error"].map((t, i) => (
              <button key={t} style={{
                padding: "5px 11px", borderRadius: 7, fontSize: 11.5, fontWeight: 600,
                background: i === 0 ? "var(--ink)" : "var(--paper)",
                color: i === 0 ? "var(--paper)" : "var(--ink-3)",
                border: i === 0 ? 0 : "1px solid var(--line)", cursor: "pointer",
                fontFamily: "var(--f-mono)",
              }}>{t}</button>
            ))}
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--paper-2)" }}>
              {["Waktu", "Event", "User", "Detail", "Lokasi", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 24px", textAlign: "left", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { t: "14:32:04", e: "signup.complete", c: "var(--forest)", u: "rohman.tani · Riau", d: "Trial dimulai · referal:tiktok", l: "Pekanbaru", s: "ok" },
              { t: "14:31:58", e: "panen.created", c: "var(--c-bark)", u: "hartini.kopsawit", d: "Blok B · 980 kg · Rp 2.300/kg", l: "Tanjung Jabung", s: "ok" },
              { t: "14:31:52", e: "billing.success", c: "var(--amber-2)", u: "yusran.medan", d: "Pro · Rp 49.000 · BCA VA", l: "Medan", s: "ok" },
              { t: "14:31:41", e: "panen.created", c: "var(--c-bark)", u: "suparman.riau", d: "Blok A · 1.420 kg · Rp 2.340/kg", l: "Pekanbaru", s: "ok" },
              { t: "14:31:28", e: "api.error", c: "var(--terracotta-2)", u: "system", d: "POST /api/perawatan 502 (gateway)", l: "ID-jakarta", s: "fail" },
              { t: "14:31:14", e: "user.login", c: "var(--forest)", u: "hartini.kopsawit", d: "WhatsApp OTP · device:android-14", l: "Tanjung Jabung", s: "ok" },
              { t: "14:30:58", e: "billing.failed", c: "var(--terracotta-2)", u: "ibu.maria.aceh", d: "Pro · OVO insufficient_balance", l: "Banda Aceh", s: "fail" },
              { t: "14:30:42", e: "kalkulator.run", c: "var(--c-sky)", u: "pak.haji.kalbar", d: "NPK 12-12-17 · TT 6 · 480 pohon", l: "Pontianak", s: "ok" },
            ].map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--line-2)" }}>
                <td style={{ padding: "11px 24px", fontSize: 12, fontFamily: "var(--f-mono)", color: "var(--ink-4)" }}>{r.t}</td>
                <td style={{ padding: "11px 24px" }}>
                  <Chip style={{
                    background: `${r.c}14`, color: r.c, borderColor: `${r.c}22`,
                    fontFamily: "var(--f-mono)", fontSize: 11,
                  }}>{r.e}</Chip>
                </td>
                <td style={{ padding: "11px 24px", fontSize: 12.5, fontFamily: "var(--f-mono)", color: "var(--ink-2)" }}>{r.u}</td>
                <td style={{ padding: "11px 24px", fontSize: 12.5, color: "var(--ink-2)" }}>{r.d}</td>
                <td style={{ padding: "11px 24px", fontSize: 12, color: "var(--ink-3)" }}>{r.l}</td>
                <td style={{ padding: "11px 24px" }}>
                  {r.s === "ok" ? (
                    <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>200 OK</Chip>
                  ) : (
                    <Chip tone="terra" style={{ fontFamily: "var(--f-mono)" }}>FAIL</Chip>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}

function AdminPlatformChart() {
  const days = 14;
  const visitors = [12, 14, 13, 16, 17, 14, 18, 19, 17, 20, 22, 19, 24, 22];
  const signups = [3, 4, 3, 5, 4, 3, 5, 6, 5, 6, 7, 6, 8, 7];
  const retention = [60, 61, 62, 62, 63, 63, 64, 63, 65, 64, 65, 66, 65, 65]; // % on right axis
  const max = 30;
  const chartH = 220;
  const chartW = 720;
  const padL = 36;
  const padR = 36;
  const padT = 16;
  const padB = 30;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const stepX = innerW / (days - 1);
  const days_labels = ["3 Mei", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16 Mei"];

  const line = (data, mx) => data.map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX} ${padT + innerH - (v / mx) * innerH}`).join(" ");

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height={chartH}>
      {[0, 10, 20, 30].map((y, i) => (
        <g key={i}>
          <line x1={padL} x2={chartW - padR} y1={padT + innerH - (y / max) * innerH} y2={padT + innerH - (y / max) * innerH} stroke="var(--line-2)" />
          <text x={padL - 8} y={padT + innerH - (y / max) * innerH + 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--ink-4)">{y}k</text>
        </g>
      ))}
      {[0, 25, 50, 75, 100].map((y, i) => (
        <text key={i} x={chartW - padR + 8} y={padT + innerH - (y / 100) * innerH + 4} fontSize="10" textAnchor="start" fontFamily="var(--f-mono)" fill="var(--ink-4)">{y}%</text>
      ))}

      {/* Area under visitors */}
      <defs>
        <linearGradient id="visgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--forest)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--forest)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line(visitors, max)} L ${padL + (days - 1) * stepX} ${padT + innerH} L ${padL} ${padT + innerH} Z`} fill="url(#visgrad)" />
      <path d={line(visitors, max)} stroke="var(--forest)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {visitors.map((v, i) => <circle key={i} cx={padL + i * stepX} cy={padT + innerH - (v / max) * innerH} r="3.5" fill="var(--paper)" stroke="var(--forest)" strokeWidth="2" />)}

      <path d={line(signups, max)} stroke="var(--amber)" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      <path d={line(retention, 100)} stroke="var(--c-terra)" strokeWidth="1.8" fill="none" strokeDasharray="5 3" strokeLinecap="round" />

      {/* X labels */}
      {days_labels.map((m, i) => (
        <text key={i} x={padL + i * stepX} y={chartH - 10} fontSize="10" textAnchor="middle" fontFamily="var(--f-mono)" fill="var(--ink-4)">{m}</text>
      ))}
    </svg>
  );
}

window.AdminDashboardPage = AdminDashboardPage;
