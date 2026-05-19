/* global React, SH, AdminShell */
const { Card, Btn, Chip, Sparkline, Ring, I } = window.SH;

function AdminMonitoringPage() {
  return (
    <AdminShell active="monitoring"
      headerActions={
        <>
          <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>● All systems operational</Chip>
          <Btn variant="ghost" size="sm">Statuspage publik →</Btn>
        </>
      }
    >
      <div style={{ marginBottom: 24 }}>
        <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— System monitoring · Live</div>
        <h1 className="sh-h-2">
          Uptime <em className="sh-italic" style={{ color: "var(--forest)" }}>99,98%</em> · semua layanan sehat.
        </h1>
      </div>

      {/* Service grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { n: "core-api", st: "ok", lat: 98, traffic: "12.4k rpm", trend: [90, 92, 88, 94, 96, 98, 95, 98, 100, 98] },
          { n: "auth-api", st: "ok", lat: 32, traffic: "4.2k rpm", trend: [30, 32, 28, 34, 32, 30, 32, 31, 33, 32] },
          { n: "billing", st: "warn", lat: 412, traffic: "284 rpm", trend: [180, 220, 240, 280, 320, 380, 412, 410, 400, 412] },
          { n: "notif-worker", st: "ok", lat: 48, traffic: "2.1k/min", trend: [45, 48, 50, 48, 46, 48, 50, 48, 47, 48] },
          { n: "db-primary", st: "ok", lat: 32, traffic: "84k qpm", trend: [30, 32, 31, 33, 32, 32, 32, 31, 33, 32] },
          { n: "db-replica", st: "ok", lat: 38, traffic: "180k qpm", trend: [36, 38, 37, 39, 38, 38, 38, 37, 39, 38] },
          { n: "redis-cache", st: "ok", lat: 4, traffic: "18M ops/h", trend: [4, 4, 5, 4, 4, 4, 4, 5, 4, 4] },
          { n: "s3-storage", st: "ok", lat: 84, traffic: "1.2k/min", trend: [80, 82, 84, 86, 84, 82, 84, 85, 84, 84] },
        ].map((s, i) => {
          const c = s.st === "ok" ? "#7BC97B" : s.st === "warn" ? "var(--amber-2)" : "var(--terracotta-2)";
          return (
            <Card key={i} padded={false} style={{ padding: 16, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: c, boxShadow: `0 0 6px ${c}` }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, fontFamily: "var(--f-mono)" }}>{s.n}</span>
                </span>
                <Chip style={{ fontSize: 10, fontFamily: "var(--f-mono)", background: s.st === "ok" ? "var(--forest-soft)" : s.st === "warn" ? "var(--amber-soft)" : "var(--terra-soft)", color: s.st === "ok" ? "var(--forest)" : s.st === "warn" ? "var(--amber-2)" : "var(--terracotta-2)", borderColor: "transparent" }}>
                  {s.st.toUpperCase()}
                </Chip>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 4 }}>
                <div>
                  <div className="sh-num" style={{ fontSize: 22, fontWeight: 500 }}>{s.lat}<span style={{ fontSize: 12, color: "var(--ink-4)" }}>ms</span></div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>p95 · {s.traffic}</div>
                </div>
                <Sparkline data={s.trend} width={68} height={28} color={c} fill={false} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Latency chart */}
      <Card padded={false} style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Request latency · core-api</div>
            <h3 className="sh-h-4">p50, p95, p99 · 6 jam terakhir</h3>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ink-3)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 2, background: "var(--forest)" }} /> p50</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 2, background: "var(--amber)" }} /> p95</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 2, background: "var(--c-terra)" }} /> p99</span>
          </div>
        </div>
        <LatencyChart />
      </Card>

      {/* Incidents */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <Card padded={false} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line-2)" }}>
            <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Incident log · 7 hari</div>
            <h3 className="sh-h-4">3 incident · 0 critical</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--f-mono)" }}>
            <thead>
              <tr style={{ background: "var(--paper-2)" }}>
                {["Started", "Service", "Severity", "Duration", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-4)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ fontSize: 12 }}>
              {[
                { t: "14:08 hari ini", svc: "billing", sev: "warn", dur: "12m", st: "active", stColor: "var(--amber-2)" },
                { t: "11 Mei 03:42", svc: "notif-worker", sev: "warn", dur: "48m", st: "resolved", stColor: "var(--forest)" },
                { t: "9 Mei 22:18", svc: "core-api", sev: "minor", dur: "8m", st: "resolved", stColor: "var(--forest)" },
              ].map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--line-2)" }}>
                  <td style={{ padding: "12px 18px", color: "var(--ink-3)" }}>{r.t}</td>
                  <td style={{ padding: "12px 18px", color: "var(--ink-2)", fontWeight: 600 }}>{r.svc}</td>
                  <td style={{ padding: "12px 18px" }}>
                    <Chip style={{ fontFamily: "var(--f-mono)", background: r.sev === "warn" ? "var(--amber-soft)" : "var(--cream-2)", color: r.sev === "warn" ? "var(--amber-2)" : "var(--ink-3)", borderColor: "transparent" }}>{r.sev}</Chip>
                  </td>
                  <td style={{ padding: "12px 18px", color: "var(--ink-3)" }}>{r.dur}</td>
                  <td style={{ padding: "12px 18px", color: r.stColor, fontWeight: 600 }}>● {r.st}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Infrastruktur</div>
          <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Resource utilization</h3>
          {[
            { l: "CPU avg", v: 42, max: 100, c: "var(--forest)" },
            { l: "Memory", v: 64, max: 100, c: "var(--forest-3)" },
            { l: "Disk node-3", v: 82, max: 100, c: "var(--amber-2)", warn: true },
            { l: "Network out", v: 18, max: 100, c: "var(--c-sky)" },
            { l: "DB connections", v: 48, max: 100, c: "var(--forest)" },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>{r.l}</span>
                <span className="sh-num" style={{ fontSize: 12, color: r.warn ? "var(--amber-2)" : "var(--ink-3)", fontWeight: r.warn ? 600 : 400 }}>
                  {r.v}{r.warn && " ⚠"}
                </span>
              </div>
              <div className="sh-progress" style={{ height: 6 }}>
                <i style={{ width: `${r.v}%`, background: r.c }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AdminShell>
  );
}

function LatencyChart() {
  const points = 36;
  const p50 = Array.from({ length: points }, (_, i) => 80 + Math.sin(i / 3) * 20 + Math.random() * 10);
  const p95 = p50.map(v => v * 2 + Math.random() * 20);
  const p99 = p95.map((v, i) => v * 1.4 + (i === 28 ? 220 : 0));
  const max = 800;
  const w = 1000, h = 240, padL = 36, padR = 20, padT = 16, padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const stepX = innerW / (points - 1);
  const line = (data) => data.map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX} ${padT + innerH - (v / max) * innerH}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {[0, 200, 400, 600, 800].map((y, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={padT + innerH - (y / max) * innerH} y2={padT + innerH - (y / max) * innerH} stroke="var(--line-2)" />
          <text x={padL - 8} y={padT + innerH - (y / max) * innerH + 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--ink-4)">{y}ms</text>
        </g>
      ))}
      <line x1={padL} x2={w - padR} y1={padT + innerH - (300 / max) * innerH} y2={padT + innerH - (300 / max) * innerH} stroke="var(--terracotta)" strokeDasharray="4 3" strokeWidth="1" opacity="0.6" />
      <text x={w - padR - 4} y={padT + innerH - (300 / max) * innerH - 4} fontSize="9" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--terracotta-2)">SLO 300ms</text>
      <path d={line(p99)} stroke="var(--c-terra)" strokeWidth="1.8" fill="none" />
      <path d={line(p95)} stroke="var(--amber)" strokeWidth="1.8" fill="none" />
      <path d={line(p50)} stroke="var(--forest)" strokeWidth="2.2" fill="none" />
    </svg>
  );
}

window.AdminMonitoringPage = AdminMonitoringPage;
