/* global React, SH, AppShell */
const { Card, Btn, Chip, Sparkline, Ring, I, PalmFrond, PalmLeaf, SoilWaves } = window.SH;

function LaporanKeuanganPage() {
  return (
    <AppShell active="laporan" title="Laporan Keuangan"
      headerActions={
        <>
          <Btn variant="ghost" size="sm" leading={<I.mail size={14} />}>Kirim ke email</Btn>
          <Btn variant="primary" size="sm" leading={<I.download size={14} />}>Unduh PDF</Btn>
        </>
      }
    >
      {/* Editorial header */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <PalmFrond size={240} style={{ position: "absolute", right: 0, top: -40, color: "var(--forest)", opacity: 0.07 }} />
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between" }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Laporan keuangan kebun</div>
            <h1 className="sh-h-2">
              Mei 2026 · <em className="sh-italic" style={{ color: "var(--forest)" }}>untung</em> Rp 38,4 jt.
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 8 }}>
              Disusun otomatis dari 42 panen, 18 catatan biaya, dan 7 jadwal terlaksana. Siap dibagikan ke koperasi atau bank.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid var(--line)", background: "var(--paper)" }}>
              <option>Mei 2026</option>
            </select>
            <select style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid var(--line)", background: "var(--paper)" }}>
              <option>Semua kebun</option>
            </select>
            <Btn variant="ghost" size="sm">Bandingkan periode</Btn>
          </div>
        </div>
      </div>

      {/* Hero KPIs editorial */}
      <Card padded={false} style={{ padding: 0, marginBottom: 22, overflow: "hidden", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr" }}>
          <div style={{ padding: 32, background: "var(--forest)", color: "var(--paper)", position: "relative", overflow: "hidden" }}>
            <SoilWaves width={400} height={80} style={{ position: "absolute", left: 0, bottom: 0, color: "var(--amber)", opacity: 0.18 }} />
            <PalmLeaf size={140} style={{ position: "absolute", right: -20, top: -20, color: "var(--paper)", opacity: 0.08 }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, color: "var(--amber-3)", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600 }}>—— Untung Bersih</div>
              <div className="sh-num" style={{ fontSize: 56, fontWeight: 400, color: "var(--paper)", marginTop: 14, lineHeight: 1, letterSpacing: "-0.025em" }}>
                Rp 38,4<span style={{ fontSize: 22, color: "rgba(251,248,241,0.5)" }}>&thinsp;jt</span>
              </div>
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <Chip tone="amber" style={{ background: "rgba(212, 168, 39, 0.18)", color: "var(--amber-3)", borderColor: "rgba(212, 168, 39, 0.3)" }}>↑ 24,8%</Chip>
                <span style={{ fontSize: 12, color: "rgba(251,248,241,0.65)" }}>vs. April 2026 · Rp 30,8 jt</span>
              </div>
              <div style={{ marginTop: 24 }}>
                <Sparkline data={[18, 24, 22, 28, 30, 26, 32, 30, 36, 38]} width={320} height={50} color="var(--amber)" />
              </div>
            </div>
          </div>
          {[
            { l: "Pendapatan kotor", v: "Rp 56,2 jt", sub: "42 panen · 24,1 ton TBS", delta: "↑ 18,2%", color: "var(--forest)" },
            { l: "Total biaya", v: "Rp 17,8 jt", sub: "Bahan + tenaga kerja", delta: "↓ 4,1%", color: "var(--c-terra)" },
            { l: "Margin bersih", v: "68,3%", sub: "Industri rata 56%", delta: "↑ 6,2 pt", color: "var(--amber-2)" },
          ].map((s, i) => (
            <div key={i} style={{ padding: 28, borderLeft: "1px solid var(--line-2)" }}>
              <div className="sh-eyebrow" style={{ marginBottom: 10 }}>{s.l}</div>
              <div className="sh-num" style={{ fontSize: 28, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 6 }}>{s.v}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginBottom: 12 }}>{s.sub}</div>
              <Chip style={{
                background: s.delta.startsWith("↑") ? "var(--forest-soft)" : "var(--terra-soft)",
                color: s.delta.startsWith("↑") ? "var(--forest)" : "var(--terracotta-2)",
                borderColor: "transparent",
              }}>{s.delta}</Chip>
            </div>
          ))}
        </div>
      </Card>

      {/* Main chart + breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22, marginBottom: 22 }}>
        <Card padded={false} style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Arus pendapatan & biaya</div>
              <h3 className="sh-h-4">12 bulan terakhir</h3>
            </div>
            <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
              <LegendDot color="var(--forest)" label="Pendapatan" />
              <LegendDot color="var(--c-terra)" label="Biaya" />
              <LegendDot color="var(--amber)" label="Untung bersih" dashed />
            </div>
          </div>
          <CombinedChart />
        </Card>

        <Card padded={false} style={{ padding: 28 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Komposisi biaya</div>
          <h3 className="sh-h-4" style={{ marginBottom: 22 }}>Mei 2026</h3>

          {/* Donut chart */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22, position: "relative" }}>
            <DonutChart />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { l: "Pupuk & Pestisida", v: "Rp 7,12 jt", pct: 40, color: "var(--forest)" },
              { l: "Upah Tenaga Kerja", v: "Rp 5,34 jt", pct: 30, color: "var(--amber-2)" },
              { l: "Biaya Panen", v: "Rp 2,67 jt", pct: 15, color: "var(--c-terra)" },
              { l: "Transport", v: "Rp 1,78 jt", pct: 10, color: "var(--c-sky)" },
              { l: "Lainnya", v: "Rp 0,89 jt", pct: 5, color: "var(--c-bark)" },
            ].map((c, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: c.color }} />
                    <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{c.l}</span>
                  </div>
                  <span className="sh-num" style={{ fontSize: 13, fontWeight: 500 }}>{c.v}</span>
                </div>
                <div className="sh-progress" style={{ background: "var(--line-soft)" }}>
                  <i style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detail table */}
      <Card padded={false} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line-2)" }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Buku besar Mei 2026</div>
            <h3 className="sh-h-4">42 entri tercatat</h3>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" size="sm" leading={<I.filter size={14} />}>Filter</Btn>
            <Btn variant="ghost" size="sm" leading={<I.search size={14} />}>Cari</Btn>
            <Btn variant="ghost" size="sm" leading={<I.download size={14} />}>Ekspor XLSX</Btn>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--paper-2)" }}>
              {["Tanggal", "Kebun", "Aktivitas", "Berat / Vol", "Harga", "Pendapatan", "Biaya", "Bersih"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: h === "Tanggal" || h === "Kebun" || h === "Aktivitas" ? "left" : "right", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-4)", borderBottom: "1px solid var(--line-2)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { d: "16 Mei", k: "Blok A", act: "Panen TBS", w: "1.420 kg", p: "Rp 2.340", inc: "Rp 3,32 jt", cost: "−Rp 320 rb", net: "Rp 3,00 jt", type: "panen" },
              { d: "15 Mei", k: "Blok B", act: "Pupuk Urea", w: "240 kg", p: "Rp 12.500", inc: "−", cost: "Rp 3,00 jt", net: "−Rp 3,00 jt", type: "biaya" },
              { d: "14 Mei", k: "Blok C", act: "Upah TK Semprot", w: "4 orang", p: "Rp 120 rb", inc: "−", cost: "Rp 480 rb", net: "−Rp 480 rb", type: "biaya" },
              { d: "13 Mei", k: "Blok B", act: "Panen TBS", w: "1.060 kg", p: "Rp 2.300", inc: "Rp 2,44 jt", cost: "−Rp 240 rb", net: "Rp 2,20 jt", type: "panen" },
              { d: "12 Mei", k: "Blok C", act: "Panen TBS", w: "980 kg", p: "Rp 2.300", inc: "Rp 2,25 jt", cost: "−Rp 220 rb", net: "Rp 2,03 jt", type: "panen" },
              { d: "11 Mei", k: "Blok A", act: "Pruning", w: "140 pohon", p: "Rp 8 rb", inc: "−", cost: "Rp 1,12 jt", net: "−Rp 1,12 jt", type: "biaya" },
              { d: "09 Mei", k: "Blok A", act: "Panen TBS", w: "1.180 kg", p: "Rp 2.300", inc: "Rp 2,71 jt", cost: "−Rp 280 rb", net: "Rp 2,43 jt", type: "panen" },
            ].map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--line-2)" }}>
                <td style={{ padding: "14px 20px", fontSize: 13, fontFamily: "var(--f-mono)", color: "var(--ink-3)" }}>{r.d}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--ink-2)" }}>{r.k}</td>
                <td style={{ padding: "14px 20px", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: r.type === "panen" ? "var(--forest-soft)" : "var(--terra-soft)",
                      color: r.type === "panen" ? "var(--forest)" : "var(--terracotta-2)",
                      display: "grid", placeItems: "center",
                    }}>
                      {r.type === "panen" ? <I.basket size={12} /> : <I.spray size={12} />}
                    </span>
                    <span style={{ fontWeight: 500 }}>{r.act}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, fontFamily: "var(--f-mono)", textAlign: "right", color: "var(--ink-3)" }}>{r.w}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, fontFamily: "var(--f-mono)", textAlign: "right", color: "var(--ink-3)" }}>{r.p}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, fontFamily: "var(--f-mono)", textAlign: "right", color: "var(--forest)", fontWeight: r.inc === "−" ? 400 : 500 }}>{r.inc}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, fontFamily: "var(--f-mono)", textAlign: "right", color: "var(--terracotta-2)" }}>{r.cost}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, fontFamily: "var(--f-mono)", fontWeight: 600, textAlign: "right", color: r.net.startsWith("−") ? "var(--terracotta-2)" : "var(--forest)" }}>{r.net}</td>
              </tr>
            ))}
            <tr style={{ background: "var(--forest-tint)" }}>
              <td colSpan={5} style={{ padding: "14px 20px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--forest)" }}>Total Mei 2026 (sampel 7 entri)</td>
              <td style={{ padding: "14px 20px", fontSize: 14, fontFamily: "var(--f-mono)", textAlign: "right", color: "var(--forest)", fontWeight: 600 }}>Rp 10,72 jt</td>
              <td style={{ padding: "14px 20px", fontSize: 14, fontFamily: "var(--f-mono)", textAlign: "right", color: "var(--terracotta-2)", fontWeight: 600 }}>Rp 5,44 jt</td>
              <td style={{ padding: "14px 20px", fontSize: 14, fontFamily: "var(--f-mono)", textAlign: "right", color: "var(--forest)", fontWeight: 600 }}>Rp 5,28 jt</td>
            </tr>
          </tbody>
        </table>

        <div style={{ padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line-2)" }}>
          <div style={{ fontSize: 12, color: "var(--ink-4)" }}>Menampilkan 7 dari 42 entri</div>
          <div style={{ display: "flex", gap: 4 }}>
            {["←", "1", "2", "3", "4", "5", "6", "→"].map((p, i) => (
              <button key={i} style={{
                width: 28, height: 28, borderRadius: 6, border: "1px solid var(--line)",
                background: p === "1" ? "var(--ink)" : "var(--paper)",
                color: p === "1" ? "var(--paper)" : "var(--ink-3)",
                fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </AppShell>
  );
}

function LegendDot({ color, label, dashed }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 12, height: dashed ? 0 : 8, borderTop: dashed ? `2px dashed ${color}` : `2px solid ${color}`, background: dashed ? "transparent" : color, borderRadius: dashed ? 0 : 99 }} />
      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{label}</span>
    </div>
  );
}

function CombinedChart() {
  const months = ["Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des", "Jan", "Feb", "Mar", "Apr", "Mei"];
  const income = [38, 42, 46, 44, 50, 54, 48, 52, 58, 50, 52, 56];
  const cost = [16, 17, 19, 18, 19, 21, 18, 19, 22, 18, 19, 18];
  const net = income.map((v, i) => v - cost[i]);

  const max = 60;
  const chartH = 260;
  const chartW = 700;
  const padL = 36;
  const padR = 20;
  const padT = 20;
  const padB = 36;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const stepX = innerW / (months.length - 1);

  const linePath = (data) => data.map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX} ${padT + innerH - (v / max) * innerH}`).join(" ");

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height={chartH}>
        {/* Y grid */}
        {[0, 20, 40, 60].map((y, i) => (
          <g key={i}>
            <line x1={padL} x2={chartW - padR} y1={padT + innerH - (y / max) * innerH} y2={padT + innerH - (y / max) * innerH} stroke="var(--line-2)" />
            <text x={padL - 8} y={padT + innerH - (y / max) * innerH + 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--ink-4)">{y}jt</text>
          </g>
        ))}
        {/* Bars: income */}
        {income.map((v, i) => (
          <rect key={`i${i}`} x={padL + i * stepX - 14} y={padT + innerH - (v / max) * innerH} width={12} height={(v / max) * innerH}
                fill="var(--forest)" opacity="0.85" rx="2" />
        ))}
        {/* Bars: cost */}
        {cost.map((v, i) => (
          <rect key={`c${i}`} x={padL + i * stepX + 2} y={padT + innerH - (v / max) * innerH} width={12} height={(v / max) * innerH}
                fill="var(--c-terra)" opacity="0.7" rx="2" />
        ))}
        {/* Net line */}
        <path d={linePath(net)} stroke="var(--amber)" strokeWidth="2.4" fill="none" strokeDasharray="6 3" strokeLinecap="round" />
        {net.map((v, i) => (
          <g key={`p${i}`}>
            <circle cx={padL + i * stepX} cy={padT + innerH - (v / max) * innerH} r="4" fill="var(--paper)" stroke="var(--amber)" strokeWidth="2" />
          </g>
        ))}
        {/* X labels */}
        {months.map((m, i) => (
          <text key={i} x={padL + i * stepX} y={chartH - 14} fontSize="11" textAnchor="middle" fontFamily="var(--f-mono)" fill="var(--ink-4)">{m}</text>
        ))}
        {/* Annotation on last point */}
        <g>
          <rect x={padL + 11 * stepX - 32} y={padT + innerH - (net[11] / max) * innerH - 28} width="64" height="20" rx="4" fill="var(--ink)" />
          <text x={padL + 11 * stepX} y={padT + innerH - (net[11] / max) * innerH - 14} fontSize="11" textAnchor="middle" fontFamily="var(--f-mono)" fill="var(--paper)">Rp 38,4jt</text>
        </g>
      </svg>
    </div>
  );
}

function DonutChart() {
  const data = [
    { v: 40, color: "var(--forest)" },
    { v: 30, color: "var(--amber-2)" },
    { v: 15, color: "var(--c-terra)" },
    { v: 10, color: "var(--c-sky)" },
    { v: 5, color: "var(--c-bark)" },
  ];
  const r = 76;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: "relative", width: 200, height: 200 }}>
      <svg width={200} height={200}>
        <circle cx={100} cy={100} r={r} fill="none" stroke="var(--line-soft)" strokeWidth="14" />
        {data.map((d, i) => {
          const dash = (d.v / 100) * c;
          const el = <circle key={i} cx={100} cy={100} r={r} fill="none" stroke={d.color} strokeWidth="14"
                          strokeDasharray={`${dash} ${c}`} strokeDashoffset={-offset} transform="rotate(-90 100 100)" strokeLinecap="butt" />;
          offset += dash;
          return el;
        })}
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        textAlign: "center", pointerEvents: "none",
      }}>
        <div style={{ maxWidth: 120 }}>
          <div className="sh-eyebrow" style={{ fontSize: 9, marginBottom: 4 }}>Total</div>
          <div className="sh-num" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1, whiteSpace: "nowrap" }}>Rp&nbsp;17,8<span style={{ fontSize: 12, color: "var(--ink-4)" }}>&thinsp;jt</span></div>
          <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4 }}>5 kategori</div>
        </div>
      </div>
    </div>
  );
}

window.LaporanKeuanganPage = LaporanKeuanganPage;
