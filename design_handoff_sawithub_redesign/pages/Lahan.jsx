/* global React, SH, AppShell */
const { Card, Btn, Chip, Sparkline, Ring, I, PalmLeaf, PalmFrond } = window.SH;

function LahanPage() {
  const kebuns = [
    { name: "Blok A — Sungai Hitam", code: "BA-01", ha: 4.2, trees: 588, planted: 2017, age: 9, status: "Produktif", health: 92, color: "var(--forest)", lastHarvest: "15 Mei", totalRev: "Rp 142,4 jt", trend: [3, 4, 3.6, 4.8, 5.2, 4.6, 5.8, 6.2, 5.4, 6.8] },
    { name: "Blok B — Bukit Damai", code: "BB-02", ha: 3.5, trees: 490, planted: 2019, age: 7, status: "Produktif", health: 78, color: "var(--forest-3)", lastHarvest: "13 Mei", totalRev: "Rp 98,7 jt", trend: [2.4, 3, 2.8, 3.4, 3.2, 3.8, 4.2, 4, 4.4, 4.8] },
    { name: "Blok C — Tanjung Asem", code: "BC-03", ha: 3.7, trees: 518, planted: 2021, age: 5, status: "Muda", health: 54, color: "var(--amber-2)", lastHarvest: "11 Mei", totalRev: "Rp 64,2 jt", trend: [1.2, 1.4, 1.8, 1.6, 2.2, 2, 2.4, 2.6, 2.8, 3.2] },
  ];

  return (
    <AppShell active="lahan" title="Lahan & Kebun">
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 28, position: "relative" }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— 3 kebun · 11,4 hektar total</div>
          <h1 className="sh-h-2">
            Setiap blok punya <em className="sh-italic" style={{ color: "var(--forest)" }}>cerita&nbsp;sendiri</em>.
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 8 }}>
            Catat luas, jumlah pohon, tahun tanam, dan lokasi setiap blok agar laporan per-hektare akurat.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" size="sm" leading={<I.filter size={14} />}>Filter</Btn>
          <Btn variant="ghost" size="sm" leading={<I.download size={14} />}>Ekspor</Btn>
          <Btn variant="primary" size="sm" leading={<I.plus size={14} />}>Tambah Kebun</Btn>
        </div>
      </div>

      {/* Summary band */}
      <Card padded={false} style={{ padding: "20px 28px", marginBottom: 22, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, alignItems: "center", position: "relative", overflow: "hidden" }}>
        <PalmLeaf size={120} style={{ position: "absolute", right: -10, top: -20, color: "var(--forest)", opacity: 0.08 }} />
        {[
          { l: "Luas total", v: "11,4 ha", sub: "3 blok aktif" },
          { l: "Total pohon", v: "1.596", sub: "umur rata 7 thn" },
          { l: "Produksi YTD", v: "32,4 ton", sub: "5 bulan pertama" },
          { l: "Pendapatan YTD", v: "Rp 305,3 jt", sub: "Margin 64%" },
          { l: "Skor kesehatan", v: <Ring pct={75} label="75" size={48} strokeWidth={5} />, sub: "rata-rata kebun" },
        ].map((s, i) => (
          <div key={i} style={{ borderLeft: i > 0 ? "1px solid var(--line-2)" : 0, paddingLeft: i > 0 ? 24 : 0 }}>
            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>{s.l}</div>
            <div className="sh-num" style={{ fontSize: 22, fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "var(--ink-4)" }}>{s.sub}</div>
          </div>
        ))}
      </Card>

      {/* Map + list combo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Map */}
        <Card padded={false} style={{ padding: 0, overflow: "hidden", position: "relative", minHeight: 600 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #DDE5C7 0%, #C6CFAE 70%, #A8B58A 100%)" }}>
            {/* Topographic grain */}
            <svg width="100%" height="100%" viewBox="0 0 600 600" style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
              <defs>
                <pattern id="topo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M0 30 Q 15 22 30 30 T 60 30" stroke="rgba(45, 60, 30, 0.18)" strokeWidth="0.8" fill="none" />
                  <path d="M0 45 Q 15 38 30 45 T 60 45" stroke="rgba(45, 60, 30, 0.14)" strokeWidth="0.8" fill="none" />
                  <path d="M0 15 Q 15 8 30 15 T 60 15" stroke="rgba(45, 60, 30, 0.14)" strokeWidth="0.8" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#topo)" />
              {/* River */}
              <path d="M 0 380 C 100 360, 200 410, 320 380 S 540 340, 600 360" stroke="#5E8AA8" strokeWidth="6" fill="none" opacity="0.7" />
              <path d="M 0 380 C 100 360, 200 410, 320 380 S 540 340, 600 360" stroke="#7CA8C2" strokeWidth="2" fill="none" />
              {/* Road */}
              <path d="M 60 600 L 180 400 L 280 280 L 420 200 L 600 80" stroke="#8A7548" strokeWidth="3" strokeDasharray="6 5" fill="none" opacity="0.6" />

              {/* Block A */}
              <g>
                <path d="M 60 80 L 220 60 L 240 200 L 80 220 Z" fill="rgba(45, 90, 61, 0.35)" stroke="var(--forest)" strokeWidth="2" />
                <text x="150" y="150" textAnchor="middle" fontFamily="Fraunces" fontSize="18" fontWeight="500" fill="var(--forest)" fontStyle="italic">A</text>
              </g>
              {/* Block B */}
              <g>
                <path d="M 280 240 L 460 220 L 480 360 L 300 380 Z" fill="rgba(45, 90, 61, 0.3)" stroke="var(--forest-3)" strokeWidth="2" />
                <text x="380" y="310" textAnchor="middle" fontFamily="Fraunces" fontSize="18" fontWeight="500" fill="var(--forest)" fontStyle="italic">B</text>
              </g>
              {/* Block C */}
              <g>
                <path d="M 360 460 L 540 440 L 560 560 L 380 580 Z" fill="rgba(212, 168, 39, 0.28)" stroke="var(--amber-2)" strokeWidth="2" />
                <text x="460" y="520" textAnchor="middle" fontFamily="Fraunces" fontSize="18" fontWeight="500" fill="var(--amber-2)" fontStyle="italic">C</text>
              </g>
            </svg>

            {/* Map overlay UI */}
            <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["Satellite", "Topografi", "Hybrid"].map((l, i) => (
                  <button key={l} style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: 0,
                    background: i === 1 ? "var(--ink)" : "rgba(255, 255, 255, 0.9)",
                    color: i === 1 ? "var(--paper)" : "var(--ink-2)",
                  }}>{l}</button>
                ))}
              </div>
              <Chip tone="forest" style={{ background: "rgba(255,255,255,0.95)", borderColor: "var(--line)" }}>
                Pekanbaru · Riau
              </Chip>
            </div>

            <div style={{ position: "absolute", bottom: 16, left: 16, padding: 12, background: "rgba(255,255,255,0.95)", borderRadius: 10, border: "1px solid var(--line)" }}>
              <div className="sh-eyebrow" style={{ marginBottom: 8 }}>Legenda</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[["A — Produktif", "var(--forest)"], ["B — Produktif", "var(--forest-3)"], ["C — Muda", "var(--amber-2)"]].map(([l, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                    <span style={{ width: 12, height: 12, background: c, borderRadius: 3, border: `1px solid ${c}` }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", flexDirection: "column", gap: 4 }}>
              {["+", "−"].map(s => (
                <button key={s} style={{ width: 36, height: 36, borderRadius: 8, background: "var(--paper)", border: "1px solid var(--line)", fontSize: 16, fontWeight: 500, cursor: "pointer", color: "var(--ink)" }}>{s}</button>
              ))}
            </div>
          </div>
        </Card>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {kebuns.map((k, i) => (
            <Card key={i} className="sh-lift" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
              <PalmLeaf size={80} style={{ position: "absolute", right: 0, top: -10, color: k.color, opacity: 0.08 }} />
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <Ring pct={k.health} color={k.color} size={56} label={String(k.health)} strokeWidth={5} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 500, fontFamily: "var(--f-display)" }}>{k.name}</h3>
                    <Chip>{k.code}</Chip>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
                    Ditanam {k.planted} · umur {k.age} tahun · {k.status}
                  </div>
                </div>
                <Btn variant="ghost" size="sm">Detail →</Btn>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, paddingTop: 16, borderTop: "1px solid var(--line-2)" }}>
                {[
                  { l: "Luas", v: `${k.ha} ha` },
                  { l: "Pohon", v: k.trees.toLocaleString("id-ID") },
                  { l: "Panen terakhir", v: k.lastHarvest },
                  { l: "Pendapatan YTD", v: k.totalRev },
                ].map((s, j) => (
                  <div key={j}>
                    <div className="sh-eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{s.l}</div>
                    <div className="sh-num" style={{ fontSize: 15, fontWeight: 500 }}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <Sparkline data={k.trend} width={180} height={32} color={k.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--ink-4)", marginBottom: 4 }}>Produksi 10 minggu</div>
                  <div className="sh-progress amber" style={{ height: 4 }}>
                    <i style={{ width: `${k.health}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Add card */}
          <button style={{
            padding: 22, borderRadius: 14, border: "1.5px dashed var(--line)",
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--forest-soft)", color: "var(--forest)", display: "grid", placeItems: "center" }}>
              <I.plus />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Tambah Blok baru</div>
              <div style={{ fontSize: 12, color: "var(--ink-4)" }}>Catat luas, pohon, dan tahun tanam</div>
            </div>
          </button>
        </div>
      </div>
    </AppShell>
  );
}

window.LahanPage = LahanPage;
