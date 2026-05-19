/* global React, SH, AppShell */
const { Card, Btn, Chip, Ring, I, PalmLeaf, SoilWaves } = window.SH;

function ProfilePage() {
  return (
    <AppShell active="profile" title="Profil & Pengaturan"
      headerActions={<Btn variant="primary" size="sm" leading={<I.check size={14} />}>Simpan perubahan</Btn>}
    >
      {/* Hero / cover */}
      <Card padded={false} style={{ padding: 0, marginBottom: 22, overflow: "hidden", background: "var(--forest)", color: "var(--paper)", position: "relative" }}>
        <SoilWaves width={1200} height={200} style={{ position: "absolute", left: 0, bottom: 0, color: "var(--amber)", opacity: 0.18, width: "100%" }} />
        <PalmLeaf size={200} style={{ position: "absolute", right: 40, top: -20, color: "var(--paper)", opacity: 0.08 }} />
        <div style={{ padding: "40px 36px 32px", position: "relative", display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{
            width: 96, height: 96, borderRadius: 28, background: "var(--amber)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--f-display)", fontSize: 44, fontWeight: 500, fontStyle: "italic",
            color: "var(--forest)",
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.3)",
          }}>
            S
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--amber-3)", letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600 }}>—— Pemilik · Anggota sejak Sep 2024</div>
            <h1 className="sh-h-2" style={{ color: "var(--paper)", marginTop: 8 }}>Pak Suparman Hidayat</h1>
            <div style={{ display: "flex", gap: 18, marginTop: 12, alignItems: "center" }}>
              <Chip style={{ background: "rgba(255,255,255,0.12)", color: "var(--paper)", borderColor: "rgba(255,255,255,0.15)" }}>
                <I.mail size={11} /> suparman@kopsawitriau.id
              </Chip>
              <Chip style={{ background: "rgba(255,255,255,0.12)", color: "var(--paper)", borderColor: "rgba(255,255,255,0.15)" }}>
                📍 Pekanbaru · Riau
              </Chip>
              <Chip tone="amber" style={{ background: "var(--amber)", color: "#2B1F00", borderColor: "transparent" }}>
                Trial · 8 hari tersisa
              </Chip>
            </div>
          </div>
          <Btn variant="ghost" size="sm" style={{ background: "rgba(255,255,255,0.1)", color: "var(--paper)", borderColor: "rgba(255,255,255,0.18)" }}>
            Ganti foto
          </Btn>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid rgba(255,255,255,0.1)", position: "relative" }}>
          {[
            { l: "Total kebun", v: "3", sub: "11,4 ha" },
            { l: "Catatan panen", v: "186", sub: "sejak gabung" },
            { l: "Pendapatan tercatat", v: "Rp 612,8 jt", sub: "lifetime" },
            { l: "Skor pencatatan", v: "94", sub: "dari 100 · rapi sekali" },
          ].map((s, i) => (
            <div key={i} style={{ padding: 24, borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : 0 }}>
              <div style={{ fontSize: 10, color: "var(--amber-3)", textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 600 }}>{s.l}</div>
              <div className="sh-num" style={{ fontSize: 24, fontWeight: 500, color: "var(--paper)", marginTop: 8 }}>{s.v}</div>
              <div style={{ fontSize: 11.5, color: "rgba(251,248,241,0.5)", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Settings layout */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 22 }}>
        {/* Side nav */}
        <Card padded={false} style={{ padding: 12, alignSelf: "start" }}>
          {[
            { l: "Profil saya", k: "profile", active: true, icon: <I.user /> },
            { l: "Akun & keamanan", k: "account", icon: <I.lock /> },
            { l: "Kebun & tim", k: "team", icon: <I.leaf /> },
            { l: "Notifikasi", k: "notif", icon: <I.bell /> },
            { l: "Tampilan & bahasa", k: "ui", icon: <I.star /> },
            { l: "Langganan & faktur", k: "billing", icon: <I.money /> },
            { l: "Privasi & data", k: "privacy", icon: <I.lock /> },
          ].map(it => (
            <a key={it.k} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8,
              fontSize: 13, fontWeight: 500,
              color: it.active ? "var(--forest)" : "var(--ink-2)",
              background: it.active ? "var(--forest-soft)" : "transparent",
              textDecoration: "none", cursor: "pointer",
            }}>
              <span style={{ color: it.active ? "var(--forest)" : "var(--ink-4)" }}>{it.icon}</span>
              {it.l}
            </a>
          ))}
        </Card>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Personal info */}
          <Card padded={false} style={{ padding: 28 }}>
            <SectionLabelP num="01" title="Informasi pribadi" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormFieldP label="Nama lengkap">
                <input className="sh-input" defaultValue="Suparman Hidayat" />
              </FormFieldP>
              <FormFieldP label="Panggilan">
                <input className="sh-input" defaultValue="Pak Suparman" />
              </FormFieldP>
              <FormFieldP label="Nomor WhatsApp">
                <input className="sh-input sh-num" defaultValue="+62 812-7321-8845" />
              </FormFieldP>
              <FormFieldP label="Email">
                <input className="sh-input" defaultValue="suparman@kopsawitriau.id" />
              </FormFieldP>
              <FormFieldP label="Lokasi kebun utama">
                <input className="sh-input" defaultValue="Pekanbaru, Riau" />
              </FormFieldP>
              <FormFieldP label="Bahasa antarmuka">
                <select className="sh-input" defaultValue="id">
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </FormFieldP>
            </div>
          </Card>

          {/* Cooperative */}
          <Card padded={false} style={{ padding: 28 }}>
            <SectionLabelP num="02" title="Koperasi & afiliasi" />
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--forest-soft)", color: "var(--forest)", display: "grid", placeItems: "center", fontFamily: "var(--f-display)", fontSize: 22, fontWeight: 500, fontStyle: "italic" }}>K</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>KopSawit Riau</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>Anggota No. 2451 · Sejak 2017 · 12 km dari kebun</div>
              </div>
              <Chip tone="forest">Terverifikasi</Chip>
              <Btn variant="ghost" size="sm">Kelola</Btn>
            </div>
            <div style={{ marginTop: 16, padding: 14, background: "var(--cream)", borderRadius: 10, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.55 }}>
              Sebagai anggota terverifikasi, laporan bulanan kamu otomatis terkirim ke pengurus koperasi setiap tanggal 1. <a style={{ color: "var(--forest)", fontWeight: 600 }}>Atur preferensi →</a>
            </div>
          </Card>

          {/* Notifications */}
          <Card padded={false} style={{ padding: 28 }}>
            <SectionLabelP num="03" title="Pengingat & notifikasi" amber />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { l: "Pengingat jadwal pupuk", sub: "WhatsApp · 1 hari sebelum jadwal", on: true },
                { l: "Update harga TBS Riau", sub: "Push notifikasi · setiap hari jam 08:00", on: true },
                { l: "Ringkasan mingguan", sub: "Email · setiap Senin pagi", on: true },
                { l: "Laporan bulanan", sub: "Email · setiap tanggal 1", on: true },
                { l: "Pengingat pembayaran langganan", sub: "WhatsApp · 3 hari sebelum jatuh tempo", on: false },
                { l: "Newsletter & tips kebun", sub: "Email · 2x sebulan", on: false },
              ].map((n, i, arr) => (
                <div key={i} style={{ padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--line-2)" : 0, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{n.l}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>{n.sub}</div>
                  </div>
                  <ToggleSw on={n.on} />
                </div>
              ))}
            </div>
          </Card>

          {/* Danger zone */}
          <Card padded={false} style={{ padding: 28, border: "1px solid rgba(184, 84, 43, 0.25)", background: "var(--terra-soft)" }}>
            <SectionLabelP num="04" title="Hati-hati di sini" terra />
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Hapus akun SawitHub</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4, maxWidth: 480, lineHeight: 1.55 }}>
                  Akun, semua kebun, panen, dan laporan akan dihapus permanen dalam 30 hari. Kamu bisa unduh ekspor lengkap sebelum hapus.
                </div>
              </div>
              <Btn variant="ghost" size="sm">Unduh ekspor lengkap</Btn>
              <Btn variant="ghost" size="sm" style={{ color: "var(--terracotta-2)", borderColor: "var(--terra-soft)" }}>
                Hapus akun
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function SectionLabelP({ num, title, amber, terra }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
      <span style={{
        fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, fontWeight: 500,
        color: terra ? "var(--terracotta-2)" : amber ? "var(--amber-2)" : "var(--forest)",
      }}>{num}</span>
      <h3 style={{ fontFamily: "var(--f-display)", fontSize: 19, fontWeight: 500 }}>{title}</h3>
      <div style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
    </div>
  );
}

function FormFieldP({ label, children }) {
  return (
    <div>
      <label className="sh-label" style={{ display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function ToggleSw({ on }) {
  return (
    <div style={{
      width: 40, height: 22, borderRadius: 99,
      background: on ? "var(--forest)" : "var(--line)",
      position: "relative", cursor: "pointer",
      transition: "background .2s",
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: 99,
        background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left .2s",
      }} />
    </div>
  );
}

window.ProfilePage = ProfilePage;
