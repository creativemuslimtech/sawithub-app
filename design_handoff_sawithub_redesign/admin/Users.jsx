/* global React, SH, AdminShell */
const { Card, Btn, Chip, Sparkline, Ring, I } = window.SH;

function AdminUsersPage() {
  return (
    <AdminShell active="users"
      headerActions={
        <>
          <Btn variant="ghost" size="sm" leading={<I.download size={14} />}>Ekspor CSV</Btn>
          <Btn variant="primary" size="sm" leading={<I.plus size={14} />}>Undang Admin</Btn>
        </>
      }
    >
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "end", justifyContent: "space-between" }}>
        <div>
          <div className="sh-eyebrow" style={{ marginBottom: 10 }}>—— Pengguna · 12.418 total</div>
          <h1 className="sh-h-2">
            Kelola <em className="sh-italic" style={{ color: "var(--forest)" }}>petani</em> dan <em className="sh-italic" style={{ color: "var(--amber-2)" }}>admin</em>.
          </h1>
        </div>
      </div>

      {/* Metric strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { l: "Total", v: "12.418", sub: "+184 minggu ini", c: "var(--forest)" },
          { l: "Aktif 30d", v: "8.642", sub: "69,6% MAU", c: "var(--forest-3)" },
          { l: "Online sekarang", v: "847", sub: "live", c: "var(--amber)", live: true },
          { l: "Trial", v: "412", sub: "29 berakhir hari ini", c: "var(--amber-2)" },
          { l: "Berbayar", v: "2.184", sub: "+34 minggu ini", c: "var(--c-bark)" },
        ].map((m, i) => (
          <Card key={i} padded={false} style={{ padding: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: m.c }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="sh-eyebrow" style={{ fontSize: 10 }}>{m.l}</span>
              {m.live && <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--terracotta)", boxShadow: "0 0 6px var(--terracotta)" }} />}
            </div>
            <div className="sh-num" style={{ fontSize: 24, fontWeight: 500 }}>{m.v}</div>
            <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Filters bar */}
      <Card padded={false} style={{ padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <span style={{ position: "absolute", left: 14, top: 11, color: "var(--ink-4)" }}><I.search size={16} /></span>
            <input className="sh-input" placeholder="Cari nama, email, WhatsApp, ID…" style={{ height: 38, paddingLeft: 40, fontSize: 13 }} />
          </div>
          <div style={{ width: 1, height: 24, background: "var(--line)" }} />
          <select className="sh-input" style={{ height: 38, width: "auto", padding: "0 30px 0 12px", fontSize: 12.5, fontWeight: 500 }}>
            <option>Semua status</option>
          </select>
          <select className="sh-input" style={{ height: 38, width: "auto", padding: "0 30px 0 12px", fontSize: 12.5, fontWeight: 500 }}>
            <option>Semua peran</option>
          </select>
          <select className="sh-input" style={{ height: 38, width: "auto", padding: "0 30px 0 12px", fontSize: 12.5, fontWeight: 500 }}>
            <option>Semua paket</option>
          </select>
          <select className="sh-input" style={{ height: 38, width: "auto", padding: "0 30px 0 12px", fontSize: 12.5, fontWeight: 500 }}>
            <option>Semua provinsi</option>
          </select>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <Btn variant="ghost" size="sm" leading={<I.filter size={14} />}>Filter lanjutan</Btn>
            <span style={{ fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--f-mono)", alignSelf: "center" }}>248 cocok</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line-2)" }}>
          {[
            { l: "Semua", n: 12418, active: true },
            { l: "Online", n: 847 },
            { l: "Trial", n: 412 },
            { l: "Pro", n: 1842 },
            { l: "Koperasi", n: 342 },
            { l: "Nonaktif", n: 184 },
            { l: "Admin", n: 12 },
          ].map(t => (
            <button key={t.l} style={{
              padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: t.active ? "var(--forest-soft)" : "transparent",
              color: t.active ? "var(--forest)" : "var(--ink-3)",
              border: t.active ? "1px solid var(--forest-soft)" : "1px solid transparent",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {t.l}
              <span className="sh-num" style={{ fontSize: 10.5, padding: "1px 5px", borderRadius: 4, background: t.active ? "var(--forest)" : "var(--paper-2)", color: t.active ? "var(--paper)" : "var(--ink-4)" }}>
                {t.n.toLocaleString("id-ID")}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* User table */}
      <Card padded={false} style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--paper-2)" }}>
              <th style={{ padding: "12px 18px", textAlign: "left", width: 32 }}>
                <input type="checkbox" style={{ accentColor: "var(--forest)" }} />
              </th>
              {[
                { l: "Pengguna", w: "auto" },
                { l: "Status / Paket", w: 130 },
                { l: "Kebun", w: 90 },
                { l: "Lifetime", w: 130 },
                { l: "Aktivitas 14d", w: 120 },
                { l: "Last seen", w: 130 },
                { l: "Bergabung", w: 100 },
                { l: "", w: 32 },
              ].map(h => (
                <th key={h.l} style={{ padding: "12px 18px", textAlign: "left", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-4)", fontFamily: "var(--f-mono)", width: h.w }}>{h.l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { n: "Pak Suparman Hidayat", id: "suparman.riau", email: "suparman@kopsawit…", role: "Pemilik", status: "Pro", statusColor: "var(--forest)", kebun: 3, ha: "11,4 ha", lifetime: "Rp 612,8 jt", lifeSub: "186 panen", trend: [3,4,3,5,4,3,5,6,5,4,6,5,7,6], lastSeen: "2 menit", joined: "Sep 2024", initial: "S", avatarColor: "var(--amber)", online: true },
              { n: "Bu Hartini Lubis", id: "hartini.kopsawit", email: "hartini@kopsawit-tj…", role: "Bendahara · Koperasi", status: "Koperasi", statusColor: "var(--c-bark)", kebun: 42, ha: "248 ha", lifetime: "Rp 12,4 M", lifeSub: "agregat 42 anggota", trend: [8,9,8,10,11,10,12,13,12,11,13,14,13,15], lastSeen: "8 menit", joined: "Mar 2023", initial: "H", avatarColor: "var(--forest)", online: true },
              { n: "Pak Yusran Pasaribu", id: "yusran.medan", email: "yusran.medan@gma…", role: "Pemilik", status: "Pro", statusColor: "var(--forest)", kebun: 2, ha: "8,5 ha", lifetime: "Rp 184,2 jt", lifeSub: "76 panen", trend: [2,3,2,3,4,3,3,4,3,4,3,4,5,4], lastSeen: "Kemarin", joined: "Mei 2024", initial: "Y", avatarColor: "var(--c-terra)" },
              { n: "Ibu Maria Sianipar", id: "ibu.maria.aceh", email: "maria.s@gmail.com", role: "Pemilik", status: "Trial", statusColor: "var(--amber-2)", trialDays: 4, kebun: 1, ha: "2,1 ha", lifetime: "Rp 0", lifeSub: "trial sejak 12 Mei", trend: [0,0,1,1,2,1,2,2,1,2,3,2,3,2], lastSeen: "32 menit", joined: "12 Mei", initial: "M", avatarColor: "var(--c-sky)", online: true },
              { n: "Pak Haji Abdullah", id: "pak.haji.kalbar", email: "haji.abdullah@gma…", role: "Pemilik", status: "Pro", statusColor: "var(--forest)", kebun: 5, ha: "18,2 ha", lifetime: "Rp 842,1 jt", lifeSub: "284 panen", trend: [4,5,4,5,6,5,6,7,6,7,8,7,8,7], lastSeen: "1 jam", joined: "Jan 2024", initial: "A", avatarColor: "var(--c-bark)" },
              { n: "Pak Rohman", id: "rohman.tani", email: "rohman.tani@ymail…", role: "Pemilik", status: "Trial", statusColor: "var(--amber-2)", trialDays: 14, kebun: 0, ha: "—", lifetime: "Rp 0", lifeSub: "baru daftar", trend: [0,0,0,0,0,0,0,0,0,0,0,0,1,1], lastSeen: "10 menit", joined: "Hari ini", initial: "R", avatarColor: "var(--amber-2)", online: true, isNew: true },
              { n: "Sdri. Dewi Mulyani", id: "dewi.koperasi", email: "dewi@koperasi-su…", role: "Admin koperasi", status: "Koperasi", statusColor: "var(--c-bark)", kebun: 28, ha: "168 ha", lifetime: "Rp 6,2 M", lifeSub: "agregat 28 anggota", trend: [6,7,6,8,7,8,9,8,9,10,9,11,10,11], lastSeen: "4 jam", joined: "Okt 2023", initial: "D", avatarColor: "var(--forest-3)" },
              { n: "Pak Joko Susanto", id: "joko.lampung", email: "joko.s@yahoo.co.id", role: "Pemilik", status: "Nonaktif", statusColor: "var(--ink-4)", kebun: 1, ha: "3,2 ha", lifetime: "Rp 24,1 jt", lifeSub: "12 panen", trend: [2,2,1,1,2,1,0,0,0,0,0,0,0,0], lastSeen: "26 hari", joined: "Agu 2024", initial: "J", avatarColor: "var(--ink-4)", inactive: true },
            ].map((u, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--line-2)", opacity: u.inactive ? 0.55 : 1 }}>
                <td style={{ padding: "14px 18px" }}>
                  <input type="checkbox" style={{ accentColor: "var(--forest)" }} />
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: u.avatarColor, color: u.avatarColor === "var(--amber)" || u.avatarColor === "var(--amber-2)" ? "var(--forest)" : "var(--paper)",
                        display: "grid", placeItems: "center",
                        fontFamily: "var(--f-display)", fontWeight: 500, fontStyle: "italic", fontSize: 17,
                      }}>{u.initial}</div>
                      {u.online && (
                        <span style={{ position: "absolute", bottom: -2, right: -2, width: 11, height: 11, borderRadius: 99, background: "#7BC97B", border: "2px solid var(--paper)" }} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{u.n}</span>
                        {u.isNew && <Chip tone="amber" style={{ fontSize: 9.5 }}>BARU</Chip>}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2, fontFamily: "var(--f-mono)" }}>
                        {u.id} · {u.email}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 1 }}>{u.role}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Chip style={{
                      background: `${u.statusColor}14`, color: u.statusColor, borderColor: `${u.statusColor}28`,
                      fontWeight: 600,
                    }}>{u.status}</Chip>
                    {u.trialDays && <span style={{ fontSize: 10.5, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>sisa {u.trialDays} hari</span>}
                  </div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div className="sh-num" style={{ fontSize: 13, fontWeight: 500 }}>{u.kebun}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>{u.ha}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <div className="sh-num" style={{ fontSize: 13, fontWeight: 500 }}>{u.lifetime}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-4)" }}>{u.lifeSub}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <Sparkline data={u.trend} width={80} height={26} color={u.trend[u.trend.length - 1] > u.trend[0] ? "var(--forest)" : "var(--c-terra)"} fill={false} />
                </td>
                <td style={{ padding: "14px 18px", fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--f-mono)" }}>{u.lastSeen}</td>
                <td style={{ padding: "14px 18px", fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--f-mono)" }}>{u.joined}</td>
                <td style={{ padding: "14px 18px" }}>
                  <button style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: 0, cursor: "pointer", color: "var(--ink-3)" }}>
                    <I.more />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line-2)", background: "var(--paper-2)" }}>
          <div style={{ fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--f-mono)" }}>1–8 dari 12.418 · 1.552 halaman</div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <select style={{ padding: "5px 28px 5px 10px", fontSize: 11.5, fontFamily: "var(--f-mono)", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper)", marginRight: 8 }}>
              <option>8/hal</option>
            </select>
            {["←", "1", "2", "3", "…", "1552", "→"].map((p, i) => (
              <button key={i} style={{
                minWidth: 28, height: 28, padding: "0 6px", borderRadius: 6, border: "1px solid var(--line)",
                background: p === "1" ? "var(--ink)" : "var(--paper)",
                color: p === "1" ? "var(--paper)" : "var(--ink-3)",
                fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: "var(--f-mono)",
              }}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </AdminShell>
  );
}

window.AdminUsersPage = AdminUsersPage;
