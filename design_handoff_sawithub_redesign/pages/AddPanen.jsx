/* global React, SH, AppShell */
const { Card, Btn, Chip, I, PalmLeaf, SeedSprout } = window.SH;

function AddPanenPage() {
  return (
    <AppShell active="panen" title="Catat Panen"
      headerActions={
        <>
          <Btn variant="ghost" size="sm">Batal</Btn>
          <Btn variant="primary" size="sm" leading={<I.check size={14} />}>Simpan panen</Btn>
        </>
      }
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 28, position: "relative" }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Panen baru</div>
          <h1 className="sh-h-2">
            Catat <em className="sh-italic" style={{ color: "var(--forest)" }}>panen&nbsp;hari&nbsp;ini</em>.
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 8, maxWidth: 600 }}>
            Isi sekali — harga rata-rata, pendapatan, dan biaya panen terhitung otomatis dari data ini.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "end" }}>
            <span className="sh-eyebrow">Langkah</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 99,
                    background: s === 1 ? "var(--forest)" : "var(--paper)",
                    color: s === 1 ? "var(--paper)" : "var(--ink-4)",
                    border: s === 1 ? 0 : "1px solid var(--line)",
                    display: "grid", placeItems: "center",
                    fontSize: 11, fontWeight: 600,
                  }}>{s}</div>
                  {s < 3 && <div style={{ width: 16, height: 1, background: "var(--line)" }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }}>
        {/* LEFT: form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Section: Kebun & tanggal */}
          <Card padded={false} style={{ padding: 24 }}>
            <SectionLabel num="01" title="Kebun & tanggal panen" />

            <FormField label="Pilih kebun" hint="Kebun aktif yang dipilih akan menentukan luas dan jumlah pohon">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { id: "A", name: "Blok A", code: "BA-01", ha: 4.2, color: "var(--forest)", active: true },
                  { id: "B", name: "Blok B", code: "BB-02", ha: 3.5, color: "var(--forest-3)" },
                  { id: "C", name: "Blok C", code: "BC-03", ha: 3.7, color: "var(--amber-2)" },
                ].map(k => (
                  <button key={k.id} style={{
                    padding: 14, borderRadius: 12,
                    border: `1.5px solid ${k.active ? k.color : "var(--line)"}`,
                    background: k.active ? `${k.color}10` : "var(--surface)",
                    textAlign: "left", cursor: "pointer", position: "relative",
                  }}>
                    {k.active && (
                      <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: 99, background: k.color, color: "var(--paper)", display: "grid", placeItems: "center" }}>
                        <I.check size={12} />
                      </div>
                    )}
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 22, fontWeight: 500, color: k.color, fontStyle: "italic" }}>{k.id}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{k.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>{k.code} · {k.ha} ha</div>
                  </button>
                ))}
              </div>
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
              <FormField label="Tanggal panen">
                <input className="sh-input" defaultValue="16 Mei 2026" />
              </FormField>
              <FormField label="Luas dipanen (ha)" hint="Default sesuai luas kebun terpilih">
                <input className="sh-input sh-num" defaultValue="4,20" />
              </FormField>
            </div>
          </Card>

          {/* Section: Hasil */}
          <Card padded={false} style={{ padding: 24 }}>
            <SectionLabel num="02" title="Hasil panen TBS" amber />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FormField label="Jumlah janjang" hint="Hitung dari potong terakhir">
                <div style={{ position: "relative" }}>
                  <input className="sh-input sh-num" defaultValue="86" style={{ paddingRight: 70 }} />
                  <span style={{ position: "absolute", right: 14, top: 14, fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>janjang</span>
                </div>
              </FormField>
              <FormField label="Berat total" hint="Dari setruk timbangan pabrik">
                <div style={{ position: "relative" }}>
                  <input className="sh-input sh-num" defaultValue="1.420" style={{ paddingRight: 50 }} />
                  <span style={{ position: "absolute", right: 14, top: 14, fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>kg</span>
                </div>
              </FormField>
            </div>

            <div style={{ marginTop: 14, padding: 14, background: "var(--forest-tint)", border: "1px solid var(--forest-soft)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SeedSprout size={28} color="var(--forest)" opacity={0.9} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "var(--forest)", fontWeight: 600 }}>Berat per janjang: <span className="sh-num">16,5 kg</span></div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>Normal — rata-rata kebun A musim ini 16,2 kg/janjang.</div>
                </div>
                <Chip tone="forest">Sehat</Chip>
              </div>
            </div>
          </Card>

          {/* Section: Harga & biaya */}
          <Card padded={false} style={{ padding: 24 }}>
            <SectionLabel num="03" title="Harga & biaya panen" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FormField label="Harga per kg (TBS)" hint={<>Harga Riau hari ini <span className="sh-num">Rp 2.340/kg</span> · <a style={{ color: "var(--forest)" }}>pakai harga ini</a></>}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: 14, fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>Rp</span>
                  <input className="sh-input sh-num" defaultValue="2.340" style={{ paddingLeft: 38 }} />
                </div>
              </FormField>
              <FormField label="Biaya panen (upah TK + transport)">
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: 14, fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>Rp</span>
                  <input className="sh-input sh-num" defaultValue="320.000" style={{ paddingLeft: 38 }} />
                </div>
              </FormField>
            </div>

            <FormField label="Catatan (opsional)" style={{ marginTop: 14 }}>
              <textarea className="sh-input" rows={3} style={{ height: "auto", padding: 14, resize: "vertical" }}
                defaultValue="Hujan deras kemarin, beberapa janjang jatuh sebelum dipanen. Sekitar 4 janjang busuk." />
            </FormField>
          </Card>

          {/* Action bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
            <Btn variant="ghost">← Kembali</Btn>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost">Simpan sebagai draft</Btn>
              <Btn variant="primary" trailing={<I.check size={16} />}>Simpan panen</Btn>
            </div>
          </div>
        </div>

        {/* RIGHT: live preview */}
        <div style={{ position: "sticky", top: 100, alignSelf: "start" }}>
          <Card padded={false} style={{ padding: 24, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, var(--paper), var(--paper-2))" }}>
            <PalmLeaf size={120} style={{ position: "absolute", right: -10, top: -10, color: "var(--forest)", opacity: 0.08 }} />

            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Ringkasan otomatis</div>
            <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Pratinjau panen</h3>

            <div style={{ padding: "18px 0", borderTop: "1px solid var(--line-2)", borderBottom: "1px solid var(--line-2)", marginBottom: 18 }}>
              <div className="sh-eyebrow" style={{ marginBottom: 6 }}>Pendapatan kotor</div>
              <div className="sh-num" style={{ fontSize: 42, fontWeight: 400, color: "var(--forest)", letterSpacing: "-0.02em" }}>Rp&nbsp;3,32<span style={{ fontSize: 22, color: "var(--ink-3)" }}>&thinsp;jt</span></div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>1.420 kg × Rp 2.340/kg</div>
            </div>

            {[
              { l: "Biaya panen", v: "− Rp 320.000", color: "var(--terracotta-2)" },
              { l: "Hasil bersih", v: "Rp 3,00 jt", color: "var(--forest)", bold: true },
              { l: "Margin", v: "90,3%", color: "var(--amber-2)" },
              { l: "Per hektare", v: "Rp 715 rb / ha", color: "var(--ink-2)" },
            ].map((r, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0",
                borderBottom: i < 3 ? "1px dashed var(--line)" : 0,
              }}>
                <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: r.bold ? 600 : 400 }}>{r.l}</span>
                <span className="sh-num" style={{ fontSize: r.bold ? 18 : 14, fontWeight: 500, color: r.color }}>{r.v}</span>
              </div>
            ))}

            <div style={{ marginTop: 18, padding: 14, background: "var(--amber-tint)", border: "1px solid var(--amber-soft)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "start", gap: 10 }}>
                <span style={{ color: "var(--amber-2)", marginTop: 2 }}><I.star size={16} /></span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>Panen kedua tertinggi bulan ini</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
                    Rata-rata panen Blok A bulan ini 1,12 ton. Hasil ini 27% di atas rata-rata.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, fontSize: 12, color: "var(--ink-4)", lineHeight: 1.55 }}>
              <strong style={{ color: "var(--ink-2)" }}>Setelah simpan,</strong> entri akan masuk ke laporan keuangan Mei 2026, ringkasan Blok A, dan rekap pendapatan otomatis.
            </div>
          </Card>

          {/* Last harvest reference */}
          <Card padded={false} style={{ padding: 20, marginTop: 14 }}>
            <div className="sh-eyebrow" style={{ marginBottom: 10 }}>Panen terakhir di Blok A</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>9 Mei 2026 · 1,18 ton</div>
                <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>72 janjang · Rp 2.300/kg</div>
              </div>
              <Btn variant="ghost" size="sm">Salin angka</Btn>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function SectionLabel({ num, title, amber }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <span style={{
        fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, fontWeight: 500,
        color: amber ? "var(--amber-2)" : "var(--forest)",
      }}>{num}</span>
      <h3 style={{ fontFamily: "var(--f-display)", fontSize: 18, fontWeight: 500 }}>{title}</h3>
      <div style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
    </div>
  );
}

function FormField({ label, hint, children, style }) {
  return (
    <div style={style}>
      <label className="sh-label" style={{ display: "block", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-4)" }}>{hint}</div>}
    </div>
  );
}

window.AddPanenPage = AddPanenPage;
