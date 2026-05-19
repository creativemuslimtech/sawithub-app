/* global React, SH, AdminShell */
const { Card, Btn, Chip, I } = window.SH;

function AdminDataPage() {
  const collections = [
    { k: "users", l: "users", c: "12.418", color: "var(--forest)", desc: "Akun petani & admin" },
    { k: "lahan", l: "lahan", c: "28.642", color: "var(--c-bark)", desc: "Kebun & blok" },
    { k: "panen", l: "panen", c: "4.218.094", color: "var(--forest-3)", desc: "Catatan TBS" },
    { k: "perawatan", l: "perawatan", c: "1.846.222", color: "var(--c-terra)", desc: "Biaya rawat" },
    { k: "pendapatan", l: "pendapatan", c: "3.842.118", color: "var(--amber)", desc: "Transaksi income" },
    { k: "jadwal", l: "jadwal_perawatan", c: "928.412", color: "var(--c-sky)", desc: "Jadwal kerja" },
    { k: "harga", l: "harga_tbs", c: "184.622", color: "var(--amber-2)", desc: "Histori harga" },
    { k: "audit", l: "audit_log", c: "18.244.812", color: "var(--ink-2)", desc: "System log" },
  ];

  return (
    <AdminShell active="data"
      headerActions={
        <>
          <Btn variant="ghost" size="sm" leading={<I.download size={14} />}>Ekspor query</Btn>
          <Btn variant="primary" size="sm">Buka SQL console</Btn>
        </>
      }
    >
      <div style={{ marginBottom: 24 }}>
        <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Data browser · 8 koleksi · 42,4 jt baris</div>
        <h1 className="sh-h-2">
          Setiap angka di platform <em className="sh-italic" style={{ color: "var(--forest)" }}>punya alamat</em>.
        </h1>
      </div>

      {/* Collection nav */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 18 }}>
        <Card padded={false} style={{ padding: 12, alignSelf: "start" }}>
          <div style={{ padding: "6px 10px", fontSize: 10, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: ".14em", fontFamily: "var(--f-mono)" }}>Koleksi</div>
          {collections.map((c, i) => (
            <a key={c.k} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8,
              fontSize: 12.5, fontWeight: 500, cursor: "pointer",
              background: i === 2 ? "var(--forest-soft)" : "transparent",
              color: i === 2 ? "var(--forest)" : "var(--ink-2)",
              borderLeft: i === 2 ? "3px solid var(--forest)" : "3px solid transparent",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: c.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--f-mono)", flex: 1 }}>{c.l}</span>
              <span className="sh-num" style={{ fontSize: 10.5, color: "var(--ink-4)" }}>{c.c}</span>
            </a>
          ))}
        </Card>

        <div>
          {/* Collection header */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 22, fontWeight: 500, color: "var(--forest)" }}>panen</span>
              <Chip style={{ fontFamily: "var(--f-mono)" }}>4.218.094 baris</Chip>
              <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>v2.1 schema</Chip>
              <Chip style={{ fontFamily: "var(--f-mono)" }}>idx: 8</Chip>
              <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>
                Updated 12s ago · 32 ms p95
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
              Catatan panen TBS — setiap entri merepresentasikan satu kali panen di satu kebun.
            </p>
          </div>

          {/* Query bar */}
          <Card padded={false} style={{ padding: 14, marginBottom: 14, fontFamily: "var(--f-mono)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "var(--forest)", fontWeight: 600 }}>SELECT *</span>
              <span style={{ fontSize: 11, color: "var(--ink-4)" }}>FROM</span>
              <span style={{ fontSize: 11, color: "var(--amber-2)", fontWeight: 600 }}>panen</span>
              <span style={{ fontSize: 11, color: "var(--ink-4)" }}>WHERE</span>
              <input style={{ flex: 1, padding: "5px 10px", fontSize: 11.5, fontFamily: "var(--f-mono)", border: "1px solid var(--line)", borderRadius: 6, background: "var(--paper-2)" }}
                defaultValue='tanggal_panen >= "2026-05-01" AND berat_kg > 1000' />
              <Btn variant="primary" size="sm" style={{ height: 32 }}>Run</Btn>
            </div>
            <div style={{ display: "flex", gap: 6, fontSize: 10.5, color: "var(--ink-4)" }}>
              <span>Sample query:</span>
              {["Top harvests today", "Empty harga_per_kg", "Suspicious berat > 5t", "PII export"].map(q => (
                <button key={q} style={{ padding: "3px 8px", borderRadius: 4, background: "var(--paper-2)", border: "1px solid var(--line-2)", color: "var(--ink-3)", fontSize: 10.5, fontFamily: "var(--f-mono)", cursor: "pointer" }}>
                  {q}
                </button>
              ))}
            </div>
          </Card>

          {/* Schema + data tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {[
              { l: "Data (1.420)", active: true },
              { l: "Schema" },
              { l: "Indexes" },
              { l: "Relations" },
              { l: "Triggers" },
            ].map(t => (
              <button key={t.l} style={{
                padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: t.active ? "var(--ink)" : "var(--paper)",
                color: t.active ? "var(--paper)" : "var(--ink-3)",
                border: t.active ? 0 : "1px solid var(--line-2)",
                fontFamily: "var(--f-mono)",
              }}>{t.l}</button>
            ))}
          </div>

          {/* Data table */}
          <Card padded={false} style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--f-mono)" }}>
              <thead>
                <tr style={{ background: "var(--paper-2)" }}>
                  {[
                    { l: "id_panen", t: "uuid", pk: true },
                    { l: "id_lahan", t: "uuid", fk: true },
                    { l: "user_id", t: "uuid", fk: true },
                    { l: "tanggal_panen", t: "date" },
                    { l: "berat_kg", t: "decimal" },
                    { l: "jumlah_janjang", t: "int" },
                    { l: "harga_per_kg", t: "decimal" },
                    { l: "created_at", t: "timestamp" },
                  ].map(h => (
                    <th key={h.l} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "var(--ink-2)", fontFamily: "var(--f-mono)" }}>
                      <div>
                        {h.pk && <span style={{ color: "var(--amber-2)", fontWeight: 700 }}>🔑 </span>}
                        {h.fk && <span style={{ color: "var(--c-sky)", fontWeight: 700 }}>↳ </span>}
                        {h.l}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--ink-4)", marginTop: 1, fontWeight: 500 }}>{h.t}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontSize: 11.5 }}>
                {[
                  ["pn_a8f3...", "ln_b21e...", "us_4f1a...", "2026-05-16", "1420.00", "86", "2340.00", "2026-05-16 09:24:18"],
                  ["pn_b9e2...", "ln_c84d...", "us_8b3c...", "2026-05-16", "980.00", "62", "2340.00", "2026-05-16 09:18:42"],
                  ["pn_c14f...", "ln_b21e...", "us_4f1a...", "2026-05-15", "1180.00", "72", "2300.00", "2026-05-15 16:48:02"],
                  ["pn_d3a7...", "ln_e92f...", "us_2d8e...", "2026-05-15", "2240.00", "144", "2300.00", "2026-05-15 14:22:08"],
                  ["pn_e8b1...", "ln_a01c...", "us_9a4b...", "2026-05-15", "640.00", "42", "2280.00", "2026-05-15 11:14:56"],
                  ["pn_f427...", "ln_c84d...", "us_8b3c...", "2026-05-14", "1820.00", "108", "2280.00", "2026-05-14 17:08:32"],
                  ["pn_a2c1...", "ln_b21e...", "us_4f1a...", "2026-05-14", "1060.00", "66", "2280.00", "2026-05-14 09:48:11"],
                  ["pn_g7d9...", "ln_f29b...", "us_e8a2...", "2026-05-13", null, "84", "2260.00", "2026-05-13 16:24:48"],
                ].map((r, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--line-2)" }}>
                    {r.map((cell, j) => (
                      <td key={j} style={{
                        padding: "9px 14px",
                        color: j === 0 || j === 1 || j === 2 ? "var(--c-sky)" : cell === null ? "var(--terracotta-2)" : "var(--ink-2)",
                        fontWeight: j === 0 ? 600 : 400,
                      }}>
                        {cell === null ? <span style={{ background: "var(--terra-soft)", padding: "1px 5px", borderRadius: 3, fontSize: 10, fontWeight: 600 }}>NULL</span> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line-2)", background: "var(--paper-2)", fontFamily: "var(--f-mono)", fontSize: 11 }}>
              <div style={{ display: "flex", gap: 18, color: "var(--ink-4)" }}>
                <span>1.420 rows match · 8 ms</span>
                <span>1 NULL highlighted</span>
                <span style={{ color: "var(--forest)" }}>● query optimized (uses idx_panen_tanggal)</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["←", "1", "2", "3", "…", "178", "→"].map((p, i) => (
                  <button key={i} style={{ minWidth: 24, height: 24, padding: "0 5px", borderRadius: 4, border: "1px solid var(--line)", background: p === "1" ? "var(--ink)" : "var(--paper)", color: p === "1" ? "var(--paper)" : "var(--ink-3)", fontSize: 10.5, cursor: "pointer", fontFamily: "var(--f-mono)" }}>{p}</button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

window.AdminDataPage = AdminDataPage;
