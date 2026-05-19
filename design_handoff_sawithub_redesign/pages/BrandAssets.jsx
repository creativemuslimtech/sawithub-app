/* global React, SH */
const { Card, Btn, Chip, I, PalmFrond, PalmLeaf, SoilWaves } = window.SH;

function BrandAssetsPage() {
  return (
    <div className="sh-page" style={{ width: 1440, minHeight: 2200, background: "var(--cream)", position: "relative", overflow: "hidden" }}>
      <div className="sh-grain" />
      <PalmFrond size={520} style={{ position: "absolute", right: -120, top: -60, color: "var(--forest)", opacity: 0.05 }} />

      <div style={{ padding: "48px 56px 80px", position: "relative" }}>
        {/* Header */}
        <div style={{ marginBottom: 56, maxWidth: 760 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 14 }}>—— Brand Assets · v1.0 · Mei 2026</div>
          <h1 className="sh-h-1" style={{ marginBottom: 18 }}>
            Identitas <em className="sh-italic" style={{ color: "var(--forest)" }}>SawitHub</em>.
          </h1>
          <p style={{ fontSize: 17, color: "var(--ink-3)", lineHeight: 1.6 }}>
            Logo dan ikon resmi SawitHub — tersedia di <code style={{ fontFamily: "var(--f-mono)", background: "var(--paper-2)", padding: "2px 7px", borderRadius: 5, fontSize: 14 }}>brand/logo/</code> dalam format PNG dan SVG.
            Pakailah konsisten di semua produk, marketing, dan komunikasi mitra.
          </p>
        </div>

        {/* Primary lockup card */}
        <Card padded={false} style={{ padding: 0, marginBottom: 28, overflow: "hidden" }}>
          <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--line-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Logo utama · horizontal lockup</div>
              <h3 className="sh-h-4">Pemakaian default · marketing, header app, dokumen</h3>
            </div>
            <Chip tone="forest" style={{ fontFamily: "var(--f-mono)" }}>Primary</Chip>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 0 }}>
            <div style={{ padding: 56, background: "var(--cream)", display: "grid", placeItems: "center", minHeight: 320, position: "relative", borderRight: "1px solid var(--line-2)" }}>
              <SoilWaves width={520} height={80} style={{ position: "absolute", left: 0, bottom: 0, color: "var(--amber)", opacity: 0.1 }} />
              <img src="brand/logo/sawithub-horizontal.png" alt="SawitHub" style={{ width: 380, height: "auto", position: "relative", zIndex: 1 }} />
            </div>
            <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
              <FileRow file="sawithub-horizontal.png" desc="PNG · 304×110 · transparan" cmd="brand/logo/sawithub-horizontal.png" />
              <FileRow file="sawithub-horizontal.svg" desc="SVG · vector · ideal untuk web/print" cmd="brand/logo/sawithub-horizontal.svg" />
              <FileRow file="sawithub-horizontal-mono.svg" desc="SVG monokrom · pakai currentColor" cmd="brand/logo/sawithub-horizontal-mono.svg" />
              <div style={{ marginTop: 8, padding: 14, background: "var(--cream)", borderRadius: 10, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6 }}>
                Wordmark: <strong style={{ color: "var(--ink)" }}>Fraunces</strong> 500 untuk "sawit", italic 400 untuk "hub". Letter-spacing −0.025em.
              </div>
            </div>
          </div>
        </Card>

        {/* Icon card */}
        <Card padded={false} style={{ padding: 0, marginBottom: 28, overflow: "hidden" }}>
          <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--line-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Logo ikon · standalone mark</div>
              <h3 className="sh-h-4">Favicon, app icon, social avatar, watermark</h3>
            </div>
            <Chip tone="amber" style={{ fontFamily: "var(--f-mono)" }}>Mark only</Chip>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0 }}>
            <SizeCell bg="var(--cream)"      size={128} label="App icon 1024" sub="dengan cream rounded-bg" src="brand/logo/sawithub-app-icon-1024.svg" />
            <SizeCell bg="var(--paper)"      size={88}  label="Standard"      sub="transparan · SVG"        src="brand/logo/sawithub-icon.svg" border />
            <SizeCell bg="var(--paper)"      size={56}  label="Compact"       sub="header SaaS · 24-40px"   src="brand/logo/sawithub-icon.svg" border />
            <SizeCell bg="var(--forest)"     size={88}  label="Inverted"      sub="auto-mono · forest bg"   src="brand/logo/sawithub-icon-mono.svg" mono="var(--paper)" />
          </div>
          <div style={{ padding: "16px 28px", borderTop: "1px solid var(--line-2)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 8 }}>File ikon</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <FileRow file="sawithub-icon.png" desc="PNG 114×112 · transparan" cmd="brand/logo/sawithub-icon.png" />
                <FileRow file="sawithub-icon.svg" desc="SVG transparan · in-app" cmd="brand/logo/sawithub-icon.svg" />
                <FileRow file="sawithub-icon-mono.svg" desc="SVG monokrom" cmd="brand/logo/sawithub-icon-mono.svg" />
                <FileRow file="sawithub-app-icon-1024.svg" desc="App icon 1024×1024 · iOS/Android" cmd="brand/logo/sawithub-app-icon-1024.svg" />
              </div>
            </div>
            <div>
              <div className="sh-eyebrow" style={{ marginBottom: 8 }}>Aturan ukuran minimum</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--ink-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px dashed var(--line)" }}>
                  <span>Digital · ikon</span><span>24 px</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px dashed var(--line)" }}>
                  <span>Digital · horizontal</span><span>88 px lebar</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px dashed var(--line)" }}>
                  <span>Print · ikon</span><span>6 mm</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                  <span>Print · horizontal</span><span>18 mm</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Color palette */}
        <Card padded={false} style={{ padding: 28, marginBottom: 28 }}>
          <div style={{ marginBottom: 22 }}>
            <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Palet warna brand</div>
            <h3 className="sh-h-4">5 warna utama · WCAG AA compliant</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[
              { name: "Forest", hex: "#1A3D2B", use: "Logo stroke · 'sawit'", text: "var(--paper)" },
              { name: "Forest 3", hex: "#2D5A3D", use: "'hub' italic · secondary", text: "var(--paper)" },
              { name: "Amber", hex: "#D4A827", use: "Buah · accent · positive", text: "var(--ink)" },
              { name: "Cream", hex: "#F5F0E8", use: "Background app/marketing", text: "var(--ink)" },
              { name: "Ink", hex: "#1A1F1A", use: "Body text · dark UI", text: "var(--paper)" },
            ].map((c, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line-2)" }}>
                <div style={{ height: 110, background: c.hex, color: c.text, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontFamily: "var(--f-mono)", opacity: 0.7 }}>{c.name}</span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 16, fontWeight: 500 }}>{c.hex}</span>
                </div>
                <div style={{ padding: "10px 14px", background: "var(--paper)", fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.5 }}>{c.use}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Do / Don't */}
        <Card padded={false} style={{ padding: 28 }}>
          <div style={{ marginBottom: 22 }}>
            <div className="sh-eyebrow" style={{ marginBottom: 4 }}>—— Pemakaian logo</div>
            <h3 className="sh-h-4">Yang boleh ✓ · yang tidak boleh ✗</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { ok: true, label: "Logo asli di latar cream", swatch: "var(--cream)", show: "primary" },
              { ok: true, label: "Logo asli di latar paper", swatch: "var(--paper)", show: "primary" },
              { ok: true, label: "Monokrom putih di forest", swatch: "var(--forest)", show: "mono-light" },
              { ok: true, label: "Monokrom forest di cream", swatch: "var(--cream)", show: "mono-dark" },
            ].map((d, i) => (
              <DoTile key={i} {...d} />
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 12 }}>
            {[
              { ok: false, label: "Dimiringkan / di-rotate" },
              { ok: false, label: "Diisi warna selain forest" },
              { ok: false, label: "Outline tanpa fill" },
              { ok: false, label: "Latar kontras rendah" },
            ].map((d, i) => (
              <DontTile key={i} {...d} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* Helpers */
function FileRow({ file, desc, cmd }) {
  return (
    <div style={{ padding: "10px 12px", background: "var(--cream)", border: "1px solid var(--line-2)", borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 7, background: "var(--paper)", color: "var(--forest)", display: "grid", placeItems: "center" }}>
        <FileIcon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>{file}</div>
        <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 1 }}>{desc}</div>
      </div>
      <button style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper)", fontSize: 11, fontFamily: "var(--f-mono)", fontWeight: 600, color: "var(--ink-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
        <I.download size={12} />
        Salin path
      </button>
    </div>
  );
}

function SizeCell({ bg, size, label, sub, src, border, mono }) {
  return (
    <div style={{ padding: 28, background: bg, borderRight: border ? "1px solid var(--line-2)" : 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, minHeight: 220, justifyContent: "center" }}>
      <div style={{ width: size, height: size, color: mono, display: "grid", placeItems: "center" }}>
        <img src={src} alt="" style={{ width: "100%", height: "100%", filter: mono ? `brightness(0) invert(${bg === "var(--forest)" ? 1 : 0})` : "none" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: bg === "var(--forest)" ? "var(--paper)" : "var(--ink)" }}>{label}</div>
        <div style={{ fontSize: 10.5, color: bg === "var(--forest)" ? "rgba(251,248,241,0.55)" : "var(--ink-4)", marginTop: 3, fontFamily: "var(--f-mono)" }}>{sub}</div>
      </div>
    </div>
  );
}

function FileIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 3h8l4 4v14H6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v5h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DoTile({ swatch, show, label }) {
  return (
    <div>
      <div style={{ height: 130, background: swatch, borderRadius: 12, border: "1px solid var(--line-2)", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 99, background: "var(--forest)", color: "var(--paper)", display: "grid", placeItems: "center" }}>
          <I.check size={12} />
        </div>
        <div style={{
          color: show === "mono-light" ? "var(--paper)" : show === "mono-dark" ? "var(--forest)" : "var(--ink)",
          display: "grid", placeItems: "center",
        }}>
          {show === "primary"
            ? <img src="brand/logo/sawithub-horizontal.png" alt="" style={{ width: 160 }} />
            : <span style={{ display: "flex", alignItems: "center", gap: 8, color: "inherit" }}>
                <svg width={28} height={28} viewBox="0 0 40 40" fill="none">
                  <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
                    <path d="M20 36 L20 12" />
                    <path d="M20 30 C 14 30, 10 27, 8 23" />
                    <path d="M20 25 C 13 24, 9 20, 7 15" />
                    <path d="M20 20 C 14 18, 11 13, 11 8" />
                    <path d="M20 15 C 16 12, 15 8, 16 4" />
                    <path d="M20 30 C 26 30, 30 27, 32 23" />
                    <path d="M20 25 C 27 24, 31 20, 33 15" />
                    <path d="M20 20 C 26 18, 29 13, 29 8" />
                    <path d="M20 15 C 24 12, 25 8, 24 4" />
                  </g>
                  <circle cx="20" cy="11" r="2.8" fill="currentColor" />
                </svg>
                <span style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 500, color: "inherit" }}>sawit<span style={{ fontStyle: "italic", opacity: 0.78 }}>hub</span></span>
              </span>
          }
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--forest)", fontWeight: 600 }}>✓</span>
        {label}
      </div>
    </div>
  );
}

function DontTile({ label }) {
  const variants = {
    "Dimiringkan / di-rotate": <img src="brand/logo/sawithub-horizontal.png" alt="" style={{ width: 130, transform: "rotate(-12deg)" }} />,
    "Diisi warna selain forest": (
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <svg width={28} height={28} viewBox="0 0 40 40" fill="none">
          <g stroke="#9B27AF" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <path d="M20 36 L20 12" />
            <path d="M20 30 C 14 30, 10 27, 8 23" />
            <path d="M20 25 C 13 24, 9 20, 7 15" />
            <path d="M20 20 C 14 18, 11 13, 11 8" />
            <path d="M20 30 C 26 30, 30 27, 32 23" />
            <path d="M20 25 C 27 24, 31 20, 33 15" />
            <path d="M20 20 C 26 18, 29 13, 29 8" />
          </g>
          <circle cx="20" cy="11" r="2.8" fill="#06B6D4" />
        </svg>
        <span style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 500, color: "#9B27AF" }}>sawit<span style={{ fontStyle: "italic", color: "#06B6D4" }}>hub</span></span>
      </span>
    ),
    "Outline tanpa fill": (
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <svg width={28} height={28} viewBox="0 0 40 40" fill="none">
          <g stroke="var(--forest)" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <path d="M20 36 L20 12" />
            <path d="M20 30 C 14 30, 10 27, 8 23" />
            <path d="M20 20 C 14 18, 11 13, 11 8" />
            <path d="M20 30 C 26 30, 30 27, 32 23" />
            <path d="M20 20 C 26 18, 29 13, 29 8" />
          </g>
          <circle cx="20" cy="11" r="2.8" fill="none" stroke="var(--amber)" strokeWidth="2" />
        </svg>
        <span style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 500, color: "transparent", WebkitTextStroke: "0.8px var(--forest)" }}>sawit<span style={{ fontStyle: "italic" }}>hub</span></span>
      </span>
    ),
    "Latar kontras rendah": <img src="brand/logo/sawithub-horizontal.png" alt="" style={{ width: 130, opacity: 0.35 }} />,
  };

  return (
    <div>
      <div style={{ height: 130, background: label === "Latar kontras rendah" ? "#3D5A3D" : "var(--paper-2)", borderRadius: 12, border: "1px solid var(--line-2)", display: "grid", placeItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 99, background: "var(--terracotta-2)", color: "var(--paper)", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700 }}>
          ✗
        </div>
        {variants[label]}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--terracotta-2)", fontWeight: 700 }}>✗</span>
        {label}
      </div>
    </div>
  );
}

window.BrandAssetsPage = BrandAssetsPage;
