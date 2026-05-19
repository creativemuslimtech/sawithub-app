# SawitHub Redesign — Implementation Report

**Design system:** "Modern Agrarian Premium" · Forest (#1A3D2B) / Amber (#D4A827) / Cream (#F5F0E8)  
**Date:** 2026-05-19  
**TypeScript:** Both apps pass `tsc -b` with zero errors.

---

## Status Halaman

### Frontend (`apps/frontend`)

| Halaman | Route | Status | Catatan |
|---------|-------|--------|---------|
| Landing | `/` | ✅ Selesai | |
| Login | `/login` | ✅ Selesai | |
| Signup | `/signup` | ✅ Selesai | |
| Forgot Password | `/forgot-password` | ✅ Selesai | |
| Reset Password | `/reset-password` | ✅ Selesai | |
| Verify OTP | `/verify-otp` | ✅ Selesai | Data dummy — pending backend |
| Dashboard | `/dashboard` | ✅ Selesai | |
| Lahan | `/lahan` | ✅ Selesai | |
| Panen | `/panen` | ✅ Selesai | |
| Perawatan | `/perawatan` | ✅ Selesai | |
| Jadwal Perawatan | `/jadwal-perawatan` | ✅ Selesai | |
| Pendapatan | `/pendapatan` | ✅ Selesai | |
| Harga TBS | `/harga-tbs` | ✅ Selesai | |
| Keuangan | `/keuangan` | ✅ Selesai | |
| Laporan Keuangan | `/laporan-keuangan` | ✅ Selesai | |
| Kalkulator Pupuk | `/kalkulator-pupuk` | ✅ Selesai | |
| Subscription | `/subscription` | ✅ Selesai | |
| Profil | `/profile` | ✅ Selesai | |
| Notifikasi | `/notifikasi` | ✅ Selesai | |

### Admin Frontend (`apps/admin-frontend`)

| Halaman | Route | Status | Catatan |
|---------|-------|--------|---------|
| Overview | `/admin` | ✅ Selesai | |
| Pengguna | `/admin/users` | ✅ Selesai | |
| Revenue | `/admin/revenue` | ✅ Selesai | Data dummy — pending backend |
| Apps | `/admin/apps` | ✅ Selesai | Data dummy — pending backend |
| PWA Detail | `/admin/apps/pwa` | ✅ Selesai | Data dummy — pending backend |
| PWA Vitals | `/admin/apps/pwa/vitals` | ✅ Selesai | Data dummy — pending backend |
| Android Detail | `/admin/apps/android` | ✅ Selesai | Data dummy — pending backend |
| Android ANR | `/admin/apps/android/anr` | ✅ Selesai | Data dummy — pending backend |
| Data | `/admin/data` | ✅ Selesai | |
| Analytics | `/admin/analytics` | ✅ Selesai | |
| Monitor | `/admin/monitoring` | ✅ Selesai | |
| Audit | `/admin/audit` | ✅ Selesai | |
| Pengaturan | `/admin/settings` | ✅ Selesai | |

---

## Pending Backend APIs

Semua halaman berikut menggunakan **data dummy hardcoded** dan perlu disambungkan ke API backend.

### Revenue (`AdminRevenue.tsx`)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/admin/RevenueService/mrr` | GET | MRR, ARR, subscriber count, churn rate |
| `/admin/RevenueService/movements` | GET | New/expansion/contraction/churned MRR |
| `/admin/RevenueService/plans` | GET | Breakdown per paket berlangganan |
| `/admin/RevenueService/transactions` | GET | Transaksi subscription terbaru |

### Apps Overview (`AdminApps.tsx`)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/admin/AppService/installs` | GET | Jumlah install aktif per platform |
| `/admin/AppService/versions` | GET | Adopsi versi per platform |
| `/admin/AppService/vitals` | GET | Crash-free rate, ANR, startup time |
| `/admin/AppService/releases` | GET | Riwayat rilis |

### PWA Detail (`PwaDetail.tsx`)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/admin/AppService/pwa/vitals` | GET | Core Web Vitals 75p (LCP, INP, CLS) |
| `/admin/AppService/pwa/installs` | GET | Funnel install, push subscription stats |
| `/admin/AppService/pwa/sw` | GET | Service worker cache state, bg-sync queue |

### PWA Vitals (`PwaVitals.tsx`)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/admin/AppService/pwa/vitals/routes` | GET | CWV 75p per route, 28 hari |

### Android Detail (`AndroidDetail.tsx`)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/admin/AppService/android/versions` | GET | Adopsi versi, crash-free, ANR-free |
| `/admin/AppService/android/devices` | GET | Distribusi OS & device |
| `/admin/AppService/android/crashes` | GET | Top crash clusters (Firebase Crashlytics) |
| `/admin/AppService/android/reviews` | GET | Play Store rating & ulasan |

### Android ANR (`AndroidAnr.tsx`)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/admin/AppService/android/anr` | GET | ANR rate, device clusters, stack traces |

### OTP Verify (`VerifyOtp.tsx`)

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/IdentityAuthService/otp/verify` | POST | Verifikasi kode OTP 6-digit |
| `/IdentityAuthService/otp/resend` | POST | Kirim ulang OTP (WA/SMS/panggilan) |

---

## Catatan Implementasi

### Dev Banner

Semua halaman dummy menampilkan banner dev-only:
```
⚠ Data dummy · API belum tersedia · Lihat IMPLEMENTATION_REPORT.md
```
Hanya muncul di `import.meta.env.DEV`, tidak terlihat di production build.

### Navigasi Sub-halaman Apps

- `/admin/apps` → klik kartu **PWA** → `/admin/apps/pwa`
- `/admin/apps/pwa` → tombol "Web Vitals per-route →" → `/admin/apps/pwa/vitals`
- `/admin/apps` → klik kartu **Android** → `/admin/apps/android`
- `/admin/apps/android` → tombol "ANR per device →" → `/admin/apps/android/anr`

### ESLint Config

`apps/frontend/eslint.config.js` — ditambahkan agar `_prefix` vars tidak diflags:
```js
'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
```

### TypeScript Build Notes

- `apps/frontend`: strict JSX, `erasableSyntaxOnly: true`, `noUnusedLocals: true`
- `apps/admin-frontend`: sama dengan di atas
- Semua halaman baru menggunakan `import.meta.env.DEV` untuk conditional rendering banner

---

*Terakhir diperbarui: 19 Mei 2026*
