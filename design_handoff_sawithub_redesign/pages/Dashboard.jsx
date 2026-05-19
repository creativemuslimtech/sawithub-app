/* global React, SH */
const { SawitLogo, PalmFrond, PalmLeaf, SunRays, SoilWaves, SeedSprout, Card, Stat, Sparkline, Btn, Chip, Ring, I } = window.SH;

/* Shared app shell (sidebar + topbar) used across signed-in pages */
function AppShell({ active = "dashboard", title, children, contextHint, headerActions }) {
  return (
    <div className="sh-page" style={{ width: 1440, minHeight: 1000, background: "var(--cream)", display: "flex", position: "relative" }}>
      <div className="sh-grain" />
      <AppSidebar active={active} />
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <AppTopbar title={title} contextHint={contextHint} headerActions={headerActions} />
        <div style={{ padding: "28px 36px 56px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function AppSidebar({ active }) {
  const items = [
    { k: "dashboard", icon: <I.home />, label: "Ringkasan" },
    { k: "lahan",     icon: <I.leaf />, label: "Lahan & Kebun" },
    { k: "panen",     icon: <I.basket />, label: "Panen" },
    { k: "perawatan", icon: <I.spray />, label: "Perawatan" },
    { k: "jadwal",    icon: <I.cal />, label: "Jadwal" },
    { k: "pendapatan",icon: <I.money />, label: "Pendapatan" },
    { k: "laporan",   icon: <I.chart />, label: "Laporan Keuangan" },
    { k: "kalkulator",icon: <I.calc />, label: "Kalkulator Pupuk" },
    { k: "harga",     icon: <I.star />, label: "Harga TBS" },
  ];
  return (
    <aside style={{
      width: 256, flexShrink: 0, padding: "24px 16px",
      borderRight: "1px solid var(--line-2)",
      background: "var(--paper)",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <div style={{ padding: "0 8px 20px" }}>
        <SawitLogo size={26} />
      </div>

      {/* Farm switcher */}
      <button style={{
        margin: "0 0 22px",
        padding: "12px 14px", borderRadius: 12,
        background: "var(--cream)", border: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
        textAlign: "left", width: "100%",
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--forest)", color: "var(--paper)", display: "grid", placeItems: "center", fontFamily: "var(--f-display)", fontWeight: 500, fontStyle: "italic" }}>S</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Kebun Suka Maju</div>
          <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 1 }}>3 kebun · 11,4 ha</div>
        </div>
        <span style={{ color: "var(--ink-4)" }}>↕</span>
      </button>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(it => (
          <a key={it.k} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", borderRadius: 10,
            fontSize: 13.5, fontWeight: 500,
            color: active === it.k ? "var(--forest)" : "var(--ink-2)",
            background: active === it.k ? "var(--forest-soft)" : "transparent",
            textDecoration: "none", cursor: "pointer",
            position: "relative",
          }}>
            {active === it.k && (
              <div style={{ position: "absolute", left: -16, top: 8, bottom: 8, width: 3, background: "var(--forest)", borderRadius: "0 2px 2px 0" }} />
            )}
            <span style={{ color: active === it.k ? "var(--forest)" : "var(--ink-4)" }}>{it.icon}</span>
            {it.label}
          </a>
        ))}
      </nav>

      <div style={{ marginTop: "auto" }}>
        <Card style={{ padding: 16, background: "var(--cream)", position: "relative", overflow: "hidden" }}>
          <SeedSprout size={56} color="var(--forest)" opacity={0.18} style={{ position: "absolute", right: -6, bottom: -6 }} />
          <Chip tone="amber" style={{ marginBottom: 8 }}>Trial</Chip>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>Sisa 8 hari uji coba</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 10, lineHeight: 1.5 }}>Lanjutkan ke Petani Pro untuk akses penuh.</div>
          <button style={{ width: "100%", padding: "8px 0", borderRadius: 8, background: "var(--forest)", color: "var(--paper)", fontSize: 12, fontWeight: 600, border: 0, cursor: "pointer" }}>Tingkatkan</button>
        </Card>
        <div style={{ marginTop: 12, padding: "12px 8px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--amber-soft)", color: "var(--amber-2)", display: "grid", placeItems: "center" }}>
            <I.user size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Pak Suparman</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-4)" }}>Pemilik · suparman@…</div>
          </div>
          <I.more />
        </div>
      </div>
    </aside>
  );
}

function AppTopbar({ title, contextHint, headerActions }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 24,
      padding: "18px 36px",
      borderBottom: "1px solid var(--line-2)",
      background: "rgba(245, 240, 232, 0.65)",
      backdropFilter: "blur(10px)",
      position: "sticky", top: 0, zIndex: 5,
    }}>
      {/* Search */}
      <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
        <span style={{ position: "absolute", left: 14, top: 11, color: "var(--ink-4)" }}><I.search size={16} /></span>
        <input className="sh-input" placeholder="Cari kebun, panen, biaya…" style={{
          height: 40, paddingLeft: 40, background: "var(--paper)", border: "1px solid var(--line-2)", fontSize: 13,
        }} />
        <span style={{ position: "absolute", right: 12, top: 11, fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>⌘K</span>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {contextHint}
        <button style={{ width: 40, height: 40, borderRadius: 99, background: "var(--paper)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--ink-2)", position: "relative" }}>
          <I.bell />
          <span style={{ position: "absolute", top: 8, right: 9, width: 8, height: 8, borderRadius: 99, background: "var(--terracotta)", border: "2px solid var(--paper)" }} />
        </button>
        {headerActions || <Btn variant="primary" size="sm" leading={<I.plus size={14} />}>Catat panen</Btn>}
      </div>
    </div>
  );
}

/* ─────────── DASHBOARD ─────────── */
function DashboardPage() {
  return (
    <AppShell active="dashboard" title="Ringkasan"
      contextHint={
        <Chip tone="forest" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--forest)" }} />
          Mei 2026
        </Chip>
      }
    >
      {/* Greeting header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 28, position: "relative" }}>
        <PalmLeaf size={180} style={{ position: "absolute", right: 220, top: -40, color: "var(--forest)", opacity: 0.08, transform: "rotate(20deg)" }} />
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>Selamat pagi, Kamis · 16 Mei 2026</div>
          <h1 className="sh-h-2" style={{ maxWidth: 720 }}>
            Pak Suparman, kebun kamu untung <em className="sh-italic" style={{ color: "var(--forest)" }}>Rp&nbsp;38,4&thinsp;jt</em> bulan ini.
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 8 }}>
            3 jadwal kerja ke depan · Harga TBS hari ini <span className="sh-num" style={{ fontWeight: 500, color: "var(--ink-2)" }}>Rp&nbsp;2.340/kg</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" size="sm" leading={<I.download size={14} />}>Unduh laporan</Btn>
          <Btn variant="amber" size="sm" leading={<I.plus size={14} />}>Catat panen</Btn>
        </div>
      </div>

      {/* Filter row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, padding: 10, background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 16 }}>
        <div style={{ display: "flex", background: "var(--cream)", borderRadius: 10, padding: 3, border: "1px solid var(--line-2)" }}>
          {["Minggu", "Bulan", "Tahun"].map((p, i) => (
            <button key={p} style={{
              padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: 0, cursor: "pointer",
              background: i === 1 ? "var(--forest)" : "transparent",
              color: i === 1 ? "var(--paper)" : "var(--ink-3)",
            }}>{p}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 24, background: "var(--line)" }} />
        <select style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)" }}>
          <option>2026</option>
        </select>
        <select style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)" }}>
          <option>Mei</option>
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--ink-4)" }}>Lihat sebagai:</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["Semua Kebun", "Blok A", "Blok B", "Blok C"].map((b, i) => (
              <button key={b} style={{
                padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                border: "1px solid var(--line)", cursor: "pointer",
                background: i === 0 ? "var(--forest-soft)" : "var(--surface)",
                color: i === 0 ? "var(--forest)" : "var(--ink-3)",
                borderColor: i === 0 ? "rgba(45, 90, 61, .25)" : "var(--line)",
              }}>{b}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <Stat label="Total Produksi" value={<span>8,4 <span style={{ fontSize: 16, color: "var(--ink-4)" }}>ton</span></span>} delta="12,4%" accent="var(--forest)" icon={<I.basket size={16} />} sub="42 panen tercatat" />
        <Stat label="Pendapatan" value="Rp 56,2 jt" delta="18,2%" accent="var(--amber)" icon={<I.money size={16} />} sub="Harga rata Rp 2.290/kg" />
        <Stat label="Total Biaya" value="Rp 17,8 jt" delta="-4,1%" accent="var(--c-terra)" icon={<I.spray size={16} />} sub="Rp 2,1 jt per ton" />
        <Stat label="Untung Bersih" value={<span style={{ color: "var(--forest)" }}>Rp 38,4 jt</span>} delta="24,8%" accent="var(--forest-3)" icon={<I.chart size={16} />} sub="Margin 68,3%" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, marginBottom: 22 }}>
        {/* Performance chart */}
        <Card padded={false} style={{ padding: 24, position: "relative", overflow: "hidden" }}>
          <SunRays size={120} style={{ position: "absolute", right: 24, top: 24, color: "var(--amber)", opacity: 0.06 }} />
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6 }}>Performa kebun</div>
              <h3 className="sh-h-4">Produksi vs. Pendapatan</h3>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["Produksi", "Janjang", "Harga", "Bersih"].map((b, i) => (
                <button key={b} style={{
                  padding: "5px 11px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                  background: i === 0 ? "var(--ink)" : "transparent",
                  color: i === 0 ? "var(--paper)" : "var(--ink-3)",
                  border: 0, cursor: "pointer",
                }}>{b}</button>
              ))}
            </div>
          </div>
          <PerformanceChart />
          <div style={{ display: "flex", gap: 24, marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line-2)" }}>
            <div>
              <div className="sh-eyebrow">Puncak periode</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                <span className="sh-num" style={{ fontSize: 20, fontWeight: 500 }}>1,42</span>
                <span style={{ fontSize: 12, color: "var(--ink-4)" }}>ton · 9 Mei</span>
              </div>
            </div>
            <div style={{ width: 1, background: "var(--line)" }} />
            <div>
              <div className="sh-eyebrow">Rata-rata</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                <span className="sh-num" style={{ fontSize: 20, fontWeight: 500 }}>0,84</span>
                <span style={{ fontSize: 12, color: "var(--ink-4)" }}>ton / panen</span>
              </div>
            </div>
            <div style={{ width: 1, background: "var(--line)" }} />
            <div>
              <div className="sh-eyebrow">Tren</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Chip tone="forest">↑ Naik</Chip>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>3 minggu beruntun</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Per-kebun ranking */}
        <Card padded={false} style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6 }}>Performa per kebun</div>
              <h3 className="sh-h-4">Peringkat bulan ini</h3>
            </div>
            <a style={{ fontSize: 12, color: "var(--forest)", fontWeight: 600, alignSelf: "center" }}>Lihat semua →</a>
          </div>
          {[
            { name: "Blok A — Sungai Hitam", ha: 4.2, score: 92, status: "Bagus", color: "var(--forest)", revenue: "Rp 22,4 jt", per: "Rp 5,3 jt/ha" },
            { name: "Blok B — Bukit Damai", ha: 3.5, score: 78, status: "Bagus", color: "var(--forest-3)", revenue: "Rp 18,1 jt", per: "Rp 5,1 jt/ha" },
            { name: "Blok C — Tanjung Asem", ha: 3.7, score: 54, status: "Cukup", color: "var(--amber-2)", revenue: "Rp 15,7 jt", per: "Rp 4,2 jt/ha" },
          ].map((k, i) => (
            <div key={i} style={{ padding: "14px 0", borderBottom: i < 2 ? "1px solid var(--line-2)" : 0, display: "flex", alignItems: "center", gap: 14 }}>
              <Ring pct={k.score} color={k.color} size={48} label={String(k.score)} strokeWidth={5} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{k.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>{k.ha} ha · {k.status}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="sh-num" style={{ fontSize: 14, fontWeight: 500 }}>{k.revenue}</div>
                <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>{k.per}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Schedule + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 18 }}>
        <Card padded={false} style={{ padding: 24, position: "relative", overflow: "hidden" }}>
          <PalmLeaf size={90} style={{ position: "absolute", right: -10, bottom: -10, color: "var(--amber-2)", opacity: 0.1 }} />
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6, color: "var(--amber-2)" }}>—— Jadwal kerja</div>
              <h3 className="sh-h-4">3 hari ke depan</h3>
            </div>
            <Btn variant="ghost" size="sm">Buka kalender</Btn>
          </div>
          {[
            { date: "Jum, 17 Mei", title: "Pemupukan Blok A", crew: "240 pohon · Pak Hadi", color: "var(--forest)", time: "Besok" },
            { date: "Sab, 18 Mei", title: "Panen TBS · Blok B", crew: "8 orang TK · pagi", color: "var(--amber)" },
            { date: "Sen, 20 Mei", title: "Semprot Gulma", crew: "Round-up 2 dosis", color: "var(--c-terra)" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 2 ? "1px solid var(--line-2)" : 0 }}>
              <div style={{ width: 52, textAlign: "center", paddingTop: 2 }}>
                <div style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.date.split(",")[0]}</div>
                <div className="sh-num" style={{ fontSize: 22, fontWeight: 500, color: "var(--ink)", marginTop: 2 }}>{s.date.split(" ")[1]}</div>
              </div>
              <div style={{ flex: 1, paddingLeft: 14, borderLeft: `3px solid ${s.color}` }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>{s.crew}</div>
                {s.time && <Chip tone="amber" style={{ marginTop: 6 }}>{s.time}</Chip>}
              </div>
            </div>
          ))}
        </Card>

        <Card padded={false} style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Aktivitas terakhir</div>
              <h3 className="sh-h-4">Catatan minggu ini</h3>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ padding: "5px 11px", borderRadius: 8, fontSize: 12, fontWeight: 500, background: "var(--paper-2)", color: "var(--ink-2)", border: "1px solid var(--line)", cursor: "pointer" }}>Semua</button>
              <button style={{ padding: "5px 11px", borderRadius: 8, fontSize: 12, fontWeight: 500, background: "transparent", color: "var(--ink-4)", border: 0, cursor: "pointer" }}>Panen</button>
              <button style={{ padding: "5px 11px", borderRadius: 8, fontSize: 12, fontWeight: 500, background: "transparent", color: "var(--ink-4)", border: 0, cursor: "pointer" }}>Biaya</button>
            </div>
          </div>
          {[
            { type: "panen", icon: <I.basket />, color: "var(--forest)", who: "Pak Suparman", what: "Panen TBS Blok A — 1,42 ton, 86 janjang", when: "2 jam lalu", amount: "+Rp 3,32 jt" },
            { type: "biaya", icon: <I.spray />, color: "var(--c-terra)", who: "Bu Hartini", what: "Pupuk Urea Blok B — 240 kg @ Rp 12.500", when: "Kemarin, 16:24", amount: "−Rp 3,00 jt" },
            { type: "harga", icon: <I.star />, color: "var(--amber-2)", who: "Sistem", what: "Harga TBS Riau naik ke Rp 2.340/kg (↑4,2%)", when: "Kemarin, 09:10", amount: null },
            { type: "panen", icon: <I.basket />, color: "var(--forest)", who: "Pak Hadi", what: "Panen TBS Blok C — 0,98 ton, 62 janjang", when: "12 Mei, 11:45", amount: "+Rp 2,29 jt" },
            { type: "biaya", icon: <I.spray />, color: "var(--c-terra)", who: "Pak Suparman", what: "Upah TK semprot rumput Blok B — 4 orang", when: "10 Mei, 17:32", amount: "−Rp 480 rb" },
          ].map((a, i, arr) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--line-2)" : 0, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}14`, color: a.color, border: `1px solid ${a.color}22`, display: "grid", placeItems: "center" }}>
                {a.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{a.what}</div>
                <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>{a.who} · {a.when}</div>
              </div>
              {a.amount && (
                <div className="sh-num" style={{ fontSize: 13, fontWeight: 500, color: a.amount.startsWith("+") ? "var(--forest)" : "var(--terracotta-2)" }}>
                  {a.amount}
                </div>
              )}
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  );
}

function PerformanceChart() {
  const data = [0.6, 0.78, 0.9, 0.72, 1.1, 0.98, 1.24, 0.86, 1.42, 1.1, 0.94, 1.18, 0.8, 1.04];
  const labels = ["1 Mei", "", "3 Mei", "", "5 Mei", "", "7 Mei", "", "9 Mei", "", "11 Mei", "", "13 Mei", "15 Mei"];
  const max = Math.max(...data);
  return (
    <div style={{ position: "relative", height: 220, padding: "20px 0 30px" }}>
      {/* Y axis grid lines */}
      {[0, 0.4, 0.8, 1.2].map((y, i) => (
        <div key={i} style={{ position: "absolute", left: 28, right: 0, bottom: 30 + (i * 50), height: 1, background: "var(--line-2)" }} />
      ))}
      {[0, 0.4, 0.8, 1.2].map((y, i) => (
        <div key={i} style={{ position: "absolute", left: 0, bottom: 25 + (i * 50), fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>
          {y.toFixed(1)}t
        </div>
      ))}
      {/* Average line */}
      <div style={{ position: "absolute", left: 28, right: 0, bottom: 30 + (0.92 / 1.2 * 150), height: 1, borderTop: "1px dashed var(--amber-2)" }}>
        <span style={{ position: "absolute", right: 0, top: -16, fontSize: 10, fontFamily: "var(--f-mono)", color: "var(--amber-2)" }}>avg 0,92</span>
      </div>
      {/* Bars */}
      <div style={{ position: "absolute", left: 32, right: 8, bottom: 30, top: 20, display: "flex", alignItems: "flex-end", gap: 6 }}>
        {data.map((v, i) => {
          const isPeak = v === max;
          return (
            <div key={i} style={{ flex: 1, position: "relative", height: "100%", display: "flex", alignItems: "flex-end" }}>
              <div style={{
                width: "100%",
                height: `${(v / 1.5) * 100}%`,
                background: isPeak ? "var(--amber)" : "linear-gradient(180deg, var(--forest-3), var(--forest))",
                borderRadius: "5px 5px 0 0",
                position: "relative",
              }} />
              {isPeak && (
                <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", padding: "2px 6px", background: "var(--ink)", color: "var(--paper)", fontSize: 10, fontFamily: "var(--f-mono)", borderRadius: 4, whiteSpace: "nowrap" }}>
                  1,42t
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* X labels */}
      <div style={{ position: "absolute", left: 32, right: 8, bottom: 4, display: "flex", gap: 6 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

window.DashboardPage = DashboardPage;
window.AppShell = AppShell;
