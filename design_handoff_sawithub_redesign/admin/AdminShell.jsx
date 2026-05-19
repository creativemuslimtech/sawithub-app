/* global React, SH */
const { SawitLogo, Card, Btn, Chip, I, PalmFrond, SoilWaves } = window.SH;

/* ─────────── ADMIN SHELL ─────────── */
function AdminShell({ active = "overview", title, children, headerActions, env = "production" }) {
  return (
    <div className="sh-page" style={{ width: 1440, minHeight: 1000, background: "var(--cream)", display: "flex", position: "relative" }}>
      <div className="sh-grain" />
      <AdminSidebar active={active} />
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <AdminTopbar env={env} headerActions={headerActions} />
        <div style={{ padding: "24px 32px 56px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function AdminSidebar({ active }) {
  const items = [
    { k: "overview",   icon: <I.chart />,   label: "Overview",   note: "Ringkasan sistem", short: "Ov" },
    { k: "users",      icon: <I.user />,    label: "Pengguna",   note: "Kelola akun",      short: "Usr", badge: "12.4k" },
    { k: "revenue",    icon: <I.money />,   label: "Revenue",    note: "Subscription MRR", short: "Rev", badge: "142jt" },
    { k: "apps",       icon: <AppsIcon />,  label: "Apps",       note: "PWA · Android · iOS", short: "App" },
    { k: "data",       icon: <I.leaf />,    label: "Data",       note: "Semua data",       short: "Dat" },
    { k: "analytics",  icon: <AdminBarsIcon />, label: "Analytics",  note: "Tren & cohort",    short: "Ana" },
    { k: "monitoring", icon: <AdminPulseIcon />, label: "Monitor",    note: "API & layanan",    short: "Mon", dot: "ok" },
    { k: "audit",      icon: <I.lock />,    label: "Audit",      note: "Log aktivitas",    short: "Aud" },
    { k: "settings",   icon: <AdminGearIcon />, label: "Pengaturan", note: "Konfigurasi",      short: "Set" },
  ];

  return (
    <aside style={{
      width: 268, flexShrink: 0,
      background: "var(--forest)",
      color: "var(--paper)",
      padding: "22px 14px",
      display: "flex", flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative */}
      <PalmFrond size={460} style={{ position: "absolute", right: -180, top: -100, color: "var(--paper)", opacity: 0.04 }} />
      <SoilWaves width={400} height={80} style={{ position: "absolute", left: 0, bottom: 0, color: "var(--amber)", opacity: 0.14 }} />

      <div style={{ padding: "0 6px 8px", position: "relative" }}>
        <SawitLogo size={24} mono color="var(--paper)" wordColor="var(--paper)" />
        <div style={{
          marginTop: 8, fontSize: 10, color: "var(--amber-3)",
          letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 700,
          fontFamily: "var(--f-mono)",
        }}>
          Admin · v2.4.1
        </div>
      </div>

      {/* Env switcher */}
      <div style={{
        margin: "16px 0 18px",
        padding: 4,
        background: "rgba(0,0,0,0.18)",
        borderRadius: 10,
        display: "flex", gap: 4,
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {[
          { e: "production", l: "Prod", color: "var(--terracotta)" },
          { e: "staging", l: "Staging", color: "var(--amber)" },
          { e: "local", l: "Local", color: "var(--c-sky)" },
        ].map(env => (
          <button key={env.e} style={{
            flex: 1, padding: "6px 0", borderRadius: 7,
            fontSize: 11, fontWeight: 600,
            background: env.e === "production" ? "rgba(184, 84, 43, 0.22)" : "transparent",
            color: env.e === "production" ? "var(--paper)" : "rgba(251,248,241,0.55)",
            border: 0, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: env.color, boxShadow: env.e === "production" ? `0 0 6px ${env.color}` : "none" }} />
            {env.l}
          </button>
        ))}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, position: "relative" }}>
        {items.map(it => (
          <a key={it.k} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", borderRadius: 10,
            fontSize: 13.5, fontWeight: 500,
            color: active === it.k ? "var(--paper)" : "rgba(251,248,241,0.7)",
            background: active === it.k ? "rgba(212, 168, 39, 0.14)" : "transparent",
            border: active === it.k ? "1px solid rgba(212, 168, 39, 0.3)" : "1px solid transparent",
            textDecoration: "none", cursor: "pointer",
            position: "relative",
          }}>
            {active === it.k && (
              <div style={{ position: "absolute", left: -14, top: 8, bottom: 8, width: 3, background: "var(--amber)", borderRadius: "0 2px 2px 0" }} />
            )}
            <span style={{ color: active === it.k ? "var(--amber-3)" : "rgba(251,248,241,0.55)" }}>{it.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div>{it.label}</div>
              <div style={{ fontSize: 10.5, color: "rgba(251,248,241,0.4)", marginTop: 1 }}>{it.note}</div>
            </div>
            {it.badge && (
              <span className="sh-num" style={{ fontSize: 10, padding: "2px 6px", background: "rgba(251,248,241,0.08)", borderRadius: 4, fontFamily: "var(--f-mono)", color: "var(--paper)", fontWeight: 500 }}>{it.badge}</span>
            )}
            {it.dot === "ok" && (
              <span style={{ width: 7, height: 7, borderRadius: 99, background: "#7BC97B", boxShadow: "0 0 4px #7BC97B" }} />
            )}
          </a>
        ))}
      </nav>

      <div style={{ marginTop: "auto", position: "relative" }}>
        {/* System status mini */}
        <div style={{ padding: 14, background: "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: "var(--amber-3)", textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 700, fontFamily: "var(--f-mono)" }}>System</span>
            <Chip tone="forest" style={{ fontSize: 9.5, padding: "2px 8px", background: "rgba(123, 201, 123, 0.18)", color: "#A8D8A8", borderColor: "rgba(123, 201, 123, 0.3)" }}>
              ● Operational
            </Chip>
          </div>
          {[
            { l: "API", v: "98 ms", c: "#7BC97B" },
            { l: "DB", v: "32 ms", c: "#7BC97B" },
            { l: "Queue", v: "0 lag", c: "#7BC97B" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : 0 }}>
              <span style={{ fontSize: 11, color: "rgba(251,248,241,0.7)", fontFamily: "var(--f-mono)" }}>{s.l}</span>
              <span className="sh-num" style={{ fontSize: 11, color: s.c, fontFamily: "var(--f-mono)" }}>{s.v}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "8px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--amber)", color: "var(--forest)", display: "grid", placeItems: "center", fontFamily: "var(--f-display)", fontWeight: 500, fontStyle: "italic" }}>
            R
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Rina Pratiwi</div>
            <div style={{ fontSize: 10.5, color: "rgba(251,248,241,0.5)" }}>Superadmin</div>
          </div>
          <I.more />
        </div>
      </div>
    </aside>
  );
}

function AdminTopbar({ env, headerActions }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 18,
      padding: "16px 32px",
      borderBottom: "1px solid var(--line-2)",
      background: "rgba(245, 240, 232, 0.7)",
      backdropFilter: "blur(10px)",
      position: "sticky", top: 0, zIndex: 5,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
        <span style={{ color: "var(--ink-4)" }}>Admin</span>
        <span style={{ color: "var(--ink-5)" }}>/</span>
        <span style={{ color: "var(--ink-2)", fontWeight: 600 }}>Overview</span>
      </div>

      {/* Command palette */}
      <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
        <span style={{ position: "absolute", left: 14, top: 10, color: "var(--ink-4)" }}><I.search size={16} /></span>
        <input className="sh-input" placeholder="Cari pengguna, kebun, transaksi… atau ketik /" style={{
          height: 38, paddingLeft: 40, background: "var(--paper)", border: "1px solid var(--line-2)", fontSize: 13,
        }} />
        <span style={{ position: "absolute", right: 12, top: 11, fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>⌘K</span>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {/* Env pill */}
        <Chip style={{
          background: env === "production" ? "var(--terra-soft)" : "var(--amber-tint)",
          color: env === "production" ? "var(--terracotta-2)" : "var(--amber-2)",
          borderColor: "transparent",
          fontFamily: "var(--f-mono)",
          letterSpacing: ".08em",
          textTransform: "uppercase",
        }}>
          ● {env}
        </Chip>
        <button style={{ width: 38, height: 38, borderRadius: 99, background: "var(--paper)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--ink-2)", position: "relative" }}>
          <I.bell size={16} />
          <span style={{ position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: 99, background: "var(--terracotta)", border: "2px solid var(--paper)" }} />
        </button>
        {headerActions}
      </div>
    </div>
  );
}

/* Custom admin icons */
function AppsIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7.5" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="3" width="7.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="13" width="7.5" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="17" width="7.5" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function AdminBarsIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 19V11M10 19V5M15 19V8M20 19v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>;
}
function AdminPulseIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 12h4l3-8 4 16 3-8h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
function AdminGearIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>;
}

window.AdminShell = AdminShell;
window.AdminBarsIcon = AdminBarsIcon;
window.AdminPulseIcon = AdminPulseIcon;
window.AdminGearIcon = AdminGearIcon;
