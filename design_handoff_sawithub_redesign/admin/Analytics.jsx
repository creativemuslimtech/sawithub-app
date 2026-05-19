/* global React, SH, AdminShell */
const { Card, Btn, Chip, Sparkline, Ring, I } = window.SH;

function AdminAnalyticsPage() {
  return (
    <AdminShell active="analytics"
      headerActions={
        <>
          <select className="sh-input" style={{ height: 36, width: "auto", padding: "0 30px 0 12px", fontSize: 12.5 }}>
            <option>Mei 2026</option>
          </select>
          <Btn variant="primary" size="sm" leading={<I.download size={14} />}>Unduh laporan</Btn>
        </>
      }
    >
      <div style={{ marginBottom: 24 }}>
        <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Analytics · Mei 2026</div>
        <h1 className="sh-h-2">
          12.418 petani — <em className="sh-italic" style={{ color: "var(--forest)" }}>cohort April</em> retensi 64,8%.
        </h1>
      </div>

      {/* Funnel */}
      <Card padded={false} style={{ padding: 28, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Funnel akuisisi · 30 hari</div>
            <h3 className="sh-h-4">Dari landing ke pengguna berbayar</h3>
          </div>
          <Chip tone="forest">Konversi 4,8% · ↑ 0,4 pt</Chip>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, alignItems: "stretch" }}>
          {[
            { l: "Visitor", v: "184.2k", pct: 100, drop: null, c: "var(--forest)" },
            { l: "Signup form", v: "42.4k", pct: 23, drop: "-77%", c: "var(--forest-3)" },
            { l: "Email confirmed", v: "38.1k", pct: 21, drop: "-10%", c: "var(--c-bark)" },
            { l: "Trial aktif", v: "18.6k", pct: 10, drop: "-51%", c: "var(--amber-2)" },
            { l: "Bayar Pro", v: "8.8k", pct: 4.8, drop: "-53%", c: "var(--amber)" },
          ].map((s, i) => (
            <div key={i} style={{ position: "relative", padding: 16, background: `${s.c}10`, borderRadius: 10, border: `1px solid ${s.c}22`, textAlign: "center" }}>
              <div className="sh-eyebrow" style={{ color: s.c, marginBottom: 8, fontSize: 10 }}>{s.l}</div>
              <div className="sh-num" style={{ fontSize: 26, fontWeight: 500, color: "var(--ink)" }}>{s.v}</div>
              <div className="sh-num" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>{s.pct}%</div>
              {s.drop && (
                <Chip tone="terra" style={{ marginTop: 10, fontFamily: "var(--f-mono)" }}>{s.drop}</Chip>
              )}
              <div style={{ height: 4, background: "var(--line-soft)", borderRadius: 99, marginTop: 12, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${s.pct}%`, background: s.c, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cohort heatmap */}
      <Card padded={false} style={{ padding: 28, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Retensi cohort</div>
            <h3 className="sh-h-4">Petani yang masih aktif setelah daftar</h3>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 11, color: "var(--ink-4)" }}>
            <span>0%</span>
            <div style={{ width: 120, height: 10, borderRadius: 3, background: "linear-gradient(90deg, var(--cream), var(--forest-3), var(--forest))" }} />
            <span>100%</span>
          </div>
        </div>
        <CohortGrid />
      </Card>

      {/* Bottom — DAU and Top features */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— DAU / WAU / MAU</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Stickiness 14d · 38,2%</h3>
          <DauChart />
        </Card>
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Top fitur dipakai</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Mei 2026</h3>
          {[
            { l: "Catat panen", n: "84.2k", pct: 92 },
            { l: "Laporan keuangan", n: "62.4k", pct: 68 },
            { l: "Catat biaya rawat", n: "48.1k", pct: 53 },
            { l: "Cek harga TBS", n: "42.8k", pct: 47 },
            { l: "Kalkulator pupuk", n: "18.4k", pct: 20 },
            { l: "Jadwal pengingat", n: "12.6k", pct: 14 },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{f.l}</span>
                <span className="sh-num" style={{ fontSize: 12, color: "var(--ink-3)" }}>{f.n}</span>
              </div>
              <div className="sh-progress" style={{ height: 5 }}>
                <i style={{ width: `${f.pct}%`, background: i === 0 ? "var(--amber)" : "var(--forest)" }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AdminShell>
  );
}

function CohortGrid() {
  const cohorts = [
    { m: "Nov 2025", size: 1240, vals: [100, 78, 64, 58, 52, 48, 46] },
    { m: "Des 2025", size: 1480, vals: [100, 82, 68, 62, 56, 52] },
    { m: "Jan 2026", size: 1820, vals: [100, 84, 72, 64, 58] },
    { m: "Feb 2026", size: 2104, vals: [100, 86, 74, 68] },
    { m: "Mar 2026", size: 2384, vals: [100, 88, 76] },
    { m: "Apr 2026", size: 2628, vals: [100, 90] },
    { m: "Mei 2026", size: 2842, vals: [100] },
  ];

  const colorFor = (v) => {
    if (v === null || v === undefined) return "transparent";
    if (v >= 90) return "var(--forest)";
    if (v >= 75) return "var(--forest-3)";
    if (v >= 60) return "#6B9476";
    if (v >= 45) return "#A4BAA9";
    if (v >= 30) return "#D6DEC7";
    return "var(--cream-2)";
  };
  const textColor = (v) => (v >= 60 ? "var(--paper)" : "var(--ink-2)");

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "140px 80px repeat(7, 1fr)", gap: 6, fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--f-mono)", marginBottom: 8 }}>
        <div>Cohort</div>
        <div style={{ textAlign: "right" }}>Size</div>
        {["M0", "M1", "M2", "M3", "M4", "M5", "M6"].map(m => <div key={m} style={{ textAlign: "center", fontWeight: 600, color: "var(--ink-3)" }}>{m}</div>)}
      </div>
      {cohorts.map((c, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 80px repeat(7, 1fr)", gap: 6, marginBottom: 6, alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 500, fontFamily: "var(--f-mono)" }}>{c.m}</div>
          <div className="sh-num" style={{ fontSize: 12, color: "var(--ink-4)", textAlign: "right" }}>{c.size.toLocaleString("id-ID")}</div>
          {Array.from({ length: 7 }).map((_, j) => {
            const v = c.vals[j];
            return (
              <div key={j} style={{
                height: 32, borderRadius: 5,
                background: colorFor(v),
                color: textColor(v),
                display: "grid", placeItems: "center",
                fontSize: 11, fontWeight: 600, fontFamily: "var(--f-mono)",
                border: v === undefined ? "1px dashed var(--line)" : "1px solid transparent",
              }}>
                {v !== undefined ? `${v}%` : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function DauChart() {
  const days = 30;
  const dau = Array.from({ length: days }, (_, i) => 2800 + Math.sin(i / 2) * 600 + i * 30 + (Math.random() * 200));
  const wau = Array.from({ length: days }, (_, i) => 5800 + Math.sin(i / 3) * 400 + i * 60);
  const mau = Array.from({ length: days }, (_, i) => 8400 + i * 90);
  const max = 12000;
  const w = 700, h = 220, padL = 40, padR = 12, padT = 12, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const stepX = innerW / (days - 1);
  const line = (data) => data.map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX} ${padT + innerH - (v / max) * innerH}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {[0, 4000, 8000, 12000].map((y, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={padT + innerH - (y / max) * innerH} y2={padT + innerH - (y / max) * innerH} stroke="var(--line-2)" />
          <text x={padL - 8} y={padT + innerH - (y / max) * innerH + 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--ink-4)">{y / 1000}k</text>
        </g>
      ))}
      <defs>
        <linearGradient id="maugrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line(mau)} L ${padL + (days - 1) * stepX} ${padT + innerH} L ${padL} ${padT + innerH} Z`} fill="url(#maugrad)" />
      <path d={line(mau)} stroke="var(--amber)" strokeWidth="1.8" fill="none" />
      <path d={line(wau)} stroke="var(--forest-3)" strokeWidth="1.8" fill="none" />
      <path d={line(dau)} stroke="var(--forest)" strokeWidth="2.2" fill="none" />
      <text x={padL + (days - 1) * stepX - 4} y={padT + innerH - (mau[days - 1] / max) * innerH - 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--amber-2)">MAU 11.1k</text>
      <text x={padL + (days - 1) * stepX - 4} y={padT + innerH - (wau[days - 1] / max) * innerH - 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--forest-3)">WAU 7.4k</text>
      <text x={padL + (days - 1) * stepX - 4} y={padT + innerH - (dau[days - 1] / max) * innerH - 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--forest)">DAU 4.2k</text>
    </svg>
  );
}

window.AdminAnalyticsPage = AdminAnalyticsPage;
