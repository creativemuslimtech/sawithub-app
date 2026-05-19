/* global React, SH, AdminShell */
const { Card, Btn, Chip, I } = window.SH;

function AdminAuditPage() {
  const entries = [
    { t: "14:32:08", who: "rina.pratiwi@sawithub", act: "user.role.change", target: "yusran.medan → admin", sev: "high", ip: "182.1.x.x", ua: "macOS · Chrome 124", req: "req_a8f3b2", ok: true },
    { t: "14:18:42", who: "system.cron", act: "backup.daily.complete", target: "panen, perawatan, users (4.2 GB)", sev: "info", ip: "—", ua: "internal", req: "req_b21c4e", ok: true },
    { t: "13:44:18", who: "rina.pratiwi@sawithub", act: "subscription.refund", target: "yusran.medan · Rp 49.000", sev: "high", ip: "182.1.x.x", ua: "macOS · Chrome 124", req: "req_c142a9", ok: true, expand: true },
    { t: "13:08:54", who: "andra.devops@sawithub", act: "config.update", target: "SUBSCRIPTION_ENFORCEMENT = true", sev: "critical", ip: "103.4.x.x", ua: "Linux · CLI v3.2", req: "req_d8e2f1", ok: true },
    { t: "12:54:22", who: "system.api", act: "user.password.reset.requested", target: "ibu.maria.aceh", sev: "low", ip: "36.84.x.x", ua: "Android · Chrome 124", req: "req_e7a44c", ok: true },
    { t: "12:18:08", who: "andra.devops@sawithub", act: "feature_flag.toggle", target: "calc_v2 = ON (rollout 25%)", sev: "med", ip: "103.4.x.x", ua: "Linux · CLI v3.2", req: "req_f9b18d", ok: true },
    { t: "11:42:36", who: "rina.pratiwi@sawithub", act: "user.deactivate", target: "joko.lampung (alasan: 26 hari tidak aktif)", sev: "med", ip: "182.1.x.x", ua: "macOS · Chrome 124", req: "req_g214a8", ok: true },
    { t: "11:08:02", who: "system.api", act: "data.export", target: "PII export · 1 user (request DSAR)", sev: "high", ip: "—", ua: "internal", req: "req_h32f0c", ok: true },
    { t: "10:24:48", who: "unknown.attacker", act: "auth.brute_force.blocked", target: "admin@sawithub · 12 attempts", sev: "critical", ip: "45.142.x.x", ua: "curl/8.4", req: "req_i48e2b", ok: false },
    { t: "09:18:14", who: "andra.devops@sawithub", act: "deploy.production", target: "core-api v2.4.1 (commit a8f3b2c)", sev: "med", ip: "103.4.x.x", ua: "GitHub Actions", req: "req_j81a04", ok: true },
  ];

  return (
    <AdminShell active="audit"
      headerActions={
        <>
          <Btn variant="ghost" size="sm">Tail mode →</Btn>
          <Btn variant="primary" size="sm" leading={<I.download size={14} />}>Ekspor (CSV/JSON)</Btn>
        </>
      }
    >
      <div style={{ marginBottom: 24, display: "flex", alignItems: "end", justifyContent: "space-between" }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Audit log · WORM · retensi 7 tahun</div>
          <h1 className="sh-h-2">
            18,2 jt event terverifikasi — <em className="sh-italic" style={{ color: "var(--forest)" }}>nothing&nbsp;hidden</em>.
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 8, fontFamily: "var(--f-mono)" }}>
            Hash chain integrity: <span style={{ color: "var(--forest)" }}>✓ verified</span> · Last block: a8f3b2c89...d214 · 12 detik lalu
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { l: "Critical", n: 2, c: "var(--terracotta-2)" },
            { l: "High", n: 18, c: "var(--terracotta)" },
            { l: "Med", n: 124, c: "var(--amber-2)" },
            { l: "Low / Info", n: 412, c: "var(--c-sky)" },
          ].map(s => (
            <div key={s.l} style={{ padding: "10px 14px", background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 10, textAlign: "center", minWidth: 80 }}>
              <div style={{ fontSize: 10, color: s.c, textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700, fontFamily: "var(--f-mono)" }}>{s.l}</div>
              <div className="sh-num" style={{ fontSize: 18, fontWeight: 500, marginTop: 4, color: "var(--ink)" }}>{s.n}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter row */}
      <Card padded={false} style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: "var(--f-mono)", fontSize: 12 }}>
          <span style={{ color: "var(--ink-4)" }}>$</span>
          <input className="sh-input" style={{ height: 36, fontSize: 12, fontFamily: "var(--f-mono)", flex: 1 }}
            defaultValue='actor:rina.pratiwi action:subscription.* severity:>=high since:24h' />
          <Btn variant="primary" size="sm">Apply filter</Btn>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, fontSize: 10.5, fontFamily: "var(--f-mono)" }}>
          <span style={{ color: "var(--ink-4)" }}>Quick filters:</span>
          {["All", "Auth events", "Billing changes", "Config changes", "Data exports", "Failed", "By me"].map((q, i) => (
            <button key={q} style={{
              padding: "3px 10px", borderRadius: 5,
              background: i === 0 ? "var(--ink)" : "var(--paper-2)",
              color: i === 0 ? "var(--paper)" : "var(--ink-3)",
              border: "1px solid var(--line-2)", fontSize: 10.5, fontFamily: "var(--f-mono)", cursor: "pointer",
            }}>{q}</button>
          ))}
        </div>
      </Card>

      {/* Log entries — terminal-style stream */}
      <Card padded={false} style={{ padding: 0, overflow: "hidden", background: "var(--ink)", color: "var(--paper)", border: "1px solid var(--ink)" }}>
        <div style={{ padding: "12px 20px", background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 5 }}>
              <span style={{ width: 11, height: 11, borderRadius: 99, background: "#FF6058" }} />
              <span style={{ width: 11, height: 11, borderRadius: 99, background: "#FFC131" }} />
              <span style={{ width: 11, height: 11, borderRadius: 99, background: "#28CA42" }} />
            </div>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "rgba(251,248,241,0.6)" }}>audit.log · live stream</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: "#7BC97B", boxShadow: "0 0 6px #7BC97B" }} />
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "rgba(251,248,241,0.6)" }}>Following · 12.4 events/s</span>
          </div>
        </div>

        <div style={{ padding: 0, fontFamily: "var(--f-mono)", fontSize: 12.5 }}>
          {entries.map((e, i) => {
            const sevColor = e.sev === "critical" ? "#FF6058" : e.sev === "high" ? "#FFB14E" : e.sev === "med" ? "#FFD66B" : e.sev === "low" ? "#7BC97B" : "rgba(251,248,241,0.5)";
            return (
              <div key={i} style={{
                padding: "10px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: e.expand ? "rgba(212, 168, 39, 0.05)" : "transparent",
                display: "grid",
                gridTemplateColumns: "84px 70px 200px 1fr 200px",
                gap: 14, alignItems: "center",
              }}>
                <span style={{ color: "rgba(251,248,241,0.4)" }}>{e.t}</span>
                <span style={{ color: sevColor, fontWeight: 600, textTransform: "uppercase", fontSize: 10.5 }}>
                  ● {e.sev}
                </span>
                <span style={{ color: e.ok ? "#A8D8A8" : "#FF8B6B", fontWeight: 500 }}>{e.act}</span>
                <span style={{ color: "var(--paper)" }}>
                  <span style={{ color: "rgba(251,248,241,0.5)" }}>actor</span>=<span style={{ color: "#FFD66B" }}>{e.who}</span>{" "}
                  <span style={{ color: "rgba(251,248,241,0.5)" }}>target</span>=<span style={{ color: "var(--paper)" }}>{e.target}</span>
                </span>
                <span style={{ color: "rgba(251,248,241,0.4)", fontSize: 11, textAlign: "right" }}>
                  {e.req} · {e.ip}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, fontFamily: "var(--f-mono)", color: "var(--ink-4)" }}>
        <span>Menampilkan 10 · 412 events matching · query 0.04s</span>
        <span>Press <kbd style={{ padding: "1px 5px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 3, fontSize: 10.5 }}>j</kbd>/<kbd style={{ padding: "1px 5px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 3, fontSize: 10.5 }}>k</kbd> to navigate · <kbd style={{ padding: "1px 5px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 3, fontSize: 10.5 }}>/</kbd> to filter</span>
      </div>
    </AdminShell>
  );
}

window.AdminAuditPage = AdminAuditPage;
