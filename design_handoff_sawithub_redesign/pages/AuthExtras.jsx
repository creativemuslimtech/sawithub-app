/* global React, SH */
const { SawitLogo, PalmFrond, PalmLeaf, SunRays, SoilWaves, Card, Btn, Chip, I } = window.SH;

/* Shared two-column auth layout */
function AuthShell({ eyebrow, headline, sub, children, footer, quote }) {
  return (
    <div className="sh-page" style={{ width: 1440, height: 900, position: "relative", overflow: "hidden", background: "var(--cream)" }}>
      <div className="sh-grain" />

      {/* Left editorial panel */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 640,
        background: "var(--forest)", padding: "44px 56px",
        display: "flex", flexDirection: "column", color: "var(--paper)", overflow: "hidden",
      }}>
        <PalmFrond size={620} style={{ position: "absolute", right: -160, top: -80, color: "var(--paper)", opacity: 0.07 }} />
        <SoilWaves width={520} height={120} style={{ position: "absolute", left: 0, bottom: 0, color: "var(--amber)", opacity: 0.15 }} />
        <SunRays size={120} style={{ position: "absolute", left: 64, top: 220, color: "var(--amber-3)", opacity: 0.16 }} />

        <SawitLogo size={28} mono />

        <div style={{ marginTop: "auto", marginBottom: 80, position: "relative" }}>
          <div style={{ fontSize: 11, color: "var(--amber-3)", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600, marginBottom: 18 }}>—— {eyebrow}</div>
          <h1 className="sh-h-1" style={{ color: "var(--paper)", maxWidth: 480, marginBottom: 26 }}>
            {headline}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(251,248,241,0.7)", maxWidth: 460, lineHeight: 1.55 }}>
            {sub}
          </p>
        </div>

        {quote && (
          <Card padded={false} style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", padding: 22, color: "var(--paper)" }}>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 48, color: "var(--amber-3)", lineHeight: 0.5, marginBottom: 8 }}>"</div>
            <p style={{ fontFamily: "var(--f-display)", fontSize: 17, lineHeight: 1.45, color: "var(--paper)" }}>{quote.text}</p>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--amber-soft)", color: "var(--forest)", display: "grid", placeItems: "center" }}>
                <I.user size={14} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{quote.name}</div>
                <div style={{ fontSize: 10.5, color: "rgba(251,248,241,0.6)" }}>{quote.role}</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Right form */}
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, left: 640, display: "grid", placeItems: "center", padding: 40 }}>
        <div style={{ width: 480, position: "relative" }}>
          <PalmLeaf size={140} style={{ position: "absolute", right: -40, top: -80, color: "var(--forest)", opacity: 0.1, transform: "rotate(20deg)" }} />
          <div style={{ position: "relative" }}>
            {children}
            {footer && <div style={{ marginTop: 28, fontSize: 12, color: "var(--ink-4)", textAlign: "center", lineHeight: 1.6 }}>{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SIGNUP ─── */
function SignupPage() {
  return (
    <AuthShell
      eyebrow="Daftar gratis · 14 hari"
      headline={<>Mulai dari <em className="sh-italic" style={{ color: "var(--amber-3)" }}>panen&nbsp;minggu&nbsp;ini</em>.</>}
      sub="Buat akun dalam 2 menit. Tanpa kartu kredit. Catat panen pertama hari ini juga."
      quote={{ text: "Hasil panen naik 14% dalam setahun. Jadwal pupuknya tidak pernah terlewat.", name: "Pak Yusran", role: "Petani · Sumut · 8,5 ha" }}
    >
      <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Buat akun</div>
      <h2 className="sh-h-3" style={{ marginBottom: 10 }}>Gabung 12.418 petani.</h2>
      <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 26 }}>
        Sudah punya akun? <a style={{ color: "var(--forest)", fontWeight: 600 }}>Masuk →</a>
      </p>

      {/* Role choice */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        {[
          { l: "Petani", sub: "Kebun pribadi / keluarga", icon: <I.leaf />, active: true },
          { l: "Koperasi", sub: "Pengurus kelompok tani", icon: <I.user />, active: false },
        ].map(r => (
          <button key={r.l} style={{
            padding: 14, borderRadius: 12,
            border: `1.5px solid ${r.active ? "var(--forest)" : "var(--line)"}`,
            background: r.active ? "var(--forest-tint)" : "var(--surface)",
            textAlign: "left", cursor: "pointer", position: "relative",
          }}>
            {r.active && <div style={{ position: "absolute", top: 10, right: 10, width: 16, height: 16, borderRadius: 99, background: "var(--forest)", color: "var(--paper)", display: "grid", placeItems: "center" }}><I.check size={10} /></div>}
            <div style={{ color: r.active ? "var(--forest)" : "var(--ink-3)", marginBottom: 8 }}>{r.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{r.l}</div>
            <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>{r.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label className="sh-label" style={{ display: "block", marginBottom: 6 }}>Nama lengkap</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-4)" }}><I.user size={18} /></span>
            <input className="sh-input" style={{ paddingLeft: 42 }} defaultValue="Suparman Hidayat" />
          </div>
        </div>
        <div>
          <label className="sh-label" style={{ display: "block", marginBottom: 6 }}>Nomor WhatsApp</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 14, fontFamily: "var(--f-mono)", fontSize: 13, color: "var(--ink-3)" }}>+62</span>
            <input className="sh-input sh-num" style={{ paddingLeft: 50 }} defaultValue="812 7321 8845" />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 5 }}>Kami kirim kode OTP untuk verifikasi · gratis</div>
        </div>
        <div>
          <label className="sh-label" style={{ display: "block", marginBottom: 6 }}>Buat kata sandi</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-4)" }}><I.lock size={18} /></span>
            <input type="password" className="sh-input" style={{ paddingLeft: 42 }} defaultValue="••••••••••" />
          </div>
          {/* Strength */}
          <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
            {[1, 2, 3, 4].map(b => (
              <div key={b} style={{ flex: 1, height: 4, borderRadius: 99, background: b <= 3 ? "var(--forest)" : "var(--line)" }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--forest)", marginTop: 5, fontWeight: 500 }}>Kuat · minimal 8 karakter, ada angka</div>
        </div>

        <label style={{ display: "flex", alignItems: "start", gap: 10, fontSize: 12, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.55 }}>
          <input type="checkbox" defaultChecked style={{ accentColor: "var(--forest)", marginTop: 3 }} />
          <span>Saya setuju dengan <a style={{ color: "var(--forest)", fontWeight: 600 }}>Syarat Layanan</a> dan <a style={{ color: "var(--forest)", fontWeight: 600 }}>Kebijakan Privasi</a> SawitHub.</span>
        </label>

        <Btn variant="primary" size="lg" style={{ width: "100%", marginTop: 6 }} trailing={<I.arrow size={16} />}>
          Mulai gratis 14 hari
        </Btn>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <span style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: ".1em", textTransform: "uppercase" }}>atau daftar lewat</span>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Btn variant="ghost" leading={<span style={{ fontWeight: 700, color: "#25D366" }}>◉</span>}>WhatsApp</Btn>
          <Btn variant="ghost" leading={<span style={{ fontFamily: "Fraunces", fontSize: 16, fontWeight: 600 }}>G</span>}>Google</Btn>
        </div>
      </div>
    </AuthShell>
  );
}

/* ─── FORGOT PASSWORD ─── */
function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Reset kata sandi"
      headline={<>Tenang, kami <em className="sh-italic" style={{ color: "var(--amber-3)" }}>bantu&nbsp;ingat</em>.</>}
      sub="Masukkan email atau nomor WhatsApp yang terdaftar. Kami kirim link untuk membuat kata sandi baru."
    >
      <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Lupa kata sandi</div>
      <h2 className="sh-h-3" style={{ marginBottom: 10 }}>Cari akun kamu.</h2>
      <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 26 }}>
        Sudah ingat? <a style={{ color: "var(--forest)", fontWeight: 600 }}>Kembali ke login →</a>
      </p>

      {/* Method tabs */}
      <div style={{ display: "flex", padding: 4, background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 10, marginBottom: 18 }}>
        {[
          { l: "Via WhatsApp", active: true, icon: "◉" },
          { l: "Via Email", active: false, icon: "✉" },
        ].map(t => (
          <button key={t.l} style={{
            flex: 1, padding: "10px 16px", borderRadius: 7,
            fontSize: 13, fontWeight: 600,
            background: t.active ? "var(--forest)" : "transparent",
            color: t.active ? "var(--paper)" : "var(--ink-3)",
            border: 0, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span>{t.icon}</span>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="sh-label" style={{ display: "block", marginBottom: 6 }}>Nomor WhatsApp terdaftar</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 14, fontFamily: "var(--f-mono)", fontSize: 13, color: "var(--ink-3)" }}>+62</span>
            <input className="sh-input sh-num" style={{ paddingLeft: 50 }} defaultValue="812 7321 8845" />
          </div>
        </div>

        <div style={{ padding: 16, background: "var(--forest-tint)", border: "1px solid var(--forest-soft)", borderRadius: 12, display: "flex", gap: 12, alignItems: "start" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--forest)", color: "var(--paper)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <I.check size={14} />
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--ink)" }}>Akun ditemukan.</strong> Kami akan kirim kode 6-digit ke WhatsApp kamu dalam 30 detik.
          </div>
        </div>

        <Btn variant="primary" size="lg" style={{ width: "100%" }} trailing={<I.arrow size={16} />}>
          Kirim kode reset
        </Btn>

        <div style={{ paddingTop: 18, borderTop: "1px solid var(--line-2)", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>Masih tidak bisa masuk?</div>
          <Btn variant="ghost" size="sm">Hubungi support via WhatsApp</Btn>
        </div>
      </div>
    </AuthShell>
  );
}

/* ─── RESET PASSWORD ─── */
function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Buat sandi baru"
      headline={<>Sandi baru, <em className="sh-italic" style={{ color: "var(--amber-3)" }}>kebun&nbsp;sama</em>.</>}
      sub="Buat kata sandi yang kuat. Setelah ini, kamu akan otomatis masuk ke kebun-mu."
    >
      <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Reset kata sandi</div>
      <h2 className="sh-h-3" style={{ marginBottom: 10 }}>Kata sandi baru.</h2>
      <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 26 }}>
        Untuk akun <strong style={{ color: "var(--ink)", fontWeight: 600 }}>suparman@kopsawitriau.id</strong>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="sh-label" style={{ display: "block", marginBottom: 6 }}>Kata sandi baru</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-4)" }}><I.lock size={18} /></span>
            <input type="password" className="sh-input" style={{ paddingLeft: 42, paddingRight: 80 }} defaultValue="••••••••••••" />
            <button style={{ position: "absolute", right: 12, top: 12, height: 24, padding: "0 10px", borderRadius: 99, background: "var(--paper-2)", color: "var(--ink-2)", border: "1px solid var(--line)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Tampil</button>
          </div>
        </div>

        <div>
          <label className="sh-label" style={{ display: "block", marginBottom: 6 }}>Ulangi kata sandi</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-4)" }}><I.lock size={18} /></span>
            <input type="password" className="sh-input" style={{ paddingLeft: 42, paddingRight: 50 }} defaultValue="••••••••••••" />
            <span style={{ position: "absolute", right: 14, top: 14, color: "var(--forest)" }}><I.check size={18} /></span>
          </div>
        </div>

        {/* Strength meter */}
        <div style={{ padding: 16, background: "var(--cream)", border: "1px solid var(--line-2)", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Kekuatan sandi</span>
            <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>Sangat kuat</Chip>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {[1, 2, 3, 4].map(b => (
              <div key={b} style={{ flex: 1, height: 5, borderRadius: 99, background: "var(--forest)" }} />
            ))}
          </div>
          {[
            { l: "Minimal 8 karakter (12 karakter)", ok: true },
            { l: "Ada huruf besar & kecil", ok: true },
            { l: "Ada angka atau simbol", ok: true },
            { l: "Bukan sandi yang pernah dipakai", ok: true },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: c.ok ? "var(--forest)" : "var(--ink-4)", marginBottom: 5 }}>
              <I.check size={12} />
              {c.l}
            </div>
          ))}
        </div>

        <Btn variant="primary" size="lg" style={{ width: "100%", marginTop: 4 }} trailing={<I.arrow size={16} />}>
          Simpan dan masuk
        </Btn>
      </div>
    </AuthShell>
  );
}

/* ─── OTP VERIFICATION ─── */
function OtpVerifyPage() {
  return (
    <AuthShell
      eyebrow="Verifikasi 1 langkah lagi"
      headline={<>Cek <em className="sh-italic" style={{ color: "var(--amber-3)" }}>WhatsApp&nbsp;kamu</em>.</>}
      sub="Kami kirim kode 6-digit ke nomor WhatsApp yang terdaftar. Ketik kode di sebelah kanan untuk lanjutkan."
    >
      <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Verifikasi WhatsApp</div>
      <h2 className="sh-h-3" style={{ marginBottom: 10 }}>Masukkan kode.</h2>
      <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginBottom: 26, lineHeight: 1.55 }}>
        Kode dikirim ke <strong style={{ color: "var(--ink)" }}>+62 812-•••-•845</strong>.
        Salah nomor? <a style={{ color: "var(--forest)", fontWeight: 600 }}>Ganti nomor →</a>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label className="sh-label" style={{ display: "block", marginBottom: 10 }}>Kode 6-digit</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {[4, 2, 9, 1, 8, ""].map((d, i) => (
              <input key={i} maxLength={1} defaultValue={d} style={{
                height: 60, textAlign: "center",
                borderRadius: 12, background: "var(--surface)",
                border: i === 5 ? "1.5px solid var(--forest)" : "1px solid var(--line)",
                boxShadow: i === 5 ? "0 0 0 4px rgba(45, 90, 61, .12)" : "none",
                fontFamily: "var(--f-mono)", fontSize: 26, fontWeight: 500, color: "var(--ink)",
              }} />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div style={{ padding: 14, background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 99, background: "var(--amber-tint)", color: "var(--amber-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <I.cal size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Kode kedaluwarsa dalam <span className="sh-num" style={{ color: "var(--amber-2)" }}>02:14</span></div>
            <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>Tidak menerima kode? <a style={{ color: "var(--forest)", fontWeight: 600 }}>Kirim ulang dalam 0:42</a></div>
          </div>
        </div>

        <Btn variant="primary" size="lg" style={{ width: "100%" }} trailing={<I.check size={16} />}>
          Verifikasi & masuk
        </Btn>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Btn variant="ghost" size="sm">Kirim via SMS</Btn>
          <Btn variant="ghost" size="sm">Kirim via panggilan</Btn>
        </div>
      </div>
    </AuthShell>
  );
}

/* ─── 404 ─── */
function NotFoundPage() {
  return (
    <div className="sh-page" style={{ width: 1440, height: 900, background: "var(--cream)", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
      <div className="sh-grain" />
      <PalmFrond size={700} style={{ position: "absolute", right: -200, top: -120, color: "var(--forest)", opacity: 0.08 }} />
      <PalmFrond size={500} style={{ position: "absolute", left: -160, bottom: -100, color: "var(--amber-2)", opacity: 0.1, transform: "rotate(180deg)" }} />
      <SunRays size={180} style={{ position: "absolute", left: "30%", top: 100, color: "var(--amber-2)", opacity: 0.14 }} />

      <div style={{ position: "absolute", top: 32, left: 56 }}>
        <SawitLogo size={26} />
      </div>

      <div style={{ textAlign: "center", maxWidth: 640, position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 240, fontWeight: 400, color: "var(--forest)", lineHeight: 0.9, letterSpacing: "-0.05em", marginBottom: 18 }}>
          404
        </div>
        <div className="sh-eyebrow" style={{ marginBottom: 14 }}>—— Halaman tidak ditemukan</div>
        <h1 className="sh-h-2" style={{ marginBottom: 18 }}>
          Sepertinya halaman ini <em className="sh-italic" style={{ color: "var(--amber-2)" }}>tersesat&nbsp;di&nbsp;kebun</em>.
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px" }}>
          URL yang kamu buka mungkin sudah pindah atau tidak pernah ada. Coba kembali ke beranda atau cari yang lain.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 36 }}>
          <Btn variant="primary" size="lg" leading={<I.home size={16} />}>Kembali ke dashboard</Btn>
          <Btn variant="ghost" size="lg" leading={<I.search size={16} />}>Cari halaman lain</Btn>
        </div>

        {/* Quick links */}
        <div style={{ padding: 22, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, textAlign: "left" }}>
          <div className="sh-eyebrow" style={{ marginBottom: 14, textAlign: "center" }}>Atau coba salah satu ini</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { l: "Catat panen TBS", url: "/panen/add", icon: <I.basket /> },
              { l: "Harga TBS hari ini", url: "/harga-tbs", icon: <I.star /> },
              { l: "Laporan keuangan", url: "/laporan-keuangan", icon: <I.chart /> },
              { l: "Kalkulator pupuk", url: "/kalkulator-pupuk", icon: <I.calc /> },
            ].map(l => (
              <a key={l.l} style={{
                padding: "12px 14px", borderRadius: 10,
                background: "var(--cream)", border: "1px solid var(--line-2)",
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textDecoration: "none",
              }}>
                <span style={{ color: "var(--forest)" }}>{l.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{l.l}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>{l.url}</div>
                </div>
                <span style={{ color: "var(--ink-4)" }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.SignupPage = SignupPage;
window.ForgotPasswordPage = ForgotPasswordPage;
window.ResetPasswordPage = ResetPasswordPage;
window.OtpVerifyPage = OtpVerifyPage;
window.NotFoundPage = NotFoundPage;
