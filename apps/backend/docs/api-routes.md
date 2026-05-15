# Daftar API HTTP (backend SawitHub)

Path di bawah adalah **path aktual** (selaras nama service di [service-naming-standard.md](./service-naming-standard.md)):

- Segment pertama setelah `/api` mengikuti **tipe service Go**, dengan aturan penyingkat:
  - `FarmFinance*` → hilangkan awalan `Farm` (mis. `FarmFinanceIncomeService` → `FinanceIncomeService`).
  - `FarmCore*` → hilangkan `Farm` (mis. `FarmCorePlotService` → `CorePlotService`).
- `Identity*`, `Billing*`, `Reporting*`, `Notification*`, `Platform*` memakai nama tipe penuh.

Base URL: `https://<host>`; semua contoh di bawah menambahkan prefix `/api`.

---

## Operasional

| Method | Path |
|--------|------|
| GET | `/health` |
| GET | `/api/health` |
| *static* | `/static/*` |

---

## Platform

| Service (tipe) | Method | Path |
|----------------|--------|------|
| `PlatformThemeService` | GET | `/api/PlatformThemeService` |
| `PlatformTrafficService` | POST | `/api/PlatformTrafficService` |
| *(form publik; bukan tipe `*Service` di kode)* | POST | `/api/Contact` |

---

## Billing (publik / gateway)

| Service (tipe) | Method | Path |
|----------------|--------|------|
| `BillingPaymentService` | POST | `/api/BillingPaymentService/callback` |
| `BillingPaymentService` | POST | `/api/BillingPaymentService/mock/callback` |

---

## Identity (publik)

| Service (tipe) | Method | Path |
|----------------|--------|------|
| `IdentityAuthService` | POST | `/api/IdentityAuthService/register` |
| `IdentityAuthService` | POST | `/api/IdentityAuthService/login` |
| `IdentityAuthService` | POST | `/api/IdentityAuthService/forgot-password` |
| `IdentityAuthService` | POST | `/api/IdentityAuthService/verify-reset` |
| `IdentityAuthService` | POST | `/api/IdentityAuthService/reset-password` |

---

## Terlindungi (JWT + middleware)

### Identity

| Service (tipe) | Method | Path |
|----------------|--------|------|
| `IdentityAuthService` | GET | `/api/IdentityAuthService/me` |
| `IdentityAuthService` | GET | `/api/IdentityAuthService/ping` |
| `IdentitySessionService` | POST | `/api/IdentitySessionService/logout` |
| `IdentitySessionService` | POST | `/api/IdentitySessionService/logout-all` |
| `IdentityProfileService` | PUT | `/api/IdentityProfileService/update-full-name` |
| `IdentityProfileService` | PUT | `/api/IdentityProfileService/update-email` |
| `IdentityProfileService` | PUT | `/api/IdentityProfileService/update-phone` |
| `IdentityProfileService` | PUT | `/api/IdentityProfileService/update-username` |
| `IdentityAuthService` | PUT | `/api/IdentityAuthService/update-password` |

### Reporting & billing aplikasi

| Service (tipe) | Method | Path |
|----------------|--------|------|
| `ReportingDashboardService` | GET | `/api/ReportingDashboardService` |
| `BillingSubscriptionService` | GET | `/api/BillingSubscriptionService/status` |
| `BillingSubscriptionService` | POST | `/api/BillingSubscriptionService/checkout` |
| `ReportingFarmFinanceService` | GET | `/api/ReportingFarmFinanceService` |
| `ReportingExportService` | POST | `/api/ReportingExportService/email-export` |

**Frontend SawitHub:** halaman `/subscription` (setelah login) memakai `BillingSubscriptionService/status` dan `checkout`; alur pembayaran **mock** memunculkan settlement yang memanggil `POST /api/BillingPaymentService/mock/callback`.

### Notification

| Service (tipe) | Method | Path |
|----------------|--------|------|
| `NotificationCenterService` | GET | `/api/NotificationCenterService` |
| `NotificationCenterService` | PATCH | `/api/NotificationCenterService/read-all` |
| `NotificationCenterService` | DELETE | `/api/NotificationCenterService/read` |
| `NotificationCenterService` | PATCH | `/api/NotificationCenterService/{id}/read` |

### Farm Core → URL singkat

| Service (tipe) | Method | Path |
|----------------|--------|------|
| `FarmCorePlotService` → `CorePlotService` | GET | `/api/CorePlotService` |
| | POST, PUT, DELETE | `/api/CorePlotService`, `/api/CorePlotService/{id}` |
| `FarmCoreHarvestService` → `CoreHarvestService` | GET | `/api/CoreHarvestService`, `/api/CoreHarvestService/{id}` |
| | POST, PUT, DELETE | `/api/CoreHarvestService`, `/api/CoreHarvestService/{id}` |
| `FarmCoreMaintenanceService` → `CoreMaintenanceService` | GET | `/api/CoreMaintenanceService` |
| | POST, PUT, DELETE | `/api/CoreMaintenanceService`, `/api/CoreMaintenanceService/{id}` |
| `FarmCoreMaintenanceScheduleService` → `CoreMaintenanceScheduleService` | GET | `/api/CoreMaintenanceScheduleService/upcoming`, `/api/CoreMaintenanceScheduleService` |
| | POST, PUT, DELETE | `/api/CoreMaintenanceScheduleService`, `/api/CoreMaintenanceScheduleService/{id}` |
| `FarmCoreChecklistService` → `CoreChecklistService` | GET, POST | `/api/CoreChecklistService` |
| | PATCH | `/api/CoreChecklistService/{id}/status` |

### Farm Finance → URL singkat

| Service (tipe) | Method | Path |
|----------------|--------|------|
| `FarmFinanceIncomeService` → `FinanceIncomeService` | GET, POST, PUT, DELETE | `/api/FinanceIncomeService`, `/api/FinanceIncomeService/{id}` |
| `FarmFinanceCommodityPriceService` → `FinanceCommodityPriceService` | GET | `/api/FinanceCommodityPriceService` |

---

## Middleware

- **`SUBSCRIPTION_ENFORCEMENT`**: tulis + beberapa GET (`CoreMaintenanceService`, `CoreMaintenanceScheduleService/upcoming`, `CoreMaintenanceScheduleService`) memakai **`RequireFullAccess`**.
- **`POST /api/CoreHarvestService`**: jika enforcement aktif → **`RequireFeature(create harvest)`**.
- **`GET /api/CoreChecklistService`** di luar grup full-access; **`POST` / `PATCH`** checklist di grup write.

---

## Pemeliharaan

Sumber kebenaran routing: `cmd/main.go`. Setelah mengubah router, perbarui file ini dan katalog di `internal/platform/monitor.go` (`defaultAPICatalog`).
