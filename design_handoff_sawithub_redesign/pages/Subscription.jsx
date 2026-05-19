/* global React, SH, AppShell */
const { Card, Btn, Chip, Ring, I, PalmFrond, PalmLeaf, SunRays, SoilWaves, SawitLogo } = window.SH;

function SubscriptionPage() {
  return (
    <AppShell active="subscription" title="Langganan"
      headerActions={<Btn variant="ghost" size="sm">Riwayat pembayaran</Btn>}
    >
      {/* Editorial header */}
      <div style={{ position: "relative", marginBottom: 36 }}>
        <PalmFrond size={280} style={{ position: "absolute", right: -40, top: -60, color: "var(--forest)", opacity: 0.08 }} />
        <div style={{ maxWidth: 720 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Langganan SawitHub</div>
          <h1 className="sh-h-1">
            Pilih paket yang <em className="sh-italic" style={{ color: "var(--forest)" }}>tumbuh&nbsp;bersama</em> kebun kamu.
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-3)", marginTop: 14 }}>
            Bayar bulanan atau tahunan — hemat 2 bulan kalau bayar setahun. Bisa berhenti kapan saja.
          </p>
        </div>

        {/* Current status card */}
        <Card padded={false} style={{ padding: 22, marginTop: 28, display: "flex", alignItems: "center", gap: 20, background: "var(--amber-tint)", border: "1px solid var(--amber-soft)" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--amber)", display: "grid", placeItems: "center", color: "#2B1F00" }}>
            <I.star size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="sh-eyebrow" style={{ color: "var(--amber-2)", marginBottom: 4 }}>Status saat ini · Trial</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Sisa 8 hari uji coba — semua fitur terbuka</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
              Trial berakhir 24 Mei 2026. Pilih paket sebelum tanggal itu agar data kamu tetap terjaga.
            </div>
          </div>
          <Ring pct={(14 - 8) / 14 * 100} label="8" color="var(--amber-2)" size={68} strokeWidth={6} />
        </Card>
      </div>

      {/* Billing toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", padding: 4, background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 12 }}>
          {["Bulanan", "Tahunan · hemat 2 bulan"].map((l, i) => (
            <button key={l} style={{
              padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: i === 1 ? "var(--forest)" : "transparent",
              color: i === 1 ? "var(--paper)" : "var(--ink-3)",
              border: 0, cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 36 }}>
        {[
          {
            n: "Petani",
            tagline: "Untuk kebun keluarga",
            price: "Rp 39.000",
            unit: "/bulan",
            yearly: "Rp 390.000/tahun",
            feats: [
              "Sampai 3 kebun (10 ha)",
              "Catat panen & rawat",
              "Laporan bulanan",
              "Backup cloud · Indonesia",
              "Dukungan via WhatsApp",
            ],
            color: "var(--forest)",
          },
          {
            n: "Petani Pro",
            tagline: "Untuk kebun produktif",
            price: "Rp 49.000",
            unit: "/bulan",
            yearly: "Rp 490.000/tahun",
            feats: [
              "Kebun tak terbatas",
              "Kalkulator pupuk presisi",
              "Unduh PDF & Excel",
              "Pengingat WhatsApp",
              "Dukungan prioritas",
              "Multi-pengguna (2 akun)",
            ],
            featured: true,
            color: "var(--amber)",
          },
          {
            n: "Koperasi",
            tagline: "Untuk kelompok tani 50+ anggota",
            price: "Hubungi",
            unit: "kami",
            yearly: "Penawaran disesuaikan",
            feats: [
              "Multi-akun anggota",
              "Rekap koperasi & RAT",
              "API integrasi pabrik",
              "Pelatihan onsite (2 hari)",
              "Dedicated account manager",
              "Custom domain · SLA 99.9%",
            ],
            color: "var(--c-bark)",
          },
        ].map((p, i) => (
          <div key={i} style={{
            background: p.featured ? "var(--forest)" : "var(--paper)",
            color: p.featured ? "var(--paper)" : "var(--ink)",
            border: `1px solid ${p.featured ? "var(--forest-2)" : "var(--line)"}`,
            borderRadius: 24, padding: 32, position: "relative", overflow: "hidden",
            boxShadow: p.featured ? "var(--sh-card-3)" : "var(--sh-card)",
          }}>
            {p.featured && (
              <>
                <PalmLeaf size={140} style={{ position: "absolute", right: -20, top: -20, color: "var(--paper)", opacity: 0.07 }} />
                <SoilWaves width={300} height={60} style={{ position: "absolute", left: 0, bottom: 0, color: "var(--amber)", opacity: 0.15 }} />
                <div style={{ position: "absolute", top: -1, left: 32, padding: "5px 14px 7px", background: "var(--amber)", color: "#2B1F00", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", borderRadius: "0 0 8px 8px" }}>
                  Paling populer
                </div>
              </>
            )}
            <div style={{ position: "relative" }}>
              <div className="sh-eyebrow" style={{ color: p.featured ? "var(--amber-3)" : p.color }}>—— {p.n}</div>
              <div style={{ fontSize: 13.5, color: p.featured ? "rgba(251,248,241,0.7)" : "var(--ink-3)", marginTop: 8 }}>{p.tagline}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 18 }}>
                <span style={{ fontFamily: "var(--f-display)", fontSize: 56, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>{p.price}</span>
                <span style={{ fontSize: 14, color: p.featured ? "rgba(251,248,241,0.5)" : "var(--ink-4)" }}>{p.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: p.featured ? "rgba(251,248,241,0.5)" : "var(--ink-4)", marginTop: 6, fontFamily: "var(--f-mono)" }}>
                {p.yearly}
              </div>
              <Btn variant={p.featured ? "amber" : "primary"} size="lg" style={{ width: "100%", marginTop: 26 }}>
                {i === 2 ? "Hubungi tim kami" : "Pilih paket ini"}
              </Btn>
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${p.featured ? "rgba(255,255,255,0.12)" : "var(--line)"}`, display: "flex", flexDirection: "column", gap: 12 }}>
                {p.feats.map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "start", fontSize: 13.5, color: p.featured ? "rgba(251,248,241,0.85)" : "var(--ink-2)" }}>
                    <span style={{ color: p.featured ? "var(--amber-3)" : "var(--forest)", marginTop: 2 }}><I.check size={14} /></span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature comparison */}
      <Card padded={false} style={{ padding: 0, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--line-2)" }}>
          <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Bandingkan</div>
          <h3 className="sh-h-4">Semua fitur SawitHub</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--paper-2)" }}>
              <th style={{ padding: "14px 28px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}></th>
              <th style={{ padding: "14px 20px", fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>Petani</th>
              <th style={{ padding: "14px 20px", fontSize: 12.5, fontWeight: 600, color: "var(--forest)", background: "var(--forest-tint)" }}>Petani Pro</th>
              <th style={{ padding: "14px 20px", fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>Koperasi</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Catatan kebun", "3 kebun · 10 ha", "Tak terbatas", "Multi-organisasi"],
              ["Riwayat panen & biaya", true, true, true],
              ["Laporan keuangan bulanan", true, true, true],
              ["Unduh PDF / Excel", false, true, true],
              ["Kalkulator pupuk presisi", false, true, true],
              ["Pengingat WhatsApp", "Manual", true, true],
              ["Multi-pengguna", "1 akun", "2 akun", "Tak terbatas"],
              ["API integrasi pabrik", false, false, true],
              ["Pelatihan onsite", false, false, "2 hari/thn"],
              ["Account manager", false, false, true],
            ].map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--line-2)" }}>
                <td style={{ padding: "14px 28px", fontSize: 13.5, color: "var(--ink-2)" }}>{row[0]}</td>
                {row.slice(1).map((cell, j) => (
                  <td key={j} style={{ padding: "14px 20px", textAlign: "center", fontSize: 13, fontWeight: 500, color: "var(--ink-2)", background: j === 1 ? "rgba(231, 238, 232, 0.35)" : "transparent" }}>
                    {cell === true ? <span style={{ color: "var(--forest)" }}><I.check /></span>
                      : cell === false ? <span style={{ color: "var(--ink-5)" }}>—</span>
                      : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* FAQ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 22, marginBottom: 36 }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— FAQ</div>
          <h3 className="sh-h-3">Pertanyaan umum.</h3>
          <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 14, lineHeight: 1.6 }}>
            Tidak menemukan jawabannya? <a style={{ color: "var(--forest)", fontWeight: 600 }}>Hubungi via WhatsApp →</a>
          </p>
        </div>
        <div>
          {[
            { q: "Apa yang terjadi setelah trial 14 hari berakhir?", a: "Akun beralih ke mode terbatas (lihat tapi tidak bisa input). Data kamu tetap aman 90 hari sambil menunggu kamu memilih paket." },
            { q: "Bisa berhenti kapan saja?", a: "Tentu. Langganan bulanan bisa dibatalkan kapan saja — kamu tetap bisa pakai sampai akhir periode yang sudah dibayar." },
            { q: "Bagaimana metode pembayaran?", a: "Transfer bank, GoPay, OVO, DANA, ShopeePay, dan kartu kredit. Untuk Koperasi, kami terima invoice termin." },
            { q: "Apakah data kebun saya aman?", a: "Data disimpan di server Indonesia (Jakarta), dienkripsi end-to-end, dan kami tidak pernah jual data petani ke pihak ketiga." },
          ].map((f, i, arr) => (
            <details key={i} open={i === 0} style={{ padding: "18px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--line-2)" : 0 }}>
              <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", listStyle: "none" }}>
                <span style={{ fontFamily: "var(--f-display)", fontSize: 18, fontWeight: 500 }}>{f.q}</span>
                <span style={{ fontSize: 22, fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--forest)" }}>{i === 0 ? "—" : "+"}</span>
              </summary>
              {i === 0 && (
                <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 10, lineHeight: 1.65, maxWidth: 640 }}>{f.a}</p>
              )}
            </details>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

window.SubscriptionPage = SubscriptionPage;
