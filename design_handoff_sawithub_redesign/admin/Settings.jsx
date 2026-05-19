/* global React, SH, AdminShell */
const { Card, Btn, Chip, I } = window.SH;

function AdminSettingsPage() {
  return (
    <AdminShell active="settings"
      headerActions={
        <>
          <Btn variant="ghost" size="sm">Lihat diff →</Btn>
          <Btn variant="primary" size="sm" leading={<I.check size={14} />}>Simpan (3 perubahan)</Btn>
        </>
      }
    >
      <div style={{ marginBottom: 24 }}>
        <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Konfigurasi platform</div>
        <h1 className="sh-h-2">
          Atur perilaku <em className="sh-italic" style={{ color: "var(--forest)" }}>seluruh aplikasi</em> dari sini.
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 8 }}>
          Semua perubahan akan tercatat di audit log. Beberapa perubahan butuh deploy ulang.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 22 }}>
        {/* Side nav */}
        <Card padded={false} style={{ padding: 12, alignSelf: "start", position: "sticky", top: 100 }}>
          {[
            { l: "Umum", k: "general", active: true },
            { l: "Subscription & billing", k: "billing", warn: true },
            { l: "Feature flags", k: "flags", count: 12 },
            { l: "Email & notif" },
            { l: "Integrasi" },
            { l: "Keamanan" },
            { l: "Backup & restore" },
            { l: "Compliance & DSAR" },
            { l: "Custom branding" },
          ].map((it, i) => (
            <a key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px", borderRadius: 8,
              fontSize: 12.5, fontWeight: 500,
              color: it.active ? "var(--forest)" : "var(--ink-2)",
              background: it.active ? "var(--forest-soft)" : "transparent",
              borderLeft: it.active ? "3px solid var(--forest)" : "3px solid transparent",
              cursor: "pointer",
            }}>
              <span>{it.l}</span>
              {it.warn && <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--amber-2)" }} />}
              {it.count && <span className="sh-num" style={{ fontSize: 10.5, padding: "1px 6px", borderRadius: 4, background: "var(--paper-2)", color: "var(--ink-4)" }}>{it.count}</span>}
            </a>
          ))}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* General */}
          <Card padded={false} style={{ padding: 26 }}>
            <SectionLabelA num="01" title="Identitas platform" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FieldA label="Nama aplikasi"><input className="sh-input" defaultValue="SawitHub" /></FieldA>
              <FieldA label="Domain utama"><input className="sh-input sh-num" defaultValue="sawithub.com" /></FieldA>
              <FieldA label="Email support"><input className="sh-input" defaultValue="support@sawithub.com" /></FieldA>
              <FieldA label="WhatsApp support"><input className="sh-input sh-num" defaultValue="+62 811-7000-0000" /></FieldA>
              <FieldA label="Default timezone"><select className="sh-input" defaultValue="WIB"><option>Asia/Jakarta (WIB)</option></select></FieldA>
              <FieldA label="Default bahasa"><select className="sh-input"><option>Bahasa Indonesia</option></select></FieldA>
            </div>
          </Card>

          {/* Toggles */}
          <Card padded={false} style={{ padding: 26 }}>
            <SectionLabelA num="02" title="Kebijakan operasional" />
            {[
              { l: "Subscription enforcement", sub: "Pengguna lewat trial tanpa bayar diberhentikan setelah 90 hari", on: true, warn: true },
              { l: "Public signup terbuka", sub: "Petani dapat daftar mandiri tanpa undangan", on: true },
              { l: "Onboarding wizard wajib", sub: "Tunjukkan 4-step wizard untuk pengguna baru", on: true },
              { l: "Multi-factor auth (admin)", sub: "Wajibkan 2FA untuk semua akun admin", on: true },
              { l: "Multi-factor auth (user)", sub: "Tawarkan 2FA opsional ke pengguna", on: false },
              { l: "AI fertilizer suggestions", sub: "Tampilkan saran pupuk berdasarkan ML", on: false, beta: true },
              { l: "Maintenance mode", sub: "Aplikasi offline untuk pengguna non-admin", on: false, danger: true },
            ].map((t, i, arr) => (
              <div key={i} style={{ padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--line-2)" : 0, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.l}</span>
                    {t.beta && <Chip tone="amber" style={{ fontFamily: "var(--f-mono)" }}>BETA</Chip>}
                    {t.danger && <Chip tone="terra" style={{ fontFamily: "var(--f-mono)" }}>DANGEROUS</Chip>}
                    {t.warn && <Chip style={{ fontFamily: "var(--f-mono)", background: "var(--amber-tint)", color: "var(--amber-2)", borderColor: "var(--amber-soft)" }}>changed 2h ago</Chip>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 3 }}>{t.sub}</div>
                </div>
                <ToggleA on={t.on} />
              </div>
            ))}
          </Card>

          {/* Feature flag table */}
          <Card padded={false} style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "22px 26px 0" }}>
              <SectionLabelA num="03" title="Feature flags" amber />
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--f-mono)" }}>
              <thead>
                <tr style={{ background: "var(--paper-2)" }}>
                  {["Flag", "Env", "Rollout", "Targeting", "Modified"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-4)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontSize: 12 }}>
                {[
                  { f: "calc_v2", env: "prod", pct: 25, target: "user_id % 4 == 0", mod: "1 hari lalu", color: "var(--amber)" },
                  { f: "whatsapp_otp_login", env: "prod", pct: 100, target: "everyone", mod: "12 hari lalu", color: "var(--forest)" },
                  { f: "ai_yield_predict", env: "staging", pct: 100, target: "internal only", mod: "3 jam lalu", color: "var(--c-sky)" },
                  { f: "dark_mode", env: "prod", pct: 0, target: "disabled", mod: "8 hari lalu", color: "var(--ink-4)" },
                  { f: "koperasi_dashboard", env: "prod", pct: 100, target: "role:koperasi", mod: "2 minggu lalu", color: "var(--forest)" },
                  { f: "stripe_payment", env: "prod", pct: 100, target: "country=ID", mod: "1 bulan lalu", color: "var(--forest)" },
                ].map((r, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--line-2)" }}>
                    <td style={{ padding: "12px 18px", color: "var(--ink-2)", fontWeight: 600 }}>{r.f}</td>
                    <td style={{ padding: "12px 18px" }}>
                      <Chip style={{ fontFamily: "var(--f-mono)", fontSize: 10, background: r.env === "prod" ? "var(--terra-soft)" : "var(--amber-tint)", color: r.env === "prod" ? "var(--terracotta-2)" : "var(--amber-2)", borderColor: "transparent" }}>{r.env}</Chip>
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 80, height: 5, background: "var(--line-soft)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ width: `${r.pct}%`, height: "100%", background: r.color }} />
                        </div>
                        <span className="sh-num" style={{ color: "var(--ink-3)", fontSize: 11.5 }}>{r.pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 18px", color: "var(--ink-3)" }}>{r.target}</td>
                    <td style={{ padding: "12px 18px", color: "var(--ink-4)" }}>{r.mod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function SectionLabelA({ num, title, amber }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 20, fontWeight: 500, color: amber ? "var(--amber-2)" : "var(--forest)" }}>{num}</span>
      <h3 style={{ fontFamily: "var(--f-display)", fontSize: 18, fontWeight: 500 }}>{title}</h3>
      <div style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
    </div>
  );
}

function FieldA({ label, children }) {
  return <div><label className="sh-label" style={{ display: "block", marginBottom: 6 }}>{label}</label>{children}</div>;
}

function ToggleA({ on }) {
  return (
    <div style={{ width: 42, height: 24, borderRadius: 99, background: on ? "var(--forest)" : "var(--line)", position: "relative", cursor: "pointer" }}>
      <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: 99, background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left .2s" }} />
    </div>
  );
}

window.AdminSettingsPage = AdminSettingsPage;
