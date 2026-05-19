/* global React, SH */
const { SawitLogo, PalmFrond, SoilWaves, SunRays, Card, Btn, Chip, I } = window.SH;

function AdminLoginPage() {
  return (
    <div className="sh-page" style={{ width: 1440, height: 900, position: "relative", overflow: "hidden", background: "var(--ink)", color: "var(--paper)" }}>
      {/* Background */}
      <PalmFrond size={900} style={{ position: "absolute", right: -240, top: -200, color: "var(--paper)", opacity: 0.04 }} />
      <SoilWaves width={1200} height={180} style={{ position: "absolute", left: 0, bottom: 0, color: "var(--amber)", opacity: 0.14, width: "100%" }} />
      <SunRays size={180} style={{ position: "absolute", left: 80, top: 100, color: "var(--amber-3)", opacity: 0.1 }} />

      {/* Top strip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <SawitLogo size={24} mono color="var(--paper)" wordColor="var(--paper)" />
        <div style={{ display: "flex", gap: 14, alignItems: "center", fontFamily: "var(--f-mono)", fontSize: 11.5 }}>
          <Chip style={{ background: "rgba(184, 84, 43, 0.18)", color: "var(--paper)", borderColor: "rgba(184, 84, 43, 0.3)", fontFamily: "var(--f-mono)", letterSpacing: ".08em", textTransform: "uppercase" }}>● Production</Chip>
          <span style={{ color: "rgba(251,248,241,0.5)" }}>region: id-jakarta-1</span>
          <span style={{ color: "rgba(251,248,241,0.5)" }}>v2.4.1</span>
        </div>
      </div>

      {/* Center form */}
      <div style={{ display: "grid", placeItems: "center", padding: "60px 48px", position: "relative" }}>
        <div style={{ width: 460, position: "relative", zIndex: 2 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "var(--amber-3)", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 700, marginBottom: 14, fontFamily: "var(--f-mono)" }}>—— Staff portal · Restricted</div>
            <h1 className="sh-h-1" style={{ color: "var(--paper)" }}>
              Masuk ke <em className="sh-italic" style={{ color: "var(--amber-3)" }}>Command&nbsp;Center</em>.
            </h1>
            <p style={{ fontSize: 14, color: "rgba(251,248,241,0.7)", marginTop: 14, lineHeight: 1.55 }}>
              Hanya untuk staf SawitHub yang terdaftar. Semua akses dicatat dan diaudit secara real-time.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(251,248,241,0.7)", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>Email perusahaan</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: 14, color: "rgba(251,248,241,0.4)" }}><I.mail size={18} /></span>
                  <input style={{
                    width: "100%", height: 48, padding: "0 14px 0 42px",
                    borderRadius: 10, background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontFamily: "var(--f-mono)", fontSize: 13, color: "var(--paper)",
                  }} defaultValue="rina.pratiwi@sawithub.com" />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(251,248,241,0.7)", letterSpacing: ".05em" }}>Kata sandi</label>
                  <a style={{ fontSize: 11, color: "var(--amber-3)", fontWeight: 600 }}>Reset via SSO</a>
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: 14, color: "rgba(251,248,241,0.4)" }}><I.lock size={18} /></span>
                  <input type="password" style={{
                    width: "100%", height: 48, padding: "0 14px 0 42px",
                    borderRadius: 10, background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontFamily: "var(--f-mono)", fontSize: 13, color: "var(--paper)",
                  }} defaultValue="••••••••••••" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(251,248,241,0.7)", letterSpacing: ".05em", display: "block", marginBottom: 6 }}>Kode 2FA (TOTP)</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                  {[4, 2, 9, 1, 8, 3].map((d, i) => (
                    <input key={i} maxLength={1} defaultValue={d} style={{
                      height: 48, textAlign: "center",
                      borderRadius: 10, background: "rgba(0,0,0,0.25)",
                      border: i === 5 ? "1.5px solid var(--amber-3)" : "1px solid rgba(255,255,255,0.12)",
                      fontFamily: "var(--f-mono)", fontSize: 18, fontWeight: 500, color: "var(--paper)",
                    }} />
                  ))}
                </div>
              </div>

              <button style={{
                marginTop: 6, height: 50,
                background: "var(--amber)", color: "#2B1F00",
                borderRadius: 10, border: 0,
                fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 700,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                Masuk ke Command Center <I.arrow size={16} />
              </button>

              <div style={{ marginTop: 6, padding: 12, background: "rgba(184, 84, 43, 0.1)", border: "1px solid rgba(184, 84, 43, 0.25)", borderRadius: 10, display: "flex", gap: 10, alignItems: "start" }}>
                <span style={{ color: "var(--terracotta)", marginTop: 1 }}>●</span>
                <div style={{ fontSize: 11.5, color: "rgba(251,248,241,0.8)", lineHeight: 1.55, fontFamily: "var(--f-mono)" }}>
                  Login dari IP <span style={{ color: "var(--paper)", fontWeight: 600 }}>182.1.x.x</span> — sesi akan terkunci 8 jam, lalu re-auth.
                  Akses tak sah akan dilaporkan ke security@sawithub dalam 30 detik.
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, fontSize: 11.5, color: "rgba(251,248,241,0.5)", textAlign: "center", fontFamily: "var(--f-mono)" }}>
            Bukan staf? <a style={{ color: "var(--amber-3)" }}>Buka aplikasi petani →</a>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 48px", display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--f-mono)", fontSize: 11, color: "rgba(251,248,241,0.5)" }}>
        <span>Last successful login · 12 jam lalu · MacBook Pro · Chrome 124</span>
        <span>build a8f3b2c · uptime 99,98% · 14:32 WIB</span>
      </div>
    </div>
  );
}

window.AdminLoginPage = AdminLoginPage;
