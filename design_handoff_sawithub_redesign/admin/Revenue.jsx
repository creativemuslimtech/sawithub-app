/* global React, SH, AdminShell */
const { Card, Btn, Chip, Sparkline, Ring, I, PalmLeaf, SoilWaves } = window.SH;

function AdminRevenuePage() {
  return (
    <AdminShell active="revenue"
      headerActions={
        <>
          <select className="sh-input" style={{ height: 36, width: "auto", padding: "0 30px 0 12px", fontSize: 12.5 }}>
            <option>Mei 2026</option>
          </select>
          <Btn variant="ghost" size="sm" leading={<I.download size={14} />}>Ekspor CSV</Btn>
          <Btn variant="primary" size="sm">Buka Stripe →</Btn>
        </>
      }
    >
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "end", justifyContent: "space-between" }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Pendapatan langganan · Mei 2026</div>
          <h1 className="sh-h-2">
            MRR <em className="sh-italic" style={{ color: "var(--forest)" }}>Rp&nbsp;142,4&thinsp;jt</em>, naik <em className="sh-italic" style={{ color: "var(--amber-2)" }}>+12%</em> dari April.
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 8, fontFamily: "var(--f-mono)" }}>
            2.184 pelanggan berbayar · ARR Rp 1,71 M · Churn 90d 2,4% · LTV/CAC 4,8×
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["7 hari", "30 hari", "MTD", "QTD", "YTD"].map((p, i) => (
            <button key={p} style={{
              padding: "8px 14px", borderRadius: 99, fontSize: 12.5, fontWeight: 600,
              background: i === 1 ? "var(--ink)" : "var(--paper)",
              color: i === 1 ? "var(--paper)" : "var(--ink-3)",
              border: i === 1 ? 0 : "1px solid var(--line-2)",
              cursor: "pointer", fontFamily: "var(--f-mono)",
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Hero KPI band */}
      <Card padded={false} style={{ padding: 0, marginBottom: 22, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr" }}>
          <div style={{ padding: 28, background: "var(--forest)", color: "var(--paper)", position: "relative", overflow: "hidden" }}>
            <PalmLeaf size={140} style={{ position: "absolute", right: -20, top: -20, color: "var(--paper)", opacity: 0.08 }} />
            <SoilWaves width={400} height={60} style={{ position: "absolute", left: 0, bottom: 0, color: "var(--amber)", opacity: 0.18 }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 10.5, color: "var(--amber-3)", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--f-mono)" }}>—— MRR · Monthly Recurring</div>
              <div className="sh-num" style={{ fontSize: 48, fontWeight: 400, color: "var(--paper)", marginTop: 14, lineHeight: 1, letterSpacing: "-0.025em" }}>
                Rp 142,4<span style={{ fontSize: 18, color: "rgba(251,248,241,0.5)" }}>&thinsp;jt</span>
              </div>
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <Chip tone="amber" style={{ background: "rgba(212, 168, 39, 0.18)", color: "var(--amber-3)", borderColor: "rgba(212, 168, 39, 0.3)" }}>↑ 12,4%</Chip>
                <span style={{ fontSize: 11.5, color: "rgba(251,248,241,0.65)" }}>vs. April · Rp 126,7 jt</span>
              </div>
              <div style={{ marginTop: 18 }}>
                <Sparkline data={[88, 96, 102, 108, 114, 118, 122, 128, 132, 138, 142]} width={300} height={42} color="var(--amber)" />
              </div>
            </div>
          </div>
          {[
            { l: "ARR Projection", v: "Rp 1,71 M", sub: "12 × MRR saat ini", delta: "↑ 24%", c: "var(--forest)" },
            { l: "Pelanggan Berbayar", v: "2.184", sub: "+34 minggu ini", delta: "↑ 1,6%", c: "var(--c-bark)" },
            { l: "ARPU", v: "Rp 65.2k", sub: "rata-rata per user", delta: "↑ 2,1%", c: "var(--amber-2)" },
            { l: "Net Churn 90d", v: "2,4%", sub: "Rp 4,2 jt hilang", delta: "↓ 0,3 pt", c: "var(--forest-3)" },
          ].map((s, i) => (
            <div key={i} style={{ padding: 24, borderLeft: "1px solid var(--line-2)" }}>
              <div className="sh-eyebrow" style={{ marginBottom: 10 }}>{s.l}</div>
              <div className="sh-num" style={{ fontSize: 26, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 6 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginBottom: 10 }}>{s.sub}</div>
              <Chip style={{ background: "var(--forest-soft)", color: "var(--forest)", borderColor: "transparent" }}>{s.delta}</Chip>
            </div>
          ))}
        </div>
      </Card>

      {/* MRR movement chart */}
      <Card padded={false} style={{ padding: 24, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— MRR Movement · 12 bulan</div>
            <h3 className="sh-h-4">New · Expansion · Churn · Contraction</h3>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--ink-3)" }}>
            {[
              { l: "New MRR", c: "var(--forest)" },
              { l: "Expansion", c: "var(--forest-3)" },
              { l: "Churn", c: "var(--c-terra)" },
              { l: "Contraction", c: "var(--amber-2)" },
              { l: "Net MRR", c: "var(--ink)", dashed: true },
            ].map(l => (
              <span key={l.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: l.dashed ? 0 : 8, borderTop: l.dashed ? `2px dashed ${l.c}` : "none", background: l.dashed ? "transparent" : l.c, borderRadius: l.dashed ? 0 : 99 }} />
                {l.l}
              </span>
            ))}
          </div>
        </div>
        <MrrMovementChart />
      </Card>

      {/* Plan mix + Geo */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, marginBottom: 22 }}>
        <Card padded={false} style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Plan mix</div>
              <h3 className="sh-h-4">Distribusi MRR per paket</h3>
            </div>
            <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>2.184 pelanggan</Chip>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { p: "Petani Pro", n: 1842, mrr: 90258000, pct: 63, price: "Rp 49rb/bln", color: "var(--forest)" },
              { p: "Koperasi", n: 342, mrr: 47880000, pct: 34, price: "Rp 1,4 jt/bln · avg", color: "var(--amber)" },
              { p: "Petani", n: 0, mrr: 0, pct: 0, price: "Rp 39rb/bln · belum dirilis", color: "var(--c-bark)", dim: true },
              { p: "Enterprise", n: 0, mrr: 4242000, pct: 3, price: "Custom · 1 kontrak pilot", color: "var(--c-terra)" },
            ].map((r, i) => (
              <div key={i} style={{ opacity: r.dim ? 0.5 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{r.p}</span>
                    <span style={{ fontSize: 11.5, color: "var(--ink-4)", marginLeft: 10, fontFamily: "var(--f-mono)" }}>· {r.price}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span className="sh-num" style={{ fontSize: 11, color: "var(--ink-4)" }}>{r.n.toLocaleString("id-ID")} user</span>
                    <span className="sh-num" style={{ fontSize: 15, fontWeight: 500, minWidth: 110, textAlign: "right" }}>
                      Rp {(r.mrr / 1_000_000).toFixed(1)} jt
                    </span>
                    <span className="sh-num" style={{ fontSize: 11, color: "var(--ink-4)", width: 36, textAlign: "right" }}>{r.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 8, background: "var(--line-soft)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${r.pct}%`, height: "100%", background: r.color, transition: "width .3s" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Annual vs monthly */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line-2)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            {[
              { l: "Bulanan", n: "1.612", v: "Rp 79,0 jt", pct: 74 },
              { l: "Tahunan", n: "572", v: "Rp 63,4 jt", pct: 26, savings: "hemat 2 bln" },
              { l: "Bayar tahun-an", n: "26,2%", v: "MRR", pct: 26, sub: "target 35%" },
            ].map((s, i) => (
              <div key={i} style={{ padding: i > 0 ? "0 0 0 18px" : "0 18px 0 0", borderLeft: i > 0 ? "1px solid var(--line-2)" : 0 }}>
                <div className="sh-eyebrow" style={{ fontSize: 10 }}>{s.l}</div>
                <div className="sh-num" style={{ fontSize: 18, fontWeight: 500, marginTop: 6 }}>{s.n}</div>
                <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>{s.v}{s.savings && <span style={{ color: "var(--amber-2)" }}> · {s.savings}</span>}</div>
                {s.sub && <Chip tone="amber" style={{ marginTop: 6 }}>{s.sub}</Chip>}
              </div>
            ))}
          </div>
        </Card>

        {/* Geo / metode bayar */}
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Metode pembayaran</div>
          <h3 className="sh-h-4" style={{ marginBottom: 22 }}>Distribusi transaksi Mei</h3>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <RevenueDonut />
          </div>

          {[
            { l: "BCA Virtual Account", v: "Rp 58,4 jt", pct: 41, c: "var(--forest)" },
            { l: "GoPay", v: "Rp 32,2 jt", pct: 23, c: "var(--c-sky)" },
            { l: "OVO", v: "Rp 22,8 jt", pct: 16, c: "var(--c-clay)" },
            { l: "DANA", v: "Rp 18,1 jt", pct: 13, c: "var(--amber)" },
            { l: "Kartu kredit", v: "Rp 7,2 jt", pct: 5, c: "var(--c-bark)" },
            { l: "ShopeePay / lainnya", v: "Rp 3,7 jt", pct: 2, c: "var(--ink-4)" },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: i > 0 ? "1px solid var(--line-2)" : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: p.c }} />
                <span style={{ fontSize: 12.5 }}>{p.l}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="sh-num" style={{ fontSize: 12.5, fontWeight: 500 }}>{p.v}</span>
                <span className="sh-num" style={{ fontSize: 11, color: "var(--ink-4)", width: 30, textAlign: "right" }}>{p.pct}%</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Cohort revenue + Top customers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 }}>
        {/* Revenue funnel */}
        <Card padded={false} style={{ padding: 24 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Subscription funnel · Mei</div>
          <h3 className="sh-h-4" style={{ marginBottom: 22 }}>Dari trial ke pelanggan setahun</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { l: "Signup trial", v: 412, pct: 100, c: "var(--forest)" },
              { l: "Aktifkan kartu/VA", v: 248, pct: 60, c: "var(--forest-3)", drop: "-40%" },
              { l: "Bayar pertama", v: 184, pct: 45, c: "var(--c-bark)", drop: "-26%" },
              { l: "Renew bulan ke-2", v: 156, pct: 38, c: "var(--amber-2)", drop: "-15%" },
              { l: "Naik ke tahunan", v: 42, pct: 10, c: "var(--amber)", drop: "-73%" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 140, fontSize: 12.5, color: "var(--ink-2)", fontWeight: 500 }}>{s.l}</div>
                <div style={{ flex: 1, height: 28, background: "var(--line-soft)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                  <div style={{ width: `${s.pct}%`, height: "100%", background: `linear-gradient(90deg, ${s.c}, ${s.c}cc)`, display: "flex", alignItems: "center", paddingLeft: 10 }}>
                    <span className="sh-num" style={{ fontSize: 11, color: "var(--paper)", fontWeight: 600 }}>{s.v}</span>
                  </div>
                </div>
                <div style={{ width: 60, textAlign: "right" }}>
                  {s.drop && <Chip tone="terra" style={{ fontFamily: "var(--f-mono)", fontSize: 10 }}>{s.drop}</Chip>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: 12, background: "var(--amber-tint)", borderRadius: 10, fontSize: 12, color: "var(--ink-3)", display: "flex", gap: 10, alignItems: "start" }}>
            <span style={{ color: "var(--amber-2)" }}><I.star size={14} /></span>
            <div>
              <strong style={{ color: "var(--ink)" }}>Drop terbesar:</strong> aktivasi pembayaran (40%).
              Coba kampanye in-app pada hari ke-7 trial.
            </div>
          </div>
        </Card>

        {/* Top revenue customers */}
        <Card padded={false} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Top revenue customers · YTD</div>
              <h3 className="sh-h-4">10 pelanggan teratas</h3>
            </div>
            <a style={{ fontSize: 12, color: "var(--forest)", fontWeight: 600 }}>Semua →</a>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--paper-2)" }}>
                {["#", "Pelanggan", "Paket", "MRR", "YTD"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: h === "MRR" || h === "YTD" ? "right" : "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { n: "KopSawit Tj. Jabung", plan: "Koperasi", mrr: 8_400_000, ytd: 42_000_000, anggota: 248, color: "var(--forest)" },
                { n: "KopSawit Riau", plan: "Koperasi", mrr: 6_200_000, ytd: 31_000_000, anggota: 184, color: "var(--forest)" },
                { n: "Mitra Sawit Sumut", plan: "Koperasi", mrr: 4_800_000, ytd: 24_000_000, anggota: 142, color: "var(--forest)" },
                { n: "PT Agrindo Pilot", plan: "Enterprise", mrr: 4_242_000, ytd: 16_968_000, anggota: 1, color: "var(--c-terra)" },
                { n: "KKP Tanjung Asem", plan: "Koperasi", mrr: 3_200_000, ytd: 16_000_000, anggota: 96, color: "var(--forest)" },
                { n: "Pak Haji Abdullah", plan: "Pro", mrr: 49_000, ytd: 588_000, anggota: 1, color: "var(--amber)" },
                { n: "Bu Hartini Lubis", plan: "Pro", mrr: 49_000, ytd: 588_000, anggota: 1, color: "var(--amber)" },
                { n: "Pak Suparman H.", plan: "Pro", mrr: 49_000, ytd: 392_000, anggota: 1, color: "var(--amber)" },
              ].map((u, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--line-2)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 11.5, fontFamily: "var(--f-mono)", color: "var(--ink-4)" }}>{i + 1}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{u.n}</div>
                    {u.anggota > 1 && <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 2, fontFamily: "var(--f-mono)" }}>{u.anggota} anggota aktif</div>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Chip style={{ background: `${u.color}14`, color: u.color, borderColor: `${u.color}28` }}>{u.plan}</Chip>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <span className="sh-num" style={{ fontSize: 12.5, fontWeight: 500 }}>
                      Rp {u.mrr >= 1_000_000 ? `${(u.mrr / 1_000_000).toFixed(1)} jt` : `${(u.mrr / 1000).toFixed(0)} rb`}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <span className="sh-num" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                      Rp {u.ytd >= 1_000_000 ? `${(u.ytd / 1_000_000).toFixed(1)} jt` : `${(u.ytd / 1000).toFixed(0)} rb`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card padded={false} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Transaksi terbaru · 24 jam</div>
            <h3 className="sh-h-4">142 transaksi · Rp 6,2 jt</h3>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Semua", "Sukses", "Gagal", "Refund", "Disputed"].map((t, i) => (
              <button key={t} style={{
                padding: "5px 12px", borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                background: i === 0 ? "var(--ink)" : "var(--paper)",
                color: i === 0 ? "var(--paper)" : "var(--ink-3)",
                border: i === 0 ? 0 : "1px solid var(--line-2)",
                fontFamily: "var(--f-mono)",
              }}>{t}</button>
            ))}
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--paper-2)" }}>
              {["Waktu", "Invoice", "Pelanggan", "Paket", "Metode", "Jumlah", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 22px", textAlign: h === "Jumlah" ? "right" : "left", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { t: "14:31:52", inv: "INV-26050-8841", who: "yusran.medan", plan: "Pro · bulanan", method: "BCA VA", amt: 49000, st: "success" },
              { t: "14:08:24", inv: "INV-26050-8840", who: "hartini.kopsawit", plan: "Koperasi · tahunan", method: "Bank transfer", amt: 16800000, st: "success", highlight: true },
              { t: "13:42:18", inv: "INV-26050-8839", who: "ibu.maria.aceh", plan: "Pro · bulanan", method: "OVO", amt: 49000, st: "failed", reason: "insufficient_balance" },
              { t: "13:22:46", inv: "INV-26050-8838", who: "pak.haji.kalbar", plan: "Pro · tahunan", method: "GoPay", amt: 490000, st: "success" },
              { t: "12:48:12", inv: "INV-26050-8837", who: "dewi.koperasi", plan: "Koperasi · bulanan", method: "BCA VA", amt: 1400000, st: "success" },
              { t: "12:14:08", inv: "INV-26050-8836", who: "tani.makmur.lampung", plan: "Pro · bulanan", method: "DANA", amt: 49000, st: "success" },
              { t: "11:32:22", inv: "INV-26050-8835", who: "rina.farmer", plan: "Pro · bulanan", method: "Stripe", amt: 49000, st: "refunded", reason: "cooling-off period" },
              { t: "10:48:42", inv: "INV-26050-8834", who: "agus.tani.jambi", plan: "Pro · tahunan", method: "BCA VA", amt: 490000, st: "success" },
            ].map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--line-2)", background: r.highlight ? "var(--forest-tint)" : "transparent" }}>
                <td style={{ padding: "13px 22px", fontSize: 11.5, fontFamily: "var(--f-mono)", color: "var(--ink-4)" }}>{r.t}</td>
                <td style={{ padding: "13px 22px", fontSize: 11.5, fontFamily: "var(--f-mono)", color: "var(--ink-2)", fontWeight: 600 }}>{r.inv}</td>
                <td style={{ padding: "13px 22px", fontSize: 12.5, fontFamily: "var(--f-mono)", color: "var(--ink-2)" }}>{r.who}</td>
                <td style={{ padding: "13px 22px", fontSize: 12.5, color: "var(--ink-3)" }}>{r.plan}</td>
                <td style={{ padding: "13px 22px", fontSize: 12, color: "var(--ink-3)" }}>{r.method}</td>
                <td style={{ padding: "13px 22px", textAlign: "right", fontFamily: "var(--f-mono)" }}>
                  <span className="sh-num" style={{ fontSize: 13, fontWeight: 600, color: r.st === "failed" ? "var(--ink-5)" : r.st === "refunded" ? "var(--terracotta-2)" : "var(--forest)", textDecoration: r.st === "refunded" || r.st === "failed" ? "line-through" : "none" }}>
                    {r.st === "refunded" && "−"}Rp {r.amt.toLocaleString("id-ID")}
                  </span>
                </td>
                <td style={{ padding: "13px 22px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {r.st === "success" && <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>● paid</Chip>}
                    {r.st === "failed" && <Chip tone="terra" style={{ fontFamily: "var(--f-mono)" }}>● failed</Chip>}
                    {r.st === "refunded" && <Chip style={{ fontFamily: "var(--f-mono)", background: "var(--amber-tint)", color: "var(--amber-2)", borderColor: "transparent" }}>↺ refunded</Chip>}
                    {r.reason && <span style={{ fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>{r.reason}</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line-2)", background: "var(--paper-2)", fontFamily: "var(--f-mono)", fontSize: 11.5 }}>
          <span style={{ color: "var(--ink-4)" }}>Menampilkan 8 dari 142 · settled Rp 6,2 jt · failed Rp 49 rb · refunded Rp 49 rb</span>
          <span style={{ color: "var(--forest)" }}>● Stripe sync · 4 detik lalu</span>
        </div>
      </Card>
    </AdminShell>
  );
}

/* MRR movement: stacked bars + net line */
function MrrMovementChart() {
  const months = ["Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des", "Jan", "Feb", "Mar", "Apr", "Mei"];
  const newMrr =      [4.2, 4.8, 5.4, 5.6, 6.1, 6.8, 7.2, 7.6, 8.1, 8.4, 9.1, 10.2];
  const expansion =   [1.2, 1.6, 1.8, 2.0, 2.4, 2.6, 2.8, 3.1, 3.4, 3.8, 4.2, 4.8];
  const churn =       [-1.8, -2.0, -2.2, -2.1, -2.4, -2.6, -2.8, -2.5, -2.8, -3.0, -2.9, -2.6];
  const contraction = [-0.4, -0.5, -0.6, -0.5, -0.7, -0.8, -0.9, -0.7, -0.8, -1.0, -1.1, -0.7];
  const net = newMrr.map((v, i) => v + expansion[i] + churn[i] + contraction[i]);

  const max = 14, min = -5;
  const range = max - min;
  const w = 1000, h = 280, padL = 40, padR = 16, padT = 16, padB = 32;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const stepX = innerW / months.length;
  const barW = stepX * 0.62;
  const yFor = (v) => padT + innerH - ((v - min) / range) * innerH;
  const zeroY = yFor(0);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {[-4, 0, 4, 8, 12].map((y, i) => (
        <g key={i}>
          <line x1={padL} x2={w - padR} y1={yFor(y)} y2={yFor(y)} stroke={y === 0 ? "var(--line)" : "var(--line-2)"} strokeWidth={y === 0 ? 1.2 : 1} />
          <text x={padL - 8} y={yFor(y) + 4} fontSize="10" textAnchor="end" fontFamily="var(--f-mono)" fill="var(--ink-4)">{y >= 0 ? "+" : ""}{y}jt</text>
        </g>
      ))}

      {months.map((m, i) => {
        const x = padL + i * stepX + (stepX - barW) / 2;
        const newH = (newMrr[i] / range) * innerH;
        const expH = (expansion[i] / range) * innerH;
        const chH = (churn[i] / range) * innerH;
        const ctH = (contraction[i] / range) * innerH;
        return (
          <g key={i}>
            {/* Positive stack from zero up */}
            <rect x={x} y={zeroY - newH} width={barW} height={newH} fill="var(--forest)" rx="2" />
            <rect x={x} y={zeroY - newH - expH} width={barW} height={expH} fill="var(--forest-3)" rx="2" />
            {/* Negative stack from zero down */}
            <rect x={x} y={zeroY} width={barW} height={-chH} fill="var(--c-terra)" rx="2" />
            <rect x={x} y={zeroY - chH} width={barW} height={-ctH} fill="var(--amber-2)" opacity="0.7" rx="2" />
          </g>
        );
      })}

      {/* Net MRR change line */}
      <path d={net.map((v, i) => `${i === 0 ? "M" : "L"} ${padL + i * stepX + stepX / 2} ${yFor(v)}`).join(" ")}
            stroke="var(--ink)" strokeWidth="2.2" fill="none" strokeDasharray="6 3" />
      {net.map((v, i) => <circle key={i} cx={padL + i * stepX + stepX / 2} cy={yFor(v)} r="3.5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />)}

      {/* Last point label */}
      <g>
        <rect x={padL + 11 * stepX + stepX / 2 - 30} y={yFor(net[11]) - 26} width="60" height="20" rx="4" fill="var(--ink)" />
        <text x={padL + 11 * stepX + stepX / 2} y={yFor(net[11]) - 12} fontSize="11" textAnchor="middle" fontFamily="var(--f-mono)" fill="var(--paper)">+{net[11].toFixed(1)}jt</text>
      </g>

      {months.map((m, i) => (
        <text key={i} x={padL + i * stepX + stepX / 2} y={h - 12} fontSize="11" textAnchor="middle" fontFamily="var(--f-mono)" fill="var(--ink-4)">{m}</text>
      ))}
    </svg>
  );
}

function RevenueDonut() {
  const data = [
    { v: 41, color: "var(--forest)" },
    { v: 23, color: "var(--c-sky)" },
    { v: 16, color: "var(--c-clay)" },
    { v: 13, color: "var(--amber)" },
    { v: 5, color: "var(--c-bark)" },
    { v: 2, color: "var(--ink-4)" },
  ];
  const r = 70;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: "relative", width: 200, height: 200 }}>
      <svg width={200} height={200}>
        <circle cx={100} cy={100} r={r} fill="none" stroke="var(--line-soft)" strokeWidth="14" />
        {data.map((d, i) => {
          const dash = (d.v / 100) * c;
          const el = <circle key={i} cx={100} cy={100} r={r} fill="none" stroke={d.color} strokeWidth="14"
                          strokeDasharray={`${dash} ${c}`} strokeDashoffset={-offset} transform="rotate(-90 100 100)" />;
          offset += dash;
          return el;
        })}
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "grid", placeItems: "center",
        textAlign: "center", pointerEvents: "none",
      }}>
        <div style={{ maxWidth: 110 }}>
          <div className="sh-eyebrow" style={{ fontSize: 9, marginBottom: 4 }}>Total Mei</div>
          <div className="sh-num" style={{ fontSize: 17, fontWeight: 500, lineHeight: 1, whiteSpace: "nowrap" }}>Rp&nbsp;142,4<span style={{ fontSize: 11, color: "var(--ink-4)" }}>&thinsp;jt</span></div>
        </div>
      </div>
    </div>
  );
}

window.AdminRevenuePage = AdminRevenuePage;
