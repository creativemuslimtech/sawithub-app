/* global React */
const { useState } = React;

/* ────────────────────────────────────────────────────────────
   SawitHub Logo — palm/wheat frond preserved, recolored for brand
   ──────────────────────────────────────────────────────────── */
function SawitLogo({ size = 28, showText = true, mono = false, color, wordColor }) {
  const stroke = mono ? "currentColor" : (color || "#1A3D2B");
  const fruit  = mono ? "currentColor" : "#D4A827";
  const wc     = mono ? "currentColor" : (wordColor || "#1A1F1A");
  const accent = mono ? "currentColor" : "#2D5A3D";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <defs>
          <clipPath id={`shclip-${size}`}>
            <circle cx="20" cy="20" r="20" />
          </clipPath>
        </defs>
        <g clipPath={`url(#shclip-${size})`}>
          <g stroke={stroke} strokeWidth="2" strokeLinecap="round" fill="none">
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
          <circle cx="20" cy="11" r="2.8" fill={fruit} />
        </g>
      </svg>
      {showText && (
        <span style={{
          fontFamily: 'Fraunces, "Iowan Old Style", Georgia, serif',
          fontSize: size * 0.78,
          fontWeight: 500,
          letterSpacing: "-0.025em",
          lineHeight: 1,
          color: wc,
          fontStyle: "normal",
        }}>
          sawit<span style={{ color: mono ? "currentColor" : accent, fontStyle: "italic", fontWeight: 400 }}>hub</span>
        </span>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Botanical line-art accents (hand-drawn style)
   ──────────────────────────────────────────────────────────── */
function PalmFrond({ size = 120, color = "currentColor", opacity = 0.12, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
         style={{ color, opacity, ...style }} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M60 110 C 58 80, 56 50, 60 12" />
        <path d="M60 95 C 48 92, 38 86, 30 76" />
        <path d="M60 95 C 72 92, 82 86, 90 76" />
        <path d="M60 80 C 46 76, 34 68, 26 56" />
        <path d="M60 80 C 74 76, 86 68, 94 56" />
        <path d="M60 64 C 48 60, 38 50, 32 38" />
        <path d="M60 64 C 72 60, 82 50, 88 38" />
        <path d="M60 48 C 52 42, 46 32, 44 22" />
        <path d="M60 48 C 68 42, 74 32, 76 22" />
        <path d="M60 32 C 56 26, 54 18, 56 10" />
        <path d="M60 32 C 64 26, 66 18, 64 10" />
      </g>
      <circle cx="60" cy="14" r="2.4" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function PalmLeaf({ size = 100, color = "currentColor", opacity = 0.18, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
         style={{ color, opacity, ...style }} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none">
        <path d="M10 90 C 30 60, 60 30, 92 10" />
        {[0,1,2,3,4,5,6,7].map(i => {
          const t = i / 7;
          const x = 10 + (92-10) * t;
          const y = 90 - (90-10) * t;
          const dx = Math.cos((1 - t) * 2.2) * 14;
          const dy = Math.sin((1 - t) * 2.2) * 14;
          return <path key={i} d={`M${x} ${y} q ${dx*0.6} ${-dy*0.4}, ${dx} ${-dy}`} />;
        })}
      </g>
    </svg>
  );
}

function SunRays({ size = 80, color = "currentColor", opacity = 0.2, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none"
         style={{ color, opacity, ...style }} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none">
        <circle cx="40" cy="40" r="10" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r1 = 16, r2 = 26 + (i%2 ? 4 : 0);
          return <line key={i}
            x1={40 + Math.cos(a)*r1} y1={40 + Math.sin(a)*r1}
            x2={40 + Math.cos(a)*r2} y2={40 + Math.sin(a)*r2}
          />;
        })}
      </g>
    </svg>
  );
}

function SoilWaves({ width = 240, height = 60, color = "currentColor", opacity = 0.18, style }) {
  return (
    <svg width={width} height={height} viewBox={`0 0 240 60`} fill="none"
         style={{ color, opacity, ...style }} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none">
        <path d="M0 14 C 40 6, 80 22, 120 14 S 200 6, 240 14" />
        <path d="M0 28 C 40 20, 80 36, 120 28 S 200 20, 240 28" />
        <path d="M0 42 C 40 34, 80 50, 120 42 S 200 34, 240 42" />
        <path d="M0 56 C 40 48, 80 64, 120 56 S 200 48, 240 56" />
      </g>
    </svg>
  );
}

function SeedSprout({ size = 60, color = "currentColor", opacity = 0.6, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none"
         style={{ color, opacity, ...style }} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none">
        <path d="M30 52 L30 24" />
        <path d="M30 36 C 22 36, 16 30, 16 22 C 24 22, 30 28, 30 36 Z" />
        <path d="M30 30 C 38 30, 44 24, 44 16 C 36 16, 30 22, 30 30 Z" />
        <path d="M22 52 L38 52" />
      </g>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Primitive UI bits
   ──────────────────────────────────────────────────────────── */
function Card({ children, padded = true, elev = 1, style, className = "", ...rest }) {
  const shadow = elev === 2 ? "var(--sh-card-2)" : elev === 3 ? "var(--sh-card-3)" : "var(--sh-card)";
  return (
    <div className={`sh-card ${className}`} style={{
      padding: padded ? 22 : 0,
      boxShadow: shadow,
      ...style
    }} {...rest}>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, delta, accent = "var(--forest)", icon }) {
  const positive = delta && !String(delta).startsWith("-");
  return (
    <div className="sh-card" style={{
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sh-eyebrow" style={{ marginBottom: 8 }}>{label}</div>
          <div className="sh-num" style={{ fontSize: 30, fontWeight: 500, color: "var(--ink)", lineHeight: 1 }}>
            {value}
          </div>
          {sub && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-3)" }}>{sub}</div>
          )}
        </div>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${accent}14`, color: accent,
            display: "grid", placeItems: "center",
            border: `1px solid ${accent}22`,
          }}>
            {icon}
          </div>
        )}
      </div>
      {delta && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <span className="sh-chip" style={{
            background: positive ? "var(--forest-soft)" : "var(--terra-soft)",
            color: positive ? "var(--forest)" : "var(--terracotta-2)",
            borderColor: "transparent",
          }}>
            {positive ? "↑" : "↓"} {String(delta).replace("-", "")}
          </span>
          <span style={{ fontSize: 11, color: "var(--ink-4)" }}>vs. periode lalu</span>
        </div>
      )}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 2,
        background: accent, opacity: 0.6,
      }} />
    </div>
  );
}

function Sparkline({ data, width = 120, height = 40, color = "var(--forest)", fill = true }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2]);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && (
        <>
          <defs>
            <linearGradient id={`sp-${color.replace(/[^a-z0-9]/gi, "")}-${width}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#sp-${color.replace(/[^a-z0-9]/gi, "")}-${width})`} />
        </>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Btn({ variant = "primary", size, children, leading, trailing, style, ...rest }) {
  const cls = ["sh-btn"];
  if (variant === "primary") cls.push("sh-btn-primary");
  else if (variant === "amber") cls.push("sh-btn-amber");
  else cls.push("sh-btn-ghost");
  if (size === "sm") cls.push("sh-btn-sm");
  if (size === "lg") cls.push("sh-btn-lg");
  return (
    <button className={cls.join(" ")} style={style} {...rest}>
      {leading}{children}{trailing}
    </button>
  );
}

function Chip({ tone = "neutral", children, style }) {
  const c = tone === "forest" ? "sh-chip sh-chip-forest"
        : tone === "amber"   ? "sh-chip sh-chip-amber"
        : tone === "terra"   ? "sh-chip sh-chip-terra"
        : "sh-chip";
  return <span className={c} style={style}>{children}</span>;
}

/* Mini ring progress */
function Ring({ pct, size = 56, color = "var(--forest)", track = "var(--line-soft)", strokeWidth = 6, label }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (pct / 100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={c/4} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      {label && (
        <div style={{
          position: "absolute", inset: 0, display: "grid", placeItems: "center",
          fontFamily: "var(--f-mono)", fontWeight: 500, fontSize: size * 0.22, color: "var(--ink)",
        }}>{label}</div>
      )}
    </div>
  );
}

/* Tiny iconography (line, brand-consistent) */
const I = {
  home: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  leaf: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="M5 19c0-9 6-15 15-15 0 9-6 15-15 15Zm0 0L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  basket: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="M4 9h16l-1.5 10a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 9 12 3l3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  spray: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="M10 8h4v10a2 2 0 0 1-2 2 2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.5"/><path d="M14 5h3l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="9" r="0.8" fill="currentColor"/><circle cx="5" cy="3" r="0.8" fill="currentColor"/></svg>,
  cal: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M4 10h16M9 3v4M15 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  money: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  chart: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="M4 20V8M10 20V4M16 20v-8M22 20H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  calc: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="8" y="6" width="8" height="3" rx="1" stroke="currentColor" strokeWidth="1.3"/><circle cx="9" cy="13" r="0.8" fill="currentColor"/><circle cx="12" cy="13" r="0.8" fill="currentColor"/><circle cx="15" cy="13" r="0.8" fill="currentColor"/><circle cx="9" cy="17" r="0.8" fill="currentColor"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/><circle cx="15" cy="17" r="0.8" fill="currentColor"/></svg>,
  bell: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  user: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 20c1.4-3.4 4-5 7-5s5.6 1.6 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  search: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5"/><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  plus: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  arrow: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  dot: (p={}) => <svg viewBox="0 0 24 24" width={p.size||10} height={p.size||10} {...p}><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>,
  check: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="m5 12 5 5 9-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  download: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="M12 4v12m0 0 4-4m-4 4-4-4M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  filter: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  mail: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  lock: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>,
  more: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/></svg>,
  star: (p={}) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="none" {...p}><path d="m12 4 2.4 5 5.6.8-4 4 1 5.6L12 17l-5 2.4 1-5.6-4-4 5.6-.8L12 4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
};

window.SH = { SawitLogo, PalmFrond, PalmLeaf, SunRays, SoilWaves, SeedSprout, Card, Stat, Sparkline, Btn, Chip, Ring, I };
