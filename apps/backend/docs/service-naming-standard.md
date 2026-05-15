# Service Naming Standard

Status: draft recommendation

## Naming Convention

- Use English names.
- Use PascalCase.
- Use suffix `Service` for service classes/modules.
- Prefer capability-focused names.
- Keep domain context in folder/module grouping.

Recommended format:

- Verbose option: `<Domain><Capability>Service`
- Practical option: `<Capability>Service` (with domain folder namespace)

---

## Recommended Service Names by Domain

### Identity Domain

- `AuthService` -> `IdentityAuthService`
- `UserContactService` -> `IdentityProfileService`
- Session/token service -> `IdentitySessionService`

### Farm Core Domain

- `LahanService` -> `FarmCorePlotService`
- `PanenService` -> `FarmCoreHarvestService`
- `PerawatanService` -> `FarmCoreMaintenanceService`
- `JadwalPerawatanService` -> `FarmCoreMaintenanceScheduleService`
- `FieldChecklistService` -> `FarmCoreChecklistService`

### Farm Finance Domain

- `PendapatanService` -> `FarmFinanceIncomeService`
- `HargaTBSService` -> `FarmFinanceCommodityPriceService`

### Billing Domain

- `SubscriptionService` -> `BillingSubscriptionService`
- `PaymentService` / `BillingService` -> `BillingPaymentService`
- `SubscriptionRevenueService` -> `BillingRevenueService`
- Subscription DB + provider layer (`internal/subscription`) -> `BillingSubscriptionDataService`
- Revenue aggregate query layer (`internal/billing`) -> `BillingRevenueDataService`
- Billing reminder orchestration (nama konseptual; belum ada tipe terpisah di repo) -> `BillingReminderService`
- Billing reminder **worker** (yang ada di kode) -> `BillingReminderWorker` (`internal/jobs/billing_reminder_worker.go`, `NewBillingReminderWorker`)

### Reporting Domain

- `LaporanKeuanganService` -> `ReportingFarmFinanceService`
- Dashboard aggregate (chart + ringkasan operasional) -> `ReportingDashboardService`
- Export service -> `ReportingExportService`

### Notification Domain

- `NotificationService` -> `NotificationCenterService`
- Delivery/email-log service -> `NotificationDeliveryService`

### Platform Domain

- `ThemeConfigService` -> `PlatformThemeService`
- `VisitTrackingService` -> `PlatformTrafficService`
- API monitor / observability -> `PlatformApiObservabilityService` (`internal/platform/monitor.go`)

---

## Preferred Practical Approach

To avoid overly long names:

- Keep domain in directory/module.
- Use short capability service names in code.

Example:

- Directory: `domain/farmfinance`
- Service name: `IncomeService` (instead of `FarmFinanceIncomeService`)

This keeps names readable while preserving domain boundaries.

**Repo ini** saat ini memakai nama **verbose** (`FarmFinanceIncomeService`, dll.) secara konsisten; contoh di atas hanya ilustrasi opsi pendek.

---

## Implementation status

### Identity domain

- Handler split completed: `auth_login_register.go`, `auth_profile.go`, `auth_password_reset.go`, `auth_session.go`.
- Services live in `internal/identity/` (`IdentityAuthService`, `IdentityProfileService`, `IdentitySessionService`).

### Farm Core domain

- Services live in `internal/farmcore/`:
  - `FarmCorePlotService` — lahan (plots)
  - `FarmCoreHarvestService` — panen (harvest) + pendapatan sync helpers
  - `FarmCoreMaintenanceService` — perawatan
  - `FarmCoreMaintenanceScheduleService` — jadwal perawatan + upcoming
  - `FarmCoreChecklistService` — field checklist runs
- Shared row types (`LahanRow`, `PanenRow`, `PerawatanRow`, jadwal/export types) are exported from `internal/farmcore` for handlers and dashboard.
- Jadwal date math tests: `internal/farmcore/jadwal_schedule_test.go`.

### Farm Finance domain

- Services live in `internal/farmfinance/`:
  - `FarmFinanceIncomeService` — pendapatan (CRUD agregat)
  - `FarmFinanceCommodityPriceService` — daftar harga TBS (`t_sawit_hub_harga_tbs`)
- Row types: `PendapatanRow`, `HargaRow` di `internal/farmfinance/types.go` (dipakai `ReportingDashboardService` dan handler pendapatan).

### Billing domain

- Application-facing services live in `internal/billingdomain/` (HTTP-ready orchestration):
  - `BillingSubscriptionService` — membungkus `BillingSubscriptionDataService`: `SubscriptionPayload` → response `GET /api/BillingSubscriptionService/status`; `CheckoutPayload` → response `POST /api/BillingSubscriptionService/checkout` (termasuk `BuildStatusView`); `ProviderName()` untuk guard mock vs Midtrans.
  - `BillingPaymentService` — verifikasi tanda tangan Midtrans (fallback `LookupTransactionStatus`) + `ProcessCallback` / `ApplyCallback` pada lapisan data.
  - `BillingRevenueService` — membungkus `internal/billing.BillingRevenueDataService` (agregat revenue; siap dipakai endpoint admin/report).
- Paket `internal/billing`: `BillingRevenueDataService`. Paket `internal/subscription`: `BillingSubscriptionDataService` (provider Midtrans/mock + kolom langganan di `t_sawit_hub_users`).
- Skema DB **`t_sawit_hub_subscriptions`** dan **`t_sawit_hub_payment_events`** sudah ada (`scripts/schema/non_admin_services_legacy_sync.sql`); akan dipakai untuk persist order/subscription baris dan deduplikasi/audit event Midtrans setelah frontend + gateway siap — backend belum membaca/menulis tabel ini di kode saat ini.
- Pengingat penagihan: hanya worker background `BillingReminderWorker` di `internal/jobs/billing_reminder_worker.go` (`NewBillingReminderWorker`); tidak ada struct `BillingReminderService` terpisah.

### Notification domain

- `internal/notification/NotificationDeliveryService` — persistence + email log + reminder rows (`NewNotificationDeliveryService`).
- `internal/notificationapp/NotificationCenterService` — facade untuk handler (`List`, `MarkRead`, `MarkAllRead`, `DeleteReadNotifications`); `Available()` / `Raw()` untuk job (`BillingReminderWorker`) lewat `Handler.Notification()`. `Raw()` mengembalikan `*notification.NotificationDeliveryService`.

### Platform domain

- `internal/platform/`:
  - `PlatformThemeService` — konfigurasi tema publik (`ThemePublicConfig`).
  - `PlatformTrafficService` — pencatatan visit (geo IP, insert async).
  - `PlatformApiObservabilityService` — middleware + katalog endpoint + `Snapshot()` (`InternalAPISummary`, `InternalAPIStatus` diekspor untuk API internal/admin ke depan).
- Router di `cmd/main.go` memasang `platform.NewPlatformApiObservabilityService().Middleware`; `handler.New` tidak lagi menerima monitor (field yang tidak terpakai dihapus).

### Reporting domain

- Services live in `internal/reporting/`:
  - `ReportingFarmFinanceService` — agregasi laporan keuangan (chart, ranking, detail, summary); `ParseLaporanParams` (query HTTP), `BuildLaporanKeuanganResponse`.
  - `ReportingDashboardService` — agregat dashboard (`Build`: lahan, ringkasan panen/biaya, chart, breakdown biaya, jadwal perawatan mendatang, recent rows); `internal/reporting/dashboard.go`. Handler `GET /api/ReportingDashboardService` memakai service ini + cache Redis.
  - `ReportingExportService` — kirim export laporan ke email (antrean Redis atau langsung), memakai `IdentityProfileService.GetUserContact` untuk penerima.
- Tipe response laporan, dashboard (`DashboardResponse`, dll.), dan request export email: `internal/reporting/types.go`.
