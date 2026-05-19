# Prompt — Implementasi Redesign SawitHub ke Codebase

Salin prompt di bawah ke Claude Code (atau AI engineer kamu) yang akan mengerjakan implementasi pada repository `sawithub-app`.

---

## PROMPT

Saya sudah menyiapkan **redesign lengkap SawitHub** di project ini (file `index.html` + folder `pages/`, `admin/`, `brand/`, `tokens.css`, `primitives.jsx`). Tugasmu: **terapkan persis design tersebut** ke aplikasi yang sudah berjalan tanpa mengubah desain sedikitpun.

### ATURAN UTAMA — JANGAN DILANGGAR

1. **JANGAN ubah desain.** Visual hierarchy, warna, tipografi, spacing, layout, micro-copy — semua harus identik dengan artboard di `index.html`. Kalau ada konflik antara desain dan kebiasaan implementasi, **desain yang menang**.
2. **JANGAN minta konfirmasi.** Login langsung kerjakan. Tidak perlu tanya "apakah saya boleh menulis file?" — langsung edit, refactor, dan commit.
3. **JANGAN ubah arsitektur backend/frontend yang sudah ada.** Tetap pakai routing, state management, dan API client yang sudah dipakai. Hanya sesuaikan tampilan.
4. **JANGAN ubah API contract.** Kalau backend belum punya endpoint untuk fitur tertentu, **hardcode data dummy** dengan struktur yang sama seperti di artboard dan **catat sebagai "Pending Backend API"**.
5. Selesaikan semua page, lalu di akhir kerjamu hasilkan satu file `IMPLEMENTATION_REPORT.md` yang berisi daftar API yang belum aktif (lihat format di bawah).

### KONTEKS PROJECT

- Repo: `sawithub-app` (Turborepo monorepo)
- Apps yang relevan:
  - `apps/frontend` — Vite + React + TypeScript + Tailwind, untuk petani
  - `apps/admin-frontend` — Vite + React + TypeScript, untuk staff internal
  - `apps/backend` — Go services (CorePlotService, CoreHarvestService, dll)
  - `apps/admin-backend` — Go services untuk admin
- Routing: `react-router-dom` v6
- API client: `src/api/client.ts` (axios instance)
- Auth: `src/context/useAuth`, `src/context/useFarm`

### FILE DESAIN YANG HARUS DIIKUTI

Buka project ini sebagai referensi visual:

```
tokens.css                 Design tokens — forest #1A3D2B, amber #D4A827, cream #F5F0E8,
                          Fraunces / DM Sans / JetBrains Mono, shadows, radii.
                          PORTING semua var ke `apps/frontend/src/index.css` dan
                          `apps/admin-frontend/src/index.css`.

primitives.jsx             Komponen dasar (SawitLogo, Card, Stat, Sparkline, Btn, Chip,
                          Ring, PalmFrond/PalmLeaf/SunRays/SoilWaves botanical accents,
                          icon set). Port ke TSX di:
                            apps/frontend/src/components/ds/*.tsx
                            apps/admin-frontend/src/components/ds/*.tsx

brand/logo/*               Logo resmi — copy ke:
                            apps/frontend/public/brand/logo/
                            apps/admin-frontend/public/brand/logo/
                          Update <Logo> component di kedua app untuk mengacu file ini.

pages/Landing.jsx          → apps/frontend/src/pages/Landing.tsx
pages/Login.jsx            → apps/frontend/src/pages/Login.tsx
pages/AuthExtras.jsx       → apps/frontend/src/pages/{Signup,ForgotPassword,
                            ResetPassword,VerifyOtp,NotFound}.tsx
pages/Dashboard.jsx        → apps/frontend/src/pages/Dashboard.tsx
pages/MobileDashboard.jsx  Responsive mobile layout dari Dashboard.tsx (≤768px)
pages/Lahan.jsx            → apps/frontend/src/pages/Lahan.tsx
pages/AddPanen.jsx         → apps/frontend/src/pages/AddPanen.tsx
pages/Laporan.jsx          → apps/frontend/src/pages/LaporanKeuangan/LaporanKeuanganPage.tsx
pages/Kalkulator.jsx       → apps/frontend/src/pages/KalkulatorPupuk.tsx
pages/Subscription.jsx     → apps/frontend/src/pages/Subscription.tsx
pages/Profile.jsx          → apps/frontend/src/pages/Profile.tsx
pages/BrandAssets.jsx      → internal page di /brand (auth-gated, staff only) atau drop

admin/AdminShell.jsx       → apps/admin-frontend/src/components/AdminLayout.tsx
                            + AdminSidebar.tsx + AdminTopbar.tsx
admin/Login.jsx            → apps/admin-frontend/src/pages/Login.tsx (dark editorial 2FA)
admin/Dashboard.jsx        → apps/admin-frontend/src/pages/admin/AdminDashboard.tsx
admin/Users.jsx            → apps/admin-frontend/src/pages/admin/AdminUsers.tsx
admin/Revenue.jsx          → apps/admin-frontend/src/pages/admin/AdminRevenue.tsx (BARU)
admin/Apps.jsx             → apps/admin-frontend/src/pages/admin/AdminApps.tsx (BARU)
admin/pwa/PwaDetail.jsx    → .../admin/apps/PwaDetail.tsx
admin/pwa/PwaVitals.jsx    → .../admin/apps/PwaVitals.tsx
admin/android/AndroidDetail.jsx → .../admin/apps/AndroidDetail.tsx
admin/android/AndroidAnr.jsx   → .../admin/apps/AndroidAnr.tsx
admin/Data.jsx             → apps/admin-frontend/src/pages/admin/AdminData.tsx
admin/Analytics.jsx        → apps/admin-frontend/src/pages/admin/AdminAnalytics.tsx
admin/Monitoring.jsx       → apps/admin-frontend/src/pages/admin/AdminMonitoring.tsx
admin/Audit.jsx            → apps/admin-frontend/src/pages/admin/AdminAudit.tsx
admin/Settings.jsx         → apps/admin-frontend/src/pages/admin/AdminSettings.tsx
```

Tambahkan route baru untuk page yang belum ada di sidebar/menu eksisting (Revenue, Apps, PWA Detail, PWA Vitals, Android Detail, Android ANR).

### LANGKAH KERJA

**Step 1 — Design tokens & dependencies**
- Tambah dependency: `npm i @fontsource-variable/fraunces @fontsource-variable/dm-sans @fontsource/jetbrains-mono` (atau pakai Google Fonts via index.html). Hapus Bricolage Grotesque & Plus Jakarta dari pemakaian.
- Replace isi `apps/frontend/src/index.css` dan `apps/admin-frontend/src/index.css` dengan tokens dari `tokens.css` ini.
- Update `tailwind.config.js` di kedua app: warna `forest/amber/cream/ink/paper/line`, font-family `display/sans/mono`, radius `sm-1/md-1/lg-1`, shadow `sh-card/sh-card-2/sh-card-3`. Hapus token lama yang tidak terpakai.

**Step 2 — Brand assets & Logo component**
- Copy `brand/logo/*` ke `public/brand/logo/` di kedua app.
- Rewrite `components/Logo.tsx` agar pakai SVG inline (lihat `SawitLogo` di `primitives.jsx`) dengan props `size`, `mono`, `showText`. Hapus referensi ke logo lama.

**Step 3 — Design system (`components/ds/`)**
Port primitives ke TSX dengan type safety. Minimal:
- `Card.tsx`, `Stat.tsx`, `Btn.tsx`, `Chip.tsx`, `Ring.tsx`, `Sparkline.tsx`
- `botanical/PalmFrond.tsx`, `PalmLeaf.tsx`, `SunRays.tsx`, `SoilWaves.tsx`, `SeedSprout.tsx`
- Icon set di `components/ds/icons/` (port dari `I.*` di primitives.jsx)
- `SectionLabel.tsx`, `FormField.tsx`, helper editorial (Fraunces italic numeric label)

**Step 4 — Per-page implementation**
Implement page satu per satu sesuai mapping di atas. Untuk tiap page:
1. Buka artboard di `index.html` (panen ke artboard yang sesuai, tekan tombol fullscreen).
2. Recreate persis: struktur HTML, class, inline style, copywriting Indonesia, data dummy.
3. Wire ke API yang sudah ada (`src/api/client.ts`). Untuk endpoint yang TIDAK ada, pakai data dummy persis seperti di artboard dan tag `TODO[backend-pending]`.
4. Pastikan responsive: desktop 1440 → tablet 768 → mobile 390. Mobile dashboard sudah ada referensinya di `pages/MobileDashboard.jsx`.

**Step 5 — Admin app**
- Sidebar harus dark forest dengan environment switcher Prod/Staging/Local.
- Topbar ⌘K command bar.
- Semua angka pakai JetBrains Mono.
- Semua page Plex Mono labels untuk event types, IDs, timestamps.

**Step 6 — Tipografi global**
- Display headlines: Fraunces variable, weight 400-500, optical sizing auto, letter-spacing −0.02 to −0.035em sesuai size.
- Italic Fraunces dipakai untuk emphasized phrases (`<em className="sh-italic">`) dengan warna forest atau amber — JANGAN pakai untuk paragraf biasa.
- Body: DM Sans variable, weight 400-500.
- Angka, kode, monospace context: JetBrains Mono dengan `font-feature-settings: "tnum"`.

**Step 7 — Behavior yang sudah ada — JANGAN ubah**
- Routing tetap `react-router-dom` v6.
- Auth flow tetap pakai `useAuth`, `useFarm`.
- API client tetap `src/api/client.ts`.
- State tetap pakai stores eksisting.
- Form validation logic tetap.
- Analytics events (`trackEvent`, `GAEvents`) tetap dipanggil di tempat yang sama.

### CARA HANDLE API YANG BELUM ADA

Banyak page baru (Revenue, Apps, PWA Vitals, Android ANR, Audit log) **belum punya endpoint backend**. Aturannya:

1. **Buat hook fetch** dengan signature seperti API beneran (misal `useAdminRevenue()`) yang sementara mengembalikan data dummy konstanta — copy persis angka dari artboard.
2. Hook letakkan di `src/api/admin/revenue.ts` dst, supaya nanti tinggal ganti implementasi tanpa ubah komponen.
3. Tag tiap hook dummy dengan komentar:
   ```ts
   // TODO[backend-pending]: GET /api/admin/revenue/overview
   // Expected response shape: { mrr: number, arr: number, ... }
   // See: admin/Revenue.jsx for fixture data
   ```
4. **Tampilkan banner kuning di top dari page tersebut** kalau env != production:
   ```tsx
   {import.meta.env.DEV && (
     <div className="bg-amber-tint border border-amber-soft rounded-md-1 px-4 py-2 text-xs font-mono text-amber-2 mb-4">
       ⚠ Data dummy · API belum tersedia · Lihat IMPLEMENTATION_REPORT.md
     </div>
   )}
   ```
5. Di akhir, **wajib generate `IMPLEMENTATION_REPORT.md`** di root project dengan format:

   ```markdown
   # Implementation Report

   ## Pages selesai
   - [x] /landing
   - [x] /login
   - [x] /signup
   ...

   ## API endpoints PENDING BACKEND
   Endpoint berikut belum tersedia di backend. Frontend sudah pakai data dummy.

   ### Admin
   | Method | Path                                  | Dipakai page          | Expected shape | Owner |
   | ------ | ------------------------------------- | --------------------- | -------------- | ----- |
   | GET    | /api/admin/revenue/overview           | AdminRevenue          | { mrr, arr, churn, arpu } | Backend |
   | GET    | /api/admin/revenue/mrr-movement       | AdminRevenue          | [{ month, new, expansion, churn, contraction }] | Backend |
   | GET    | /api/admin/revenue/plans              | AdminRevenue          | [{ plan, count, mrr }] | Backend |
   | GET    | /api/admin/revenue/payment-methods    | AdminRevenue          | [{ method, count, total }] | Backend |
   | GET    | /api/admin/revenue/transactions       | AdminRevenue          | [{ id, time, customer, amount, status }] | Backend |
   | GET    | /api/admin/apps/overview              | AdminApps             | { pwa, android, ios } | Backend |
   | GET    | /api/admin/apps/pwa/vitals            | PwaVitals             | { lcp, inp, cls, ttfb, perRoute } | Backend |
   | GET    | /api/admin/apps/android/versions      | AndroidDetail         | [{ version, code, count, crashFree }] | Backend |
   | GET    | /api/admin/apps/android/anr           | AndroidAnr            | { rate, perDevice, clusters } | Backend |
   | GET    | /api/admin/monitoring/services        | AdminMonitoring       | [{ name, lat, traffic, status }] | Backend |
   | GET    | /api/admin/audit                      | AdminAudit            | [{ ts, actor, action, target, severity }] | Backend |
   | GET    | /api/admin/analytics/funnel           | AdminAnalytics        | [{ stage, count, pct }] | Backend |
   | GET    | /api/admin/analytics/cohorts          | AdminAnalytics        | [[]] | Backend |
   ... (lengkapi semua yang dummy)

   ### Petani
   | Method | Path                                  | Dipakai page          | Expected shape |
   | ------ | ------------------------------------- | --------------------- | -------------- |
   | GET    | /api/lahan/{id}/health-score          | Lahan                 | { score: number } |
   | GET    | /api/kalkulator/ppks-reference        | KalkulatorPupuk       | { n, p, k per age } |
   ...

   ## Catatan implementasi
   - Font Fraunces/DM Sans/JetBrains Mono ditambah via `@fontsource-variable`.
   - Tailwind diperbarui untuk forest/amber/cream palette.
   - Komponen lama (`Bricolage Grotesque`, dll) sudah dihapus.
   - Mobile dashboard responsive di Dashboard.tsx (breakpoint 768px).
   ```

### CHECKLIST AKHIR

Sebelum selesai:
- [ ] Semua page yang ada di `index.html` (artboard 00 sampai admin terakhir) sudah ada padanannya di `apps/frontend` atau `apps/admin-frontend`.
- [ ] Tidak ada referensi ke font/warna lama (Bricolage Grotesque, Plus Jakarta Sans, deep green #1B4332 versi lama).
- [ ] Logo dipakai dari `brand/logo/` (bukan inline lama).
- [ ] Build sukses: `npm run build` di kedua app tanpa error.
- [ ] Lint sukses: `npm run lint` tanpa error baru.
- [ ] Test e2e existing tetap pass (jangan ubah test, sesuaikan selector kalau perlu).
- [ ] `IMPLEMENTATION_REPORT.md` dibuat di root project dengan daftar lengkap API pending.

### YANG TIDAK PERLU DIKERJAKAN

- Backend Go (jangan sentuh `apps/backend` dan `apps/admin-backend`).
- Database schema (jangan ubah `packages/database`).
- Infra/deployment (`tools/infisical`, `vercel.json`).
- Dokumentasi/marketing copy yang tidak ada di artboard.

Mulai dari Step 1. Kerjakan urut, commit per step dengan pesan jelas (`feat(design): port tokens & tailwind config`, `feat(design): logo component & brand assets`, dst). Setiap kali selesai satu major step, jalankan `npm run build` untuk verifikasi.

Selesai = `IMPLEMENTATION_REPORT.md` terisi lengkap, semua page renderable, build hijau.

---

Akhir prompt.
