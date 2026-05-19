/* global React, SH */
const { SawitLogo, PalmFrond, PalmLeaf, SunRays, SoilWaves, Card, Btn, Chip, I } = window.SH;
const { useState: useStateLogin } = React;

function LoginPage() {
  const [pwShown, setPwShown] = useStateLogin(false);
  return (
    <div className="sh-page" style={{ width: 1440, height: 900, position: "relative", overflow: "hidden", background: "var(--cream)" }}>
      <div className="sh-grain" />

      {/* Left editorial panel */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 640,
        background: "var(--forest)",
        padding: "44px 56px",
        display: "flex", flexDirection: "column",
        color: "var(--paper)",
        overflow: "hidden",
      }}>
        <PalmFrond size={620} style={{ position: "absolute", right: -160, top: -80, color: "var(--paper)", opacity: 0.07 }} />
        <SoilWaves width={520} height={120} style={{ position: "absolute", left: 0, bottom: 0, color: "var(--amber)", opacity: 0.15 }} />
        <SunRays size={120} style={{ position: "absolute", left: 64, top: 220, color: "var(--amber-3)", opacity: 0.16 }} />

        <SawitLogo size={28} mono />
        
        <div style={{ marginTop: "auto", marginBottom: 80, position: "relative" }}>
          <div style={{ fontSize: 11, color: "var(--amber-3)", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600, marginBottom: 18 }}>—— Selamat datang kembali</div>
          <h1 className="sh-h-1" style={{ color: "var(--paper)", maxWidth: 480, marginBottom: 26 }}>
            Catatan kebun yang <em className="sh-italic" style={{ color: "var(--amber-3)" }}>tak&nbsp;pernah&nbsp;basah</em> kena hujan.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(251,248,241,0.7)", maxWidth: 460, lineHeight: 1.55 }}>
            Buka SawitHub dan lanjutkan dari panen terakhir kemarin. Semua data tersimpan di tempat yang sama.
          </p>
        </div>

        {/* Quote card */}
        <Card padded={false} style={{
          background: "rgba(255,255,255,0.06)",
          borderColor: "rgba(255,255,255,0.12)",
          padding: 22,
          position: "relative",
          color: "var(--paper)",
        }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 48, color: "var(--amber-3)", lineHeight: 0.5, marginBottom: 8 }}>"</div>
          <p style={{ fontFamily: "var(--f-display)", fontSize: 18, lineHeight: 1.45, fontWeight: 400, color: "var(--paper)" }}>
            Sebelum pakai, catatan panen ada di buku tulis. Sekarang anak saya foto setruk timbangan, dan saya tahu untungnya berapa malam itu juga.
          </p>
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: "var(--amber-soft)", color: "var(--forest)", display: "grid", placeItems: "center" }}>
              <I.user size={16} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Pak Suparman</div>
              <div style={{ fontSize: 11, color: "rgba(251,248,241,0.6)" }}>Petani · Riau · 3,2 ha</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right form */}
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, left: 640, display: "grid", placeItems: "center", padding: 40 }}>
        <div style={{ width: 440, position: "relative" }}>
          <PalmLeaf size={140} style={{ position: "absolute", right: -40, top: -80, color: "var(--forest)", opacity: 0.1, transform: "rotate(20deg)" }} />
          <div style={{ position: "relative" }}>
            <div className="sh-eyebrow" style={{ marginBottom: 12 }}>—— Masuk ke akun</div>
            <h2 className="sh-h-2" style={{ marginBottom: 12 }}>Lanjutkan ke kebun kamu.</h2>
            <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 32 }}>
              Belum punya akun? <a style={{ color: "var(--forest)", fontWeight: 600 }}>Daftar gratis →</a>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="sh-label" style={{ display: "block", marginBottom: 6 }}>Nomor WhatsApp atau email</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-4)" }}><I.mail size={18} /></span>
                  <input className="sh-input" style={{ paddingLeft: 42 }} defaultValue="suparman@kopsawitriau.id" />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="sh-label">Kata sandi</label>
                  <a style={{ fontSize: 12, color: "var(--forest)", fontWeight: 600 }}>Lupa kata sandi?</a>
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: 14, color: "var(--ink-4)" }}><I.lock size={18} /></span>
                  <input className="sh-input" type={pwShown ? "text" : "password"} style={{ paddingLeft: 42, paddingRight: 80 }} defaultValue="••••••••••" />
                  <button onClick={() => setPwShown(v => !v)}
                    style={{ position: "absolute", right: 12, top: 12, height: 24, padding: "0 10px", borderRadius: 99,
                    background: "var(--paper-2)", color: "var(--ink-2)", border: "1px solid var(--line)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    {pwShown ? "Sembunyi" : "Tampil"}
                  </button>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-2)", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "var(--forest)" }} />
                Ingat saya di perangkat ini
              </label>

              <Btn variant="primary" size="lg" style={{ width: "100%", marginTop: 6 }} trailing={<I.arrow size={16} />}>
                Masuk ke SawitHub
              </Btn>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                <span style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: ".1em", textTransform: "uppercase" }}>atau lewat</span>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Btn variant="ghost" leading={<span style={{ fontWeight: 700, color: "#25D366", fontSize: 18 }}>◉</span>}>
                  WhatsApp OTP
                </Btn>
                <Btn variant="ghost" leading={<span style={{ fontFamily: "Fraunces", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>G</span>}>
                  Google
                </Btn>
              </div>

              <div style={{ fontSize: 12, color: "var(--ink-4)", textAlign: "center", marginTop: 14, lineHeight: 1.55 }}>
                Dengan masuk, kamu setuju dengan <a style={{ color: "var(--forest)", textDecoration: "underline" }}>Syarat Layanan</a> dan
                <a style={{ color: "var(--forest)", textDecoration: "underline" }}> Kebijakan Privasi</a> SawitHub.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LoginPage = LoginPage;
