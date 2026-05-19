# Handoff · SawitHub Redesign 2026

## Overview
Redesign lengkap aplikasi **SawitHub** — plantation management SaaS untuk petani sawit Indonesia.
Mempertahankan identitas brand (logo palm/wheat, deep forest, warm cream) tapi mengangkatnya ke level "modern agrarian premium" — Notion ketemu koperasi bank Indonesia.

Bundel ini berisi **27 artboard hi-fi** mencakup:
- Marketing landing, auth flow lengkap (login, signup, forgot/reset/OTP, 404)
- Aplikasi petani (Dashboard desktop + mobile, Lahan, Catat Panen, Laporan Keuangan, Kalkulator Pupuk, Subscription, Profile)
- Admin command center (Login 2FA, Overview, Pengguna, Revenue, Apps overview, PWA detail, PWA Web Vitals per route, Android detail, Android ANR per device, Data browser, Analytics, Monitoring, Audit log, Settings)
- Brand assets reference page + logo files (PNG + SVG)

## About the Design Files
File HTML/JSX di bundel ini adalah **design references** — prototype yang menunjukkan look & behavior yang diinginkan, BUKAN kode produksi untuk langsung disalin.

Tugas implementer: **recreate desain ini di codebase `sawithub-app`** (Turborepo monorepo dengan Vite + React + TypeScript + Tailwind di `apps/frontend` dan `apps/admin-frontend`) menggunakan pattern + library yang sudah ada di sana. Jangan ubah arsitektur backend Go.

**Mulai dari file `IMPLEMENTATION_PROMPT.md`** — itu prompt lengkap untuk diberikan ke Claude Code, sudah berisi semua aturan, mapping file, langkah kerja, dan format pelaporan.

## Fidelity
**High-fidelity (hifi).** Pixel-perfect: warna hex final, tipografi final (Fraunces / DM Sans / JetBrains Mono), spacing, shadow, hover state, layout, copywriting Indonesia, dummy data realistis. Implementer harus recreate persis menggunakan komponen Tailwind + React di codebase target.

## Cara membuka design references
```bash
cd design_handoff_sawithub_redesign/
# serve via dev server apapun (Python, Node http-server, dll)
python3 -m http.server 8080
# buka http://localhost:8080/index.html
```
File `index.html` me-load semua artboard di canvas pan/zoom. Klik label artboard mana saja, tekan ikon expand untuk fullscreen view.

## Screens / Views
27 artboard, dikelompokkan jadi 5 section:

### Section: Brand
| # | Artboard | Ukuran | Catatan |
| - | -------- | ------ | ------- |
| 00 | Brand Assets | 1440×2200 | Logo PNG/SVG, palet warna, do/don't |
| 01 | Landing | 1440×2400 | Marketing — hero, features, testimonial, pricing, CTA |
| 02 | Login | 1440×900 | Split editorial dark + form |
| 02a | Signup | 1440×900 | Role chooser, +62 WhatsApp, password strength |
| 02b | Forgot Password | 1440×900 | Segmented tab WA/Email |
| 02c | Reset Password | 1440×900 | Strength meter dengan 4 syarat tick |
| 02d | OTP Verify | 1440×900 | 6-digit input + countdown 02:14 |
| 02e | 404 Not Found | 1440×900 | Fraunces italic 404 raksasa, 4 quick links |

### Section: Core App (petani)
| # | Artboard | Ukuran | Catatan |
| - | -------- | ------ | ------- |
| 03 | Dashboard (desktop) | 1440×1320 | Hero KPI + chart + ranking + activity |
| 04 | Dashboard (mobile) | 390×844 | Forest hero card + bottom nav center-FAB |
| 05 | Lahan / Kebun | 1440×1100 | Topographic map SVG + list cards dengan ring scores |

### Section: Forms & Reports
| # | Artboard | Ukuran | Catatan |
| - | -------- | ------ | ------- |
| 06 | Catat Panen | 1440×1280 | 3-step form + live pendapatan preview |
| 07 | Laporan Keuangan | 1440×1500 | Dark hero KPI + donut + combined chart + ledger |
| 08 | Kalkulator Pupuk | 1440×1280 | Sliders TBM/TM + big forest result + vs PPKS standard |

### Section: Account
| # | Artboard | Ukuran | Catatan |
| - | -------- | ------ | ------- |
| 09 | Subscription | 1440×1700 | Billing toggle, 3-plan cards, feature comparison, FAQ |
| 10 | Profile | 1440×1180 | Forest cover hero, side-nav settings, danger zone |

### Section: Admin · Command Center
| # | Artboard | Ukuran | Catatan |
| - | -------- | ------ | ------- |
| 11 | Admin Login (2FA) | 1440×900 | Dark full-bleed, TOTP grid, IP audit warning |
| 12 | Command Center | 1440×1700 | 6-up live metrics + chart + alerts + activity stream |
| 13 | Pengguna | 1440×1400 | Dense user table dengan sparklines & status pills |
| 14 | Revenue | 1440×2400 | MRR/ARR, plan mix, payment methods, transactions |
| 15 | Apps overview | 1440×1800 | 3 platform cards (PWA, Android, iOS-beta) |
| 15a | PWA detail | 1440×2400 | Web Vitals, install funnel, manifest, service worker |
| 15a-i | PWA Web Vitals per route | 1440×2100 | 10 route table + drilldown /keuangan + LCP trend |
| 15b | Android detail | 1440×2500 | Version adoption, OS distribution, top devices, crashes, Play ratings |
| 15b-i | Android ANR per device | 1440×2200 | Per-device table dengan stack trace expanded |
| 16 | Data Browser | 1440×1100 | SQL console + schema-aware table |
| 17 | Analytics | 1440×1500 | Funnel + retention cohort heatmap + DAU/WAU/MAU |
| 18 | Monitoring | 1440×1300 | 8 service cards + latency chart + incident log |
| 19 | Audit Log | 1440×1100 | Terminal stream + WORM hash chain |
| 20 | Settings & Flags | 1440×1500 | Toggles + feature flag table per env |

## Design Tokens

### Colors
| Token | Hex | Pemakaian |
| ----- | --- | --------- |
| `--forest` | `#1A3D2B` | Primary brand, logo stroke, primary buttons |
| `--forest-2` | `#14301F` | Hover state primary |
| `--forest-3` | `#2D5A3D` | Secondary forest, "hub" italic |
| `--forest-soft` | `#E7EEE8` | Forest chip bg |
| `--forest-tint` | `#F1F6F1` | Forest area bg |
| `--amber` | `#D4A827` | Accent, fruit dot, positive highlights |
| `--amber-2` | `#B88E1F` | Hover amber, alerts |
| `--amber-3` | `#E8C25F` | Light amber, dark mode accent |
| `--amber-soft` | `#F7EED1` | Amber chip bg |
| `--amber-tint` | `#FCF7E4` | Amber section bg |
| `--terracotta` | `#B8542B` | Negative metrics, warnings |
| `--terracotta-2` | `#973F19` | Strong negative |
| `--terra-soft` | `#F4DECF` | Terra chip bg |
| `--cream` | `#F5F0E8` | **Page background** |
| `--cream-2` | `#ECE4D2` | Cream alt |
| `--paper` | `#FBF8F1` | **Card surface** |
| `--paper-2` | `#F8F3E6` | Table header bg |
| `--surface` | `#FFFFFF` | Input surface |
| `--ink` | `#1A1F1A` | Primary text |
| `--ink-2` | `#2F3530` | Secondary text |
| `--ink-3` | `#5A615A` | Tertiary text |
| `--ink-4` | `#8A8F86` | Quaternary text, captions |
| `--ink-5` | `#B2B5AC` | Disabled |
| `--line` | `#DBD3BF` | Primary border |
| `--line-2` | `#E8E0CB` | Secondary border (lebih lembut) |
| `--line-soft` | `#EFE9D9` | Progress bar track |

Categorical (data viz): `--c-leaf` `#2D5A3D`, `--c-amber` `#D4A827`, `--c-terra` `#B8542B`, `--c-bark` `#6B4F2C`, `--c-sky` `#4A7A8C`, `--c-clay` `#C77E5C`.

### Typography
| Variable | Font Stack | Pemakaian |
| -------- | ---------- | --------- |
| `--f-display` | `"Fraunces", "Iowan Old Style", Georgia, serif` | Headlines, hero numbers, eyebrow numerals |
| `--f-body` | `"DM Sans", "Inter", system-ui, sans-serif` | Body, UI text, button labels |
| `--f-mono` | `"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace` | Numbers, IDs, timestamps, code |

Fraunces variable: weight 400-500, optical sizing auto, `font-variation-settings: "SOFT" 30, "WONK" 0`. Italic untuk emphasis only (warna forest atau amber).
DM Sans variable: weight 400-500.
JetBrains Mono: weight 400-500-600, `font-feature-settings: "tnum"`.

Display sizes: 80px (display), 56px (h1), 40px (h2), 28px (h3), 20px (h4) — semua letter-spacing −0.02 sampai −0.035em sesuai size.

### Spacing & radius
Radii: `--r-xs: 6px`, `--r-sm: 10px`, `--r-md: 14px`, `--r-lg: 20px`, `--r-xl: 28px`, `--r-2xl: 36px`. Fully rounded buttons: 999px.

### Shadows (warm, gentle, no harsh blacks)
- `--sh-card`: `0 1px 0 rgba(74, 56, 22, .04), 0 1px 3px rgba(74, 56, 22, .04)` — base cards
- `--sh-card-2`: `0 2px 0 rgba(74, 56, 22, .03), 0 10px 28px -16px rgba(45, 41, 22, .14)` — elevated cards
- `--sh-card-3`: `0 6px 0 rgba(74, 56, 22, .02), 0 28px 60px -24px rgba(26, 31, 26, .22)` — hover, modal, hero cards

### Texture
SVG noise grain overlay di semua page surface — `.sh-grain` class, fractalNoise 0.92, opacity 0.55, multiply blend.

### Botanical accents
4 SVG line-art elements untuk hero/section accents:
- `<PalmFrond>` — full palm tree, 11 fronds
- `<PalmLeaf>` — single leaf dengan 8 stipule
- `<SunRays>` — sun dengan 12 rays
- `<SoilWaves>` — 4 horizontal wavy lines
- `<SeedSprout>` — sprouting seedling
Default opacity 0.06-0.18, color customizable. Pakai untuk hero backgrounds, dark forest sections, empty states.

## Komponen library (`primitives.jsx`)
Port ke TSX di `components/ds/`:
- `<SawitLogo>` — palm/wheat icon + Fraunces wordmark
- `<Card>` `<Stat>` `<Btn>` `<Chip>` `<Ring>` `<Sparkline>`
- `<PalmFrond>` `<PalmLeaf>` `<SunRays>` `<SoilWaves>` `<SeedSprout>`
- Icon set `I.*` — 20+ line icons (home, leaf, basket, spray, cal, money, chart, calc, bell, user, search, plus, arrow, dot, check, download, filter, mail, lock, more, star)

## Interactions & Behavior
- **Hover lift** pada cards: `transition: transform .25s, box-shadow .25s` → translateY(-2px) + sh-card-3
- **Button active**: transform translateY(1px)
- **Input focus**: border-forest + 4px ring rgba(45, 90, 61, .12)
- **Number count-up animations** pada page load untuk hero KPIs
- **Smooth hover** semua link 120ms ease
- **Mobile dashboard FAB** elevated dengan shadow forest-tint 4px-12px

## State Management
Sudah ada di codebase target (`useAuth`, `useFarm`, axios `api/client.ts`). **Jangan diubah.**
Untuk hook fetch baru di page Revenue/Apps/Vitals/ANR/Audit/Analytics — buat hook dummy yang mirror API signature di `src/api/admin/*.ts`, tag `TODO[backend-pending]`. Detail di `IMPLEMENTATION_PROMPT.md`.

## Assets
- `brand/logo/sawithub-horizontal.png` — logo utama PNG 304×110
- `brand/logo/sawithub-horizontal.svg` — scalable
- `brand/logo/sawithub-horizontal-mono.svg` — currentColor mono
- `brand/logo/sawithub-icon.png` — ikon PNG 114×112
- `brand/logo/sawithub-icon.svg` — ikon SVG transparan
- `brand/logo/sawithub-icon-mono.svg` — ikon mono
- `brand/logo/sawithub-app-icon-1024.svg` — app icon dengan rounded cream bg (iOS/Android)
- `brand/README.md` — spesifikasi & aturan pemakaian

Fonts via Google Fonts: Fraunces, DM Sans, JetBrains Mono.

## Files dalam bundel
```
design_handoff_sawithub_redesign/
├── IMPLEMENTATION_PROMPT.md         ★ BACA DULUAN — prompt siap untuk Claude Code
├── README.md                        ← file ini
├── index.html                       Canvas yang load semua artboard
├── tokens.css                       Design tokens lengkap
├── primitives.jsx                   Komponen library + botanical SVGs + icons
├── design-canvas.jsx                Canvas wrapper (tidak perlu di-port)
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── AuthExtras.jsx               Signup, Forgot, Reset, OTP, 404
│   ├── Dashboard.jsx
│   ├── MobileDashboard.jsx
│   ├── Lahan.jsx
│   ├── AddPanen.jsx
│   ├── Laporan.jsx
│   ├── Kalkulator.jsx
│   ├── Subscription.jsx
│   ├── Profile.jsx
│   └── BrandAssets.jsx
├── admin/
│   ├── AdminShell.jsx               Dark sidebar + topbar + env switcher
│   ├── Login.jsx                    2FA dark login
│   ├── Dashboard.jsx                Command Center
│   ├── Users.jsx
│   ├── Revenue.jsx                  MRR/ARR — NO BACKEND YET
│   ├── Apps.jsx                     Platform overview — NO BACKEND YET
│   ├── pwa/
│   │   ├── PwaDetail.jsx            — NO BACKEND YET
│   │   └── PwaVitals.jsx            Per-route Web Vitals — NO BACKEND YET
│   ├── android/
│   │   ├── AndroidDetail.jsx        — NO BACKEND YET
│   │   └── AndroidAnr.jsx           Per-device ANR — NO BACKEND YET
│   ├── Data.jsx                     SQL console
│   ├── Analytics.jsx                Funnel + cohort heatmap
│   ├── Monitoring.jsx               Services + latency
│   ├── Audit.jsx                    Terminal-style log
│   └── Settings.jsx                 Toggles + feature flags
└── brand/
    ├── README.md                    Brand guidelines
    └── logo/                        7 logo file (PNG + SVG variants)
```

## Cara memulai implementasi
1. Buka `IMPLEMENTATION_PROMPT.md`.
2. Salin seluruh isinya ke Claude Code yang dijalankan di repo `sawithub-app`.
3. Pastikan Claude Code bisa baca folder `design_handoff_sawithub_redesign/` ini (attach sebagai workspace atau letakkan di repo).
4. Claude Code akan kerja step-by-step: tokens → brand → DS → per-page → admin → laporan API pending.
5. Output akhir: `IMPLEMENTATION_REPORT.md` di root project, berisi daftar lengkap endpoint backend yang masih perlu dibuat.

## Aturan paling penting (ada juga di IMPLEMENTATION_PROMPT.md)
1. **JANGAN ubah desain** — pixel-perfect dari artboard.
2. **JANGAN ubah arsitektur** backend/frontend yang sudah jalan.
3. **JANGAN minta konfirmasi** — implementer langsung kerja.
4. **Hardcode data dummy** untuk fitur yang backend-nya belum ada, dengan banner warning di dev mode.
5. **Wajib hasilkan `IMPLEMENTATION_REPORT.md`** dengan daftar API pending.
