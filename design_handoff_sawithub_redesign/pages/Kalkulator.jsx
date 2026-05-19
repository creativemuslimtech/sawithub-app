/* global React, SH, AppShell */
const { Card, Btn, Chip, Ring, I, PalmLeaf, SeedSprout, SunRays } = window.SH;

function KalkulatorPage() {
  return (
    <AppShell active="kalkulator" title="Kalkulator Pupuk"
      headerActions={<Btn variant="ghost" size="sm">Riwayat perhitungan</Btn>}
    >
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 28, position: "relative" }}>
        <SunRays size={160} style={{ position: "absolute", right: 80, top: -40, color: "var(--amber)", opacity: 0.08 }} />
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Kalkulator pupuk presisi · v2026</div>
          <h1 className="sh-h-2">
            Berapa pupuk yang <em className="sh-italic" style={{ color: "var(--forest)" }}>kebun&nbsp;kamu</em> perlukan?
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 8, maxWidth: 640 }}>
            Masukkan jenis bibit, umur tanaman, dan target hasil — kami hitung dosis NPK per pohon, kebutuhan tahunan, dan estimasi biaya.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 22 }}>
        {/* LEFT: input panel */}
        <Card padded={false} style={{ padding: 28 }}>
          <SectionLabelK num="01" title="Data tanaman" />

          {/* Kebun chips */}
          <FormFieldK label="Kebun" hint="Atau pilih manual di bawah">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { id: "A", l: "Blok A · 4,2 ha", active: true },
                { id: "B", l: "Blok B · 3,5 ha" },
                { id: "C", l: "Blok C · 3,7 ha" },
                { id: "M", l: "Manual" },
              ].map(c => (
                <button key={c.id} style={{
                  padding: "8px 14px", borderRadius: 99,
                  background: c.active ? "var(--forest)" : "var(--paper)",
                  color: c.active ? "var(--paper)" : "var(--ink-2)",
                  border: `1px solid ${c.active ? "var(--forest)" : "var(--line)"}`,
                  fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                }}>{c.l}</button>
              ))}
            </div>
          </FormFieldK>

          {/* Jenis bibit */}
          <FormFieldK label="Jenis bibit / varietas">
            <select className="sh-input" defaultValue="topaz">
              <option value="topaz">Topaz (PPKS) — recommended</option>
              <option>Tenera Marihat</option>
              <option>Tenera Socfin</option>
            </select>
          </FormFieldK>

          {/* Sliders */}
          <FormFieldK label="Umur tanaman (tahun)">
            <SliderRow value={8} min={0} max={25} marker="TT 8" />
          </FormFieldK>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormFieldK label="Jumlah pohon">
              <div style={{ position: "relative" }}>
                <input className="sh-input sh-num" defaultValue="588" style={{ paddingRight: 60 }} />
                <span style={{ position: "absolute", right: 14, top: 14, fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>btg</span>
              </div>
            </FormFieldK>
            <FormFieldK label="Target hasil (ton/ha/thn)">
              <div style={{ position: "relative" }}>
                <input className="sh-input sh-num" defaultValue="26" style={{ paddingRight: 80 }} />
                <span style={{ position: "absolute", right: 14, top: 14, fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>ton/ha</span>
              </div>
            </FormFieldK>
          </div>

          {/* NPK ratio */}
          <SectionLabelK num="02" title="Komposisi NPK pupuk" amber />

          <FormFieldK label="Pilih formula" hint="Atau buka 'Lanjutan' untuk atur ratio sendiri">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { l: "NPK 15-15-15", sub: "Umum", active: false },
                { l: "NPK 12-12-17+2", sub: "Disarankan TT 6+", active: true },
                { l: "Urea + MOP + RP", sub: "Single nutrient", active: false },
              ].map(o => (
                <button key={o.l} style={{
                  padding: 14, borderRadius: 12,
                  border: `1.5px solid ${o.active ? "var(--amber)" : "var(--line)"}`,
                  background: o.active ? "var(--amber-tint)" : "var(--surface)",
                  textAlign: "left", cursor: "pointer", position: "relative",
                }}>
                  {o.active && (
                    <div style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderRadius: 99, background: "var(--amber)", color: "#2B1F00", display: "grid", placeItems: "center" }}>
                      <I.check size={10} />
                    </div>
                  )}
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{o.l}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>{o.sub}</div>
                </button>
              ))}
            </div>
          </FormFieldK>

          <FormFieldK label="Harga pupuk per kg" hint="Harga pasar Riau · diperbarui 12 Mei 2026">
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: 14, fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>Rp</span>
              <input className="sh-input sh-num" defaultValue="9.800" style={{ paddingLeft: 38 }} />
            </div>
          </FormFieldK>

          <button style={{
            marginTop: 16, padding: "12px 14px", borderRadius: 12, border: "1px dashed var(--line)",
            background: "transparent", color: "var(--ink-3)", fontSize: 12.5, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, width: "100%",
          }}>
            <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--forest)" }}>+</span>
            Lanjutan: atur ratio N-P-K manual, frekuensi aplikasi, koreksi kondisi tanah…
          </button>
        </Card>

        {/* RIGHT: results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Big result */}
          <Card padded={false} style={{ padding: 32, background: "var(--forest)", color: "var(--paper)", position: "relative", overflow: "hidden" }}>
            <PalmLeaf size={180} style={{ position: "absolute", right: -30, top: -30, color: "var(--paper)", opacity: 0.07 }} />
            <SeedSprout size={120} style={{ position: "absolute", left: -10, bottom: -10, color: "var(--amber-3)", opacity: 0.15 }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, color: "var(--amber-3)", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>—— Dosis yang direkomendasikan</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span className="sh-num" style={{ fontSize: 72, fontWeight: 400, color: "var(--paper)", letterSpacing: "-0.03em", lineHeight: 1 }}>1,80</span>
                <span style={{ fontSize: 17, color: "rgba(251,248,241,0.6)" }}>kg / pohon / aplikasi</span>
              </div>
              <p style={{ fontSize: 14, color: "rgba(251,248,241,0.75)", marginTop: 14, maxWidth: 380, lineHeight: 1.55 }}>
                Cocok untuk Tenera Topaz TT 8 tahun di tanah mineral.
                Aplikasi 2 kali per tahun — semester ganjil dan genap.
              </p>

              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
                {[
                  { l: "Per ha / tahun", v: "508 kg" },
                  { l: "Total kebun A", v: "2.117 kg" },
                  { l: "Estimasi biaya", v: "Rp 20,7 jt" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: i > 0 ? "0 0 0 20px" : "0 20px 0 0", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.1)" : 0 }}>
                    <div style={{ fontSize: 10, color: "rgba(251,248,241,0.55)", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 600 }}>{s.l}</div>
                    <div className="sh-num" style={{ fontSize: 22, fontWeight: 500, color: "var(--paper)", marginTop: 6 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card padded={false} style={{ padding: 24 }}>
            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Jadwal aplikasi tahun ini</div>
            <h3 className="sh-h-4" style={{ marginBottom: 16 }}>2 aplikasi · setengah dosis masing-masing</h3>

            <div style={{ position: "relative", padding: "20px 0" }}>
              <div style={{ position: "absolute", left: 16, right: 16, top: 36, height: 6, background: "var(--line-soft)", borderRadius: 99 }}>
                <div style={{ width: "62%", height: "100%", background: "linear-gradient(90deg, var(--forest-3), var(--forest))", borderRadius: 99 }} />
              </div>
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
                {[
                  { m: "Mar 2026", st: "Selesai", v: "240 kg N+P", color: "var(--forest)", done: true },
                  { m: "Sep 2026", st: "Akan datang", v: "240 kg N+K", color: "var(--amber)", done: false },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: i === 0 ? "left" : "right", maxWidth: 200 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 99, background: s.color, color: "var(--paper)", display: "grid", placeItems: "center", margin: i === 0 ? 0 : "0 0 0 auto", marginBottom: 12 }}>
                      {s.done ? <I.check size={14} /> : <I.cal size={14} />}
                    </div>
                    <div className="sh-num" style={{ fontSize: 14, fontWeight: 500 }}>{s.m}</div>
                    <Chip tone={s.done ? "forest" : "amber"} style={{ marginTop: 4 }}>{s.st}</Chip>
                    <div className="sh-num" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 8, padding: 14, background: "var(--cream)", borderRadius: 10, display: "flex", gap: 10, alignItems: "start" }}>
              <span style={{ color: "var(--amber-2)" }}><I.star size={16} /></span>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.55 }}>
                Aplikasi pertama lebih banyak Nitrogen-Fosfor (pasca puncak hujan); aplikasi kedua lebih banyak Kalium (jelang musim kering).
              </div>
            </div>
          </Card>

          {/* Comparison */}
          <Card padded={false} style={{ padding: 24 }}>
            <div className="sh-eyebrow" style={{ marginBottom: 6 }}>—— Banding rekomendasi PPKS</div>
            <h3 className="sh-h-4" style={{ marginBottom: 18 }}>Dosis kebun kamu vs. standar</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { n: "Nitrogen (N)", you: 240, ppks: 220, unit: "g/pohon" },
                { n: "Fosfor (P)", you: 110, ppks: 110, unit: "g/pohon" },
                { n: "Kalium (K)", you: 320, ppks: 340, unit: "g/pohon" },
              ].map((d, i) => {
                const max = Math.max(d.you, d.ppks) * 1.1;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{d.n}</span>
                      <span className="sh-num" style={{ fontSize: 12, color: "var(--ink-4)" }}>{d.unit}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 56, fontSize: 11, color: "var(--ink-3)" }}>Kamu</span>
                        <div style={{ flex: 1, height: 8, background: "var(--line-soft)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ width: `${(d.you / max) * 100}%`, height: "100%", background: "var(--forest)" }} />
                        </div>
                        <span className="sh-num" style={{ width: 50, fontSize: 12, fontWeight: 500, textAlign: "right" }}>{d.you}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 56, fontSize: 11, color: "var(--ink-3)" }}>PPKS</span>
                        <div style={{ flex: 1, height: 8, background: "var(--line-soft)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ width: `${(d.ppks / max) * 100}%`, height: "100%", background: "var(--amber-2)" }} />
                        </div>
                        <span className="sh-num" style={{ width: 50, fontSize: 12, fontWeight: 500, textAlign: "right", color: "var(--ink-4)" }}>{d.ppks}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" leading={<I.download size={14} />}>Unduh PDF</Btn>
            <Btn variant="primary" leading={<I.cal size={14} />}>Tambahkan ke jadwal</Btn>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SectionLabelK({ num, title, amber }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, marginTop: 8 }}>
      <span style={{
        fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, fontWeight: 500,
        color: amber ? "var(--amber-2)" : "var(--forest)",
      }}>{num}</span>
      <h3 style={{ fontFamily: "var(--f-display)", fontSize: 17, fontWeight: 500 }}>{title}</h3>
      <div style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
    </div>
  );
}

function FormFieldK({ label, hint, children, style }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <label className="sh-label" style={{ display: "block", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-4)" }}>{hint}</div>}
    </div>
  );
}

function SliderRow({ value, min, max, marker }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span className="sh-num" style={{ fontSize: 13, color: "var(--ink-4)" }}>{min}</span>
        <Chip tone="forest" style={{ background: "var(--forest)", color: "var(--paper)", borderColor: "transparent" }}>{marker}</Chip>
        <span className="sh-num" style={{ fontSize: 13, color: "var(--ink-4)" }}>{max}+</span>
      </div>
      <div style={{ position: "relative", height: 8, background: "var(--line-soft)", borderRadius: 99 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "linear-gradient(90deg, var(--forest-3), var(--forest))", borderRadius: 99 }} />
        <div style={{
          position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)",
          width: 22, height: 22, borderRadius: 99,
          background: "var(--paper)", border: "3px solid var(--forest)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {["TBM 0-3", "TM 4-7", "TM 8-15", "TM 16+"].map((p, i) => (
          <span key={i} style={{ fontSize: 10, color: "var(--ink-4)" }}>{p}</span>
        ))}
      </div>
    </div>
  );
}

window.KalkulatorPage = KalkulatorPage;
