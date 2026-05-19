/* global React, SH */
const { SawitLogo, PalmLeaf, SunRays, Card, Sparkline, Btn, Chip, Ring, I } = window.SH;

function MobileDashboard() {
  return (
    <div className="sh-page" style={{ width: 390, height: 844, background: "var(--cream)", position: "relative", overflow: "hidden", borderRadius: 0 }}>
      <div className="sh-grain" />

      {/* Status bar */}
      <div style={{ height: 44, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, fontWeight: 600, position: "relative", zIndex: 2 }}>
        <span className="sh-num">9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11 }}>●●●●</span>
          <span style={{ fontSize: 11 }}>📶</span>
          <span style={{ fontSize: 11 }}>🔋</span>
        </div>
      </div>

      <div style={{ height: 800, overflow: "hidden", position: "relative" }}>
        {/* Header */}
        <div style={{ padding: "12px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="sh-eyebrow" style={{ fontSize: 10 }}>Kam, 16 Mei 2026</div>
            <div style={{ fontSize: 20, fontFamily: "var(--f-display)", fontWeight: 500, marginTop: 2 }}>Selamat pagi, Pak.</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ width: 36, height: 36, borderRadius: 99, background: "var(--paper)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", color: "var(--ink-2)", position: "relative" }}>
              <I.bell size={16} />
              <span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: 99, background: "var(--terracotta)", border: "2px solid var(--paper)" }} />
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: "var(--amber)", color: "var(--forest)", display: "grid", placeItems: "center", fontFamily: "var(--f-display)", fontWeight: 500, fontStyle: "italic", fontSize: 17 }}>
              S
            </div>
          </div>
        </div>

        {/* Hero card — untung bersih */}
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{
            position: "relative",
            padding: 20, borderRadius: 20,
            background: "var(--forest)", color: "var(--paper)",
            overflow: "hidden",
            boxShadow: "var(--sh-card-3)",
          }}>
            <PalmLeaf size={140} style={{ position: "absolute", right: -20, top: -10, color: "var(--paper)", opacity: 0.08 }} />
            <SunRays size={80} style={{ position: "absolute", right: 80, bottom: -10, color: "var(--amber-3)", opacity: 0.18 }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 10, color: "var(--amber-3)", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600 }}>—— Untung bersih · Mei</div>
              <div className="sh-num" style={{ fontSize: 40, fontWeight: 400, color: "var(--paper)", marginTop: 8, lineHeight: 1, letterSpacing: "-0.025em" }}>
                Rp 38,4<span style={{ fontSize: 16, color: "rgba(251,248,241,0.5)" }}>&thinsp;jt</span>
              </div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <Chip tone="amber" style={{ background: "rgba(212, 168, 39, 0.18)", color: "var(--amber-3)", borderColor: "rgba(212, 168, 39, 0.3)" }}>↑ 24,8%</Chip>
                <span style={{ fontSize: 11, color: "rgba(251,248,241,0.65)" }}>vs. April · Rp 30,8 jt</span>
              </div>
              <div style={{ marginTop: 14 }}>
                <Sparkline data={[18, 24, 22, 28, 30, 26, 32, 30, 36, 38]} width={310} height={36} color="var(--amber)" />
              </div>
            </div>
          </div>
        </div>

        {/* Stat row */}
        <div style={{ padding: "0 16px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { l: "Produksi", v: "8,4 ton", delta: "↑12%", color: "var(--forest)", icon: <I.basket /> },
            { l: "Biaya", v: "Rp 17,8 jt", delta: "↓4%", color: "var(--c-terra)", icon: <I.spray /> },
          ].map((s, i) => (
            <Card key={i} padded={false} style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: `${s.color}14`, color: s.color, border: `1px solid ${s.color}22`, display: "grid", placeItems: "center" }}>
                  {React.cloneElement(s.icon, { size: 12 })}
                </span>
                <span className="sh-eyebrow" style={{ fontSize: 10 }}>{s.l}</span>
              </div>
              <div className="sh-num" style={{ fontSize: 18, fontWeight: 500 }}>{s.v}</div>
              <Chip tone={s.delta.startsWith("↑") ? "forest" : "terra"} style={{ marginTop: 6, fontSize: 10 }}>{s.delta}</Chip>
            </Card>
          ))}
        </div>

        {/* TBS price strip */}
        <div style={{ padding: "0 16px 14px" }}>
          <Card padded={false} style={{ padding: 14, display: "flex", alignItems: "center", gap: 14, background: "var(--amber-tint)", borderColor: "var(--amber-soft)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--amber)", color: "#2B1F00", display: "grid", placeItems: "center" }}>
              <I.star size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--amber-2)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 600 }}>Harga TBS Riau hari ini</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                <span className="sh-num" style={{ fontSize: 20, fontWeight: 500 }}>Rp 2.340</span>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>/kg</span>
                <Chip tone="forest" style={{ marginLeft: 4 }}>↑ 4,2%</Chip>
              </div>
            </div>
            <Sparkline data={[2200, 2180, 2220, 2260, 2240, 2300, 2340]} width={60} height={28} color="var(--amber-2)" fill={false} />
          </Card>
        </div>

        {/* Quick actions */}
        <div style={{ padding: "0 16px 14px" }}>
          <div className="sh-eyebrow" style={{ marginBottom: 10, paddingLeft: 4 }}>—— Cepat</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              { l: "Panen", icon: <I.basket />, color: "var(--forest)" },
              { l: "Biaya", icon: <I.spray />, color: "var(--c-terra)" },
              { l: "Jadwal", icon: <I.cal />, color: "var(--amber-2)" },
              { l: "Kalkulator", icon: <I.calc />, color: "var(--c-sky)" },
            ].map((a, i) => (
              <button key={i} style={{
                padding: "12px 6px", borderRadius: 14,
                background: "var(--paper)", border: "1px solid var(--line-2)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                cursor: "pointer",
              }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}14`, color: a.color, border: `1px solid ${a.color}22`, display: "grid", placeItems: "center" }}>
                  {React.cloneElement(a.icon, { size: 16 })}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)" }}>{a.l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming jadwal */}
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingLeft: 4 }}>
            <div className="sh-eyebrow">—— Jadwal besok</div>
            <a style={{ fontSize: 11, color: "var(--forest)", fontWeight: 600 }}>Semua →</a>
          </div>
          <Card padded={false} style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--amber-tint)", color: "var(--amber-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>Jum</div>
                <div className="sh-num" style={{ fontSize: 14, fontWeight: 600, marginTop: -2 }}>17</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Pemupukan Blok A</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>240 pohon · Pak Hadi · pagi</div>
            </div>
            <I.more />
          </Card>
        </div>

        {/* Bottom nav */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "8px 12px 24px", background: "rgba(245, 240, 232, 0.92)", backdropFilter: "blur(10px)", borderTop: "1px solid var(--line-2)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
            {[
              { l: "Ringkasan", icon: <I.home />, active: true },
              { l: "Panen", icon: <I.basket /> },
              { l: "Catat", isCenter: true },
              { l: "Laporan", icon: <I.chart /> },
              { l: "Profil", icon: <I.user /> },
            ].map((it, i) => (
              <button key={i} style={{
                padding: "8px 0", border: 0, background: "transparent",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                cursor: "pointer",
                color: it.active ? "var(--forest)" : "var(--ink-4)",
              }}>
                {it.isCenter ? (
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--forest)", color: "var(--paper)", display: "grid", placeItems: "center", marginTop: -6, boxShadow: "0 4px 12px -2px rgba(45, 90, 61, 0.4)" }}>
                    <I.plus size={22} />
                  </div>
                ) : (
                  React.cloneElement(it.icon, { size: 20 })
                )}
                {!it.isCenter && <span style={{ fontSize: 10, fontWeight: 600 }}>{it.l}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.MobileDashboard = MobileDashboard;
