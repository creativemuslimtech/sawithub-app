/* global React, SH */
const { SawitLogo, PalmFrond, PalmLeaf, SunRays, SoilWaves, Card, Btn, Chip, Sparkline, I } = window.SH;

function LandingPage() {
  return (
    <div className="sh-page" style={{ width: 1440, minHeight: 2400, background: "var(--cream)", position: "relative", overflow: "hidden" }}>
      <div className="sh-grain" />

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        padding: "18px 56px",
        background: "rgba(245, 240, 232, 0.78)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(219, 211, 191, 0.6)",
        display: "flex", alignItems: "center", gap: 32
      }}>
        <SawitLogo size={28} />
        <nav style={{ display: "flex", gap: 28, marginLeft: 16 }}>
          {["Fitur", "Untuk Petani", "Koperasi", "Harga", "Cerita"].map(l => (
            <a key={l} style={{ fontSize: 14, color: "var(--ink-2)", fontWeight: 500, textDecoration: "none" }}>{l}</a>
          ))}
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <a style={{ fontSize: 14, color: "var(--ink-2)", fontWeight: 500, textDecoration: "none", padding: "8px 14px" }}>Masuk</a>
          <Btn variant="primary" size="sm">Coba gratis 14 hari</Btn>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: "relative", padding: "60px 56px 80px" }}>
        {/* Decorative palm frond bg */}
        <PalmFrond size={520} style={{ position: "absolute", right: -60, top: -40, opacity: 0.08 }} />
        <PalmLeaf size={280} style={{ position: "absolute", left: -40, bottom: -40, opacity: 0.1, transform: "rotate(-15deg)" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "center", maxWidth: 1320 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 6px",
              background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 999, marginBottom: 28 }}>
              <span style={{ padding: "3px 9px", borderRadius: 999, background: "var(--forest)", color: "var(--paper)", fontSize: 10, fontWeight: 700, letterSpacing: ".08em" }}>BARU</span>
              <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Kalkulator pupuk presisi v2026 · gratis untuk uji coba</span>
            </div>

            <h1 className="sh-h-display" style={{ marginBottom: 26, fontWeight: 400 }}>
              Kebun kamu,<br />
              dikelola seperti <em className="sh-italic" style={{ color: "var(--forest)", fontStyle: "italic", fontWeight: 400 }}>koperasi&nbsp;modern</em>.
            </h1>

            <p style={{ fontSize: 19, color: "var(--ink-3)", maxWidth: 560, lineHeight: 1.55, marginBottom: 36 }}>
              SawitHub menyatukan catatan panen, biaya rawat, harga TBS, dan laporan keuangan kebun sawit
              — dalam satu tempat yang rapi, dapat dipercaya, dan mudah dibuka dari hape.
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 44 }}>
              <Btn variant="primary" size="lg" trailing={<I.arrow size={16} />}>Mulai gratis 14 hari</Btn>
              <Btn variant="ghost" size="lg">Lihat demo kebun  ›</Btn>
            </div>

            {/* Trust strip */}
            <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
              <div>
                <div className="sh-num" style={{ fontSize: 28, fontWeight: 500, color: "var(--ink)" }}>12.400+</div>
                <div className="sh-eyebrow" style={{ marginTop: 4 }}>Petani aktif</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--line)" }} />
              <div>
                <div className="sh-num" style={{ fontSize: 28, fontWeight: 500, color: "var(--ink)" }}>Rp 240<span style={{ fontSize: 18, color: "var(--ink-3)" }}>&thinsp;M</span></div>
                <div className="sh-eyebrow" style={{ marginTop: 4 }}>Tercatat / tahun</div>
              </div>
              <div style={{ width: 1, height: 36, background: "var(--line)" }} />
              <div>
                <div className="sh-num" style={{ fontSize: 28, fontWeight: 500, color: "var(--ink)" }}>18 prov.</div>
                <div className="sh-eyebrow" style={{ marginTop: 4 }}>Tersebar</div>
              </div>
            </div>
          </div>

          {/* Hero preview card cluster */}
          <HeroPreview />
        </div>
      </section>

      {/* PARTNERS RAIL */}
      <section style={{ padding: "18px 56px", borderTop: "1px solid var(--line-2)", borderBottom: "1px solid var(--line-2)", background: "var(--paper)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 48, justifyContent: "space-between" }}>
          <div className="sh-eyebrow">Dipercaya oleh koperasi &amp; mitra agribisnis</div>
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            {["KOPSAWIT Riau", "Asian Agri Mitra", "GAPKI", "Kementan", "Bank BSI Tani", "PSR Indonesia"].map(n => (
              <span key={n} style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 17, color: "var(--ink-4)", letterSpacing: "-0.01em" }}>{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ padding: "100px 56px 60px", position: "relative" }}>
        <SunRays size={140} style={{ position: "absolute", right: 80, top: 60, opacity: 0.08, color: "var(--amber-2)" }} />
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 56 }}>
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: 14 }}>—— Apa yang bisa dikerjakan</div>
            <h2 className="sh-h-1" style={{ maxWidth: 720 }}>
              Tujuh alat kerja kebun yang <em className="sh-italic">bekerja sama</em>, bukan terpisah.
            </h2>
          </div>
          <a style={{ fontSize: 14, color: "var(--forest)", fontWeight: 600 }}>Jelajahi semua fitur →</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {[
            { icon: <I.home />,   eyebrow: "Ringkasan", title: "Satu layar untuk semua kebun", desc: "Untung bersih, hasil panen, harga TBS, dan jadwal dalam satu pandangan.", color: "var(--forest)" },
            { icon: <I.leaf />,   eyebrow: "Lahan", title: "Banyak kebun, satu pencatatan", desc: "Catat luas, jumlah pohon, tahun tanam per blok dengan presisi.", color: "var(--c-bark)" },
            { icon: <I.basket />, eyebrow: "Panen", title: "Janjang, berat, harga — nyambung", desc: "Isi sekali, harga rata-rata dan pendapatan terhitung otomatis.", color: "var(--amber-2)" },
            { icon: <I.spray />,  eyebrow: "Perawatan", title: "Pisahkan biaya bahan dan tenaga", desc: "Pupuk, semprot, dan upah pekerja terpisah agar laporan jelas.", color: "var(--c-terra)" },
            { icon: <I.cal />,    eyebrow: "Jadwal", title: "Jadwal kerja tidak terlewat", desc: "Rotasi pupuk 3 bulanan, pruning 6 bulanan — pengingat di hape.", color: "var(--c-sky)" },
            { icon: <I.calc />,   eyebrow: "Kalkulator", title: "Hitung pupuk sesuai jumlah pohon", desc: "Umur tanaman, kadar NPK — keluar dosis per pohon dan total tahunan.", color: "var(--forest-3)" },
            { icon: <I.money />,  eyebrow: "Laporan", title: "Akhir bulan tanpa kalkulator manual", desc: "Pendapatan, biaya, laba bersih — siap unduh Excel atau PDF.", color: "var(--amber-2)" },
            { icon: <I.chart />,  eyebrow: "Wawasan", title: "Tahu kebun mana yang paling untung", desc: "Bandingkan per-hektare antar blok dan musim.", color: "var(--forest)" },
          ].map((f, i) => (
            <Card key={i} className="sh-lift" style={{ padding: 24, position: "relative", overflow: "hidden", minHeight: 200 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${f.color}14`, color: f.color, border: `1px solid ${f.color}22`,
                display: "grid", placeItems: "center", marginBottom: 18,
              }}>
                {f.icon}
              </div>
              <div className="sh-eyebrow" style={{ color: f.color, marginBottom: 8 }}>{f.eyebrow}</div>
              <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8, lineHeight: 1.2 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55 }}>{f.desc}</p>
              <PalmLeaf size={80} style={{ position: "absolute", right: -10, bottom: -10, color: f.color, opacity: 0.06 }} />
            </Card>
          ))}
        </div>
      </section>

      {/* EDITORIAL DARK BLOCK — Laporan Keuangan */}
      <section style={{ padding: "60px 56px 80px" }}>
        <div style={{
          background: "var(--forest)",
          color: "var(--paper)",
          borderRadius: 32,
          padding: "64px 56px",
          position: "relative",
          overflow: "hidden"
        }}>
          <PalmFrond size={400} style={{ position: "absolute", right: -80, top: -80, color: "var(--paper)", opacity: 0.07 }} />
          <SoilWaves width={400} height={80} style={{ position: "absolute", left: 0, bottom: 0, color: "var(--amber)", opacity: 0.18 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 56, alignItems: "center", position: "relative" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--amber-3)", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, marginBottom: 18 }}>—— Laporan Keuangan</div>
              <h2 className="sh-h-1" style={{ color: "var(--paper)", marginBottom: 24 }}>
                Akhir bulan,<br />tanpa <em className="sh-italic" style={{ color: "var(--amber-3)" }}>kalkulator&nbsp;manual</em>.
              </h2>
              <p style={{ fontSize: 17, color: "rgba(251,248,241,0.7)", maxWidth: 460, lineHeight: 1.55, marginBottom: 32 }}>
                Pendapatan, biaya, dan laba bersih per kebun — siap untuk koperasi, bank, atau pajak.
                Unduh Excel atau PDF, atau kirim langsung ke email pengurus.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <Btn variant="amber">Coba laporan keuangan</Btn>
                <Btn variant="ghost" style={{ background: "transparent", borderColor: "rgba(255,255,255,0.2)", color: "var(--paper)" }}>Contoh PDF →</Btn>
              </div>
            </div>
            <LaporanPreview />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "60px 56px 80px", background: "var(--paper)" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 14 }}>—— Cerita petani</div>
          <h2 className="sh-h-2" style={{ maxWidth: 720, margin: "0 auto" }}>
            Dipakai pagi-pagi sebelum panen, sore setelah pulang dari kebun.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 18 }}>
          {[
            { name: "Pak Suparman", role: "Petani · Riau · 3,2 ha", quote: "Dulu catatan panen di buku tulis, sering sobek dan hilang. Sekarang anak saya tinggal foto setruk timbangan, dan saya tahu untungnya berapa malam itu juga.", featured: true },
            { name: "Bu Hartini", role: "Bendahara KopSawit Tj. Jabung", quote: "Laporan bulanan anggota tinggal unduh. Kami tidak perlu lagi tunggu 3 minggu untuk rapat keuangan." },
            { name: "Pak Yusran", role: "Petani · Sumut · 8,5 ha", quote: "Jadwal pupuk 3 bulanan tidak pernah terlewat. Hasil panen naik 14% dalam setahun." },
          ].map((t, i) => (
            <Card key={i} style={{ padding: 32, minHeight: 280, background: t.featured ? "var(--cream)" : "var(--surface)" }}>
              <div style={{ fontSize: 32, fontFamily: "var(--f-display)", color: "var(--amber-2)", lineHeight: 0.5, marginBottom: 12 }}>"</div>
              <p style={{ fontFamily: "var(--f-display)", fontSize: t.featured ? 22 : 17, lineHeight: 1.4, fontWeight: 400, letterSpacing: "-0.015em", color: "var(--ink)" }}>
                {t.quote}
              </p>
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 99, background: "var(--forest-soft)", display: "grid", placeItems: "center", color: "var(--forest)" }}>
                  <I.user />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "80px 56px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 14 }}>—— Harga</div>
          <h2 className="sh-h-1">Mulai gratis. Tambah saat siap.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, maxWidth: 1120, margin: "0 auto" }}>
          {[
            { name: "Coba", price: "Gratis", per: "14 hari", desc: "Semua fitur, tanpa kartu kredit.", featured: false, feats: ["2 kebun", "Catat panen & rawat", "Laporan bulanan", "Backup di cloud"], cta: "Mulai gratis" },
            { name: "Petani Pro", price: "Rp 49.000", per: "/bulan", desc: "Untuk kebun keluarga sampai 20 ha.", featured: true, feats: ["Kebun tak terbatas", "Kalkulator pupuk", "Unduh PDF & Excel", "Pengingat WhatsApp", "Dukungan prioritas"], cta: "Pilih Petani Pro" },
            { name: "Koperasi", price: "Hubungi", per: "kami", desc: "Untuk koperasi & kelompok tani 50+ anggota.", featured: false, feats: ["Multi-akun anggota", "Rekap koperasi", "API integrasi pabrik", "Pelatihan onsite", "Account manager"], cta: "Diskusi dengan tim" },
          ].map((p, i) => (
            <div key={i} style={{
              background: p.featured ? "var(--forest)" : "var(--paper)",
              color: p.featured ? "var(--paper)" : "var(--ink)",
              border: `1px solid ${p.featured ? "var(--forest-2)" : "var(--line)"}`,
              borderRadius: 24,
              padding: 32,
              position: "relative",
              boxShadow: p.featured ? "var(--sh-card-3)" : "var(--sh-card)",
            }}>
              {p.featured && (
                <div style={{ position: "absolute", top: -12, right: 24, background: "var(--amber)", color: "#2B1F00", fontSize: 11, fontWeight: 700, padding: "5px 11px", borderRadius: 99, letterSpacing: ".06em", textTransform: "uppercase" }}>
                  Paling populer
                </div>
              )}
              <div className="sh-eyebrow" style={{ color: p.featured ? "var(--amber-3)" : "var(--ink-4)" }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--f-display)", fontSize: 48, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>{p.price}</span>
                <span style={{ fontSize: 14, color: p.featured ? "rgba(251,248,241,0.55)" : "var(--ink-4)" }}>{p.per}</span>
              </div>
              <p style={{ fontSize: 13.5, color: p.featured ? "rgba(251,248,241,0.7)" : "var(--ink-3)", marginBottom: 24, minHeight: 36 }}>{p.desc}</p>
              <Btn variant={p.featured ? "amber" : "primary"} size="lg" style={{ width: "100%" }}>{p.cta}</Btn>
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${p.featured ? "rgba(255,255,255,0.12)" : "var(--line)"}`, display: "flex", flexDirection: "column", gap: 12 }}>
                {p.feats.map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13.5, color: p.featured ? "rgba(251,248,241,0.85)" : "var(--ink-2)" }}>
                    <div style={{ color: p.featured ? "var(--amber-3)" : "var(--forest)" }}><I.check size={16} /></div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding: "20px 56px 80px" }}>
        <div style={{
          background: "linear-gradient(120deg, var(--amber-soft), var(--cream))",
          border: "1px solid var(--line)",
          borderRadius: 32,
          padding: "64px 56px",
          position: "relative",
          overflow: "hidden",
        }}>
          <PalmFrond size={360} style={{ position: "absolute", right: -40, top: -40, color: "var(--forest)", opacity: 0.1 }} />
          <SunRays size={200} style={{ position: "absolute", left: -40, bottom: -40, color: "var(--amber-2)", opacity: 0.12 }} />
          <div style={{ position: "relative", maxWidth: 640 }}>
            <h2 className="sh-h-1" style={{ marginBottom: 16 }}>
              Mulai dari panen <em className="sh-italic" style={{ color: "var(--forest)" }}>minggu&nbsp;ini</em>.
            </h2>
            <p style={{ fontSize: 17, color: "var(--ink-3)", marginBottom: 28, maxWidth: 520, lineHeight: 1.55 }}>
              14 hari gratis tanpa kartu kredit. Tim kami bantu pindahkan catatan lama kamu — gratis.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="primary" size="lg" trailing={<I.arrow size={16} />}>Coba gratis 14 hari</Btn>
              <Btn variant="ghost" size="lg">Hubungi via WhatsApp</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "44px 56px 32px", borderTop: "1px solid var(--line-2)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr", gap: 32, marginBottom: 36 }}>
          <div>
            <SawitLogo size={26} />
            <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 14, maxWidth: 280, lineHeight: 1.55 }}>
              Aplikasi kebun sawit untuk petani mandiri. Dibuat di Pekanbaru, didistribusikan ke 18 provinsi di Indonesia.
            </p>
          </div>
          {[
            { h: "Produk", l: ["Fitur", "Harga", "Untuk Koperasi", "Aplikasi Android"] },
            { h: "Sumber", l: ["Bantuan", "Panduan pupuk", "Harga TBS", "Glosarium"] },
            { h: "Tentang", l: ["Cerita kami", "Mitra koperasi", "Karir", "Tekan kami"] },
            { h: "Hukum", l: ["Privasi", "Syarat", "Cookie", "DSAR"] },
          ].map(c => (
            <div key={c.h}>
              <div className="sh-eyebrow" style={{ marginBottom: 14 }}>{c.h}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {c.l.map(li => <a key={li} style={{ fontSize: 13, color: "var(--ink-2)", textDecoration: "none" }}>{li}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid var(--line-2)" }}>
          <div style={{ fontSize: 12, color: "var(--ink-4)" }}>© 2026 SawitHub. Dibuat dengan cinta di Pekanbaru.</div>
          <div style={{ fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--f-display)", fontStyle: "italic" }}>
            "Sawitnya tumbuh, datanya rapi."
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroPreview() {
  return (
    <div style={{ position: "relative", height: 520 }}>
      {/* Glow */}
      <div style={{ position: "absolute", inset: -40, background: "radial-gradient(circle at 60% 50%, var(--amber-soft), transparent 60%)", zIndex: 0, filter: "blur(20px)" }} />

      {/* Main card */}
      <div style={{ position: "absolute", left: 20, top: 30, width: 360, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 24, padding: 22, boxShadow: "var(--sh-card-3)", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div className="sh-eyebrow">Mei 2026 · Semua Kebun</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 18, fontWeight: 500, marginTop: 4 }}>Kebun Suka Maju</div>
          </div>
          <SawitLogo size={22} showText={false} />
        </div>
        <div style={{ padding: 18, background: "linear-gradient(180deg, var(--cream), var(--paper-2))", borderRadius: 16, border: "1px solid var(--line-2)", marginBottom: 14 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 6 }}>Untung bersih</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div className="sh-num" style={{ fontSize: 36, fontWeight: 500, color: "var(--forest)" }}>Rp&nbsp;38,4<span style={{ fontSize: 18, color: "var(--ink-3)" }}>&thinsp;jt</span></div>
            <Chip tone="forest">↑ 18,2%</Chip>
          </div>
          <div style={{ marginTop: 12 }}><Sparkline data={[12, 18, 16, 22, 28, 24, 32, 38, 34, 42]} width={310} height={48} color="var(--forest)" /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["Panen", "8,4 ton", "var(--forest)"], ["Biaya rawat", "Rp 12,0 jt", "var(--amber-2)"]].map(([l, v, c]) => (
            <div key={l} style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: c }} />
                <span className="sh-eyebrow" style={{ fontSize: 10 }}>{l}</span>
              </div>
              <div className="sh-num" style={{ fontSize: 17, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule pill */}
      <div style={{ position: "absolute", right: 20, top: 0, width: 240, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18, padding: 16, boxShadow: "var(--sh-card-2)", zIndex: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--amber-soft)", color: "var(--amber-2)", display: "grid", placeItems: "center" }}>
            <I.cal size={16} />
          </div>
          <div className="sh-eyebrow">Jadwal besok</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>Pemupukan Blok A</div>
        <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>240 pohon · Pak Hadi</div>
      </div>

      {/* TBS price */}
      <div style={{ position: "absolute", right: 0, top: 130, width: 220, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18, padding: 16, boxShadow: "var(--sh-card-2)", zIndex: 3 }}>
        <div className="sh-eyebrow">Harga TBS hari ini</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
          <div className="sh-num" style={{ fontSize: 22, fontWeight: 500 }}>Rp&nbsp;2.340</div>
          <span style={{ fontSize: 12, color: "var(--ink-4)" }}>/kg</span>
        </div>
        <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Chip tone="forest">↑ 4,2%</Chip>
          <Sparkline data={[2200, 2180, 2220, 2260, 2240, 2300, 2340]} width={70} height={26} color="var(--forest-3)" fill={false} />
        </div>
      </div>

      {/* Calc dark card */}
      <div style={{ position: "absolute", right: 30, bottom: 0, width: 260, background: "var(--forest)", color: "var(--paper)", borderRadius: 18, padding: 18, boxShadow: "var(--sh-card-3)", zIndex: 3 }}>
        <div className="sh-eyebrow" style={{ color: "var(--amber-3)" }}>Kalkulator Pupuk</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6, marginBottom: 12, color: "var(--paper)" }}>Dosis NPK · TT 8 tahun</div>
        <div className="sh-num" style={{ fontSize: 30, fontWeight: 500, color: "var(--amber-3)" }}>1,8 <span style={{ fontSize: 14, color: "rgba(251,248,241,0.5)" }}>kg/pohon</span></div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99, marginTop: 14, overflow: "hidden" }}>
          <div style={{ width: "72%", height: "100%", background: "var(--amber)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "rgba(251,248,241,0.6)" }}>
          <span>240 pohon</span><span className="sh-num">432 kg total</span>
        </div>
      </div>
    </div>
  );
}

function LaporanPreview() {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 22, padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--amber-3)", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 600 }}>Untung Bersih · 12 Bulan</div>
          <div className="sh-num" style={{ fontSize: 40, fontWeight: 500, color: "var(--paper)", marginTop: 8 }}>Rp&nbsp;482,4<span style={{ fontSize: 22, color: "rgba(251,248,241,0.5)" }}>&thinsp;jt</span></div>
        </div>
        <Chip tone="amber" style={{ background: "rgba(212, 168, 39, 0.2)", color: "var(--amber-3)", borderColor: "rgba(212, 168, 39, 0.3)" }}>↑ 24,8%</Chip>
      </div>
      {/* Bar chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 130, marginBottom: 8 }}>
        {[42, 48, 55, 52, 61, 68, 72, 78, 75, 88, 92, 96].map((v, i) => {
          const isLast = i === 11;
          return (
            <div key={i} style={{ flex: 1, position: "relative" }}>
              <div style={{
                width: "100%",
                height: `${v}%`,
                background: isLast ? "var(--amber)" : "rgba(212, 168, 39, 0.3)",
                borderRadius: "4px 4px 0 0",
              }} />
              {isLast && (
                <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "var(--amber-3)", fontFamily: "var(--f-mono)" }}>96jt</div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "var(--f-mono)", color: "rgba(251,248,241,0.4)" }}>
        {["Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des", "Jan", "Feb", "Mar", "Apr", "Mei"].map(m => <span key={m}>{m}</span>)}
      </div>
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 32 }}>
        <div>
          <div className="sh-eyebrow" style={{ color: "rgba(251,248,241,0.45)" }}>Pendapatan</div>
          <div className="sh-num" style={{ fontSize: 20, fontWeight: 500, color: "var(--paper)", marginTop: 4 }}>Rp&nbsp;1,24&thinsp;M</div>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
        <div>
          <div className="sh-eyebrow" style={{ color: "rgba(251,248,241,0.45)" }}>Biaya</div>
          <div className="sh-num" style={{ fontSize: 20, fontWeight: 500, color: "var(--paper)", marginTop: 4 }}>Rp&nbsp;758&thinsp;jt</div>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
        <div>
          <div className="sh-eyebrow" style={{ color: "rgba(251,248,241,0.45)" }}>Margin</div>
          <div className="sh-num" style={{ fontSize: 20, fontWeight: 500, color: "var(--amber-3)", marginTop: 4 }}>38,9%</div>
        </div>
      </div>
    </div>
  );
}

window.LandingPage = LandingPage;
