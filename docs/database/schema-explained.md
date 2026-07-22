# SawitHub — Database Schema Reference

> Source of truth: DDL files in `packages/database/`  
> Engine: InnoDB · MySQL · Charset: utf8mb4  
> Collations: `utf8mb4_0900_ai_ci` (most tables) or `utf8mb4_unicode_ci` (billing/notification tables)  
> All relationships are logical (application-enforced). No `FOREIGN KEY ... REFERENCES` constraints exist in the DDL.

---

## Table of Contents

### `sawit_hub_db`
1. [t_sawit_hub_users](#1-t_sawit_hub_users)
2. [t_sawit_hub_lahan](#2-t_sawit_hub_lahan)
3. [t_sawit_hub_panen](#3-t_sawit_hub_panen)
4. [t_sawit_hub_perawatan](#4-t_sawit_hub_perawatan)
5. [t_sawit_hub_pendapatan](#5-t_sawit_hub_pendapatan)
6. [t_sawit_hub_jadwal_perawatan](#6-t_sawit_hub_jadwal_perawatan)
7. [t_sawit_hub_field_checklist_runs](#7-t_sawit_hub_field_checklist_runs)
8. [t_sawit_hub_field_checklist_run_items](#8-t_sawit_hub_field_checklist_run_items)
9. [t_sawit_hub_subscriptions](#9-t_sawit_hub_subscriptions)
10. [t_sawit_hub_payments](#10-t_sawit_hub_payments)
11. [t_sawit_hub_payment_events](#11-t_sawit_hub_payment_events)
12. [t_sawit_hub_subscription_reminders](#12-t_sawit_hub_subscription_reminders)
13. [t_sawit_hub_notifications](#13-t_sawit_hub_notifications)
14. [t_sawit_hub_email_logs](#14-t_sawit_hub_email_logs)
15. [t_sawit_hub_harga_tbs](#15-t_sawit_hub_harga_tbs)
16. [t_sawit_hub_password_resets](#16-t_sawit_hub_password_resets)
17. [t_sawit_hub_visits](#17-t_sawit_hub_visits)
18. [t_sawit_hub_theme_configs](#18-t_sawit_hub_theme_configs)

### `sawit_hub_admin_db`
19. [t_sawit_admin_users](#19-t_sawit_admin_users)
20. [t_sawit_admin_sessions](#20-t_sawit_admin_sessions)
21. [t_sawit_admin_audit_logs](#21-t_sawit_admin_audit_logs)

---

## sawit_hub_db

---

### 1. `t_sawit_hub_users`

**Purpose:** Core user accounts table. Stores authentication credentials (encrypted/hashed), subscription lifecycle state, and billing quota counters. The subscription fields are denormalized onto the user row to allow single-row reads on every authenticated request without JOINs.

**Business logic:** Email and phone are never stored in plaintext. `email_hash` (SHA-256 or similar deterministic hash) is the lookup key; `email_enc` holds the AES-encrypted value for display. The `trial_*_used` counters let the backend enforce per-feature trial quotas without hitting the activity tables.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `user_id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `public_id` | `varchar(36)` | NO | — | UUID exposed to clients; never expose `user_id` |
| `username` | `varchar(50)` | NO | — | |
| `email_hash` | `varchar(64)` | NO | — | Deterministic hash — used for lookup/uniqueness |
| `email_enc` | `text` | NO | — | AES-encrypted email |
| `full_name_enc` | `text` | YES | NULL | AES-encrypted full name |
| `phone_enc` | `text` | YES | NULL | AES-encrypted phone |
| `phone_hash` | `varchar(64)` | YES | NULL | Deterministic hash — used for lookup |
| `password_hash` | `varchar(255)` | NO | — | bcrypt |
| `role` | `enum('user','admin')` | NO | `'user'` | |
| `subscription_status` | `varchar(32)` | NO | `'trialing'` | Values: `trialing`, `active`, `expired`, `cancelled` |
| `trial_starts_at` | `datetime` | YES | `CURRENT_TIMESTAMP` | |
| `trial_ends_at` | `datetime` | YES | `now() + INTERVAL 14 DAY` | |
| `subscription_starts_at` | `datetime` | YES | NULL | Set when subscription activates |
| `subscription_ends_at` | `datetime` | YES | NULL | Set when subscription period ends |
| `last_payment_status` | `varchar(64)` | NO | `''` | Denormalized from latest payment |
| `midtrans_order_id` | `varchar(128)` | NO | `''` | Denormalized latest order reference |
| `plan_name` | `varchar(64)` | NO | `''` | Denormalized plan label |
| `plan_price` | `decimal(12,2)` | NO | `0.00` | Denormalized plan price (IDR) |
| `billing_exempt` | `tinyint(1)` | NO | `0` | Bypass subscription enforcement (internal/demo accounts) |
| `active_farm_limit` | `int` | NO | `1` | Max concurrent active farms allowed |
| `current_active_farm_id` | `varchar(64)` | NO | `''` | `id_lahan` of the currently active farm (string to avoid JOIN) |
| `trial_farm_create_used` | `int` | NO | `0` | Quota counter: farms created during trial |
| `trial_panen_used` | `int` | NO | `0` | Quota counter: harvest records created during trial |
| `trial_perawatan_used` | `int` | NO | `0` | Quota counter: maintenance records during trial |
| `trial_jadwal_used` | `int` | NO | `0` | Quota counter: schedules created during trial |
| `trial_harvest_used` | `int` | NO | `0` | Quota counter: harvest entries during trial |
| `trial_report_export_used` | `int` | NO | `0` | Quota counter: report exports during trial |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |
| `last_seen_at` | `datetime` | YES | NULL | Updated by auth ping middleware (max every 1 min) |
| `deleted_at` | `datetime` | YES | NULL | Soft delete |

**Indexes:**

| Name | Columns | Type | Purpose |
|------|---------|------|---------|
| `PRIMARY` | `user_id` | PK | — |
| `idx_public_id` | `public_id` | UNIQUE | API-safe identifier lookups |
| `idx_email_hash_unique` | `email_hash` | UNIQUE | Login / forgot-password lookup |
| `idx_username_unique` | `username` | UNIQUE | Login / availability check |
| `idx_phone_hash` | `phone_hash` | INDEX | Phone-based lookup |
| `idx_deleted_at` | `deleted_at` | INDEX | Soft-delete filter |
| `idx_deleted_at_user_id` | `(deleted_at, user_id)` | INDEX | Covering index for user list queries |
| `idx_deleted_at_last_seen_at` | `(deleted_at, last_seen_at)` | INDEX | Online user detection |
| `idx_role` | `role` | INDEX | Admin user queries |
| `idx_subscription_status` | `subscription_status` | INDEX | Batch subscription jobs |
| `idx_midtrans_order_id` | `midtrans_order_id` | INDEX | Payment callback user lookup |

---

### 2. `t_sawit_hub_lahan`

**Purpose:** Represents a physical palm oil plantation plot (kebun/lahan) owned by a user. A user may own multiple plots; the subscription tier controls how many can be "active" simultaneously.

**Business logic:** `nama_kebun` is a user-defined label. `jenis_bibit` is the seed/variety type. `tahun_tanam` (planting year) enables age-based yield analysis. Soft delete (`deleted_at`) is used so historical harvest and maintenance data retains its `id_lahan` foreign key even after the user removes the plot.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id_lahan` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `nama_kebun` | `varchar(100)` | NO | — | Plot display name |
| `jenis_bibit` | `varchar(50)` | NO | — | Seed/variety type |
| `lokasi` | `varchar(255)` | NO | — | Location description |
| `luas_ha` | `decimal(10,2)` | NO | — | Area in hectares |
| `jumlah_pohon` | `int` | NO | — | Number of palm trees |
| `tahun_tanam` | `year` | NO | — | Planting year (YYYY) |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |
| `deleted_at` | `datetime` | YES | NULL | Soft delete |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id_lahan` | PK |
| `idx_user_id` | `user_id` | INDEX |
| `idx_user_id_deleted_at` | `(user_id, deleted_at)` | INDEX |
| `idx_deleted_at` | `deleted_at` | INDEX |

---

### 3. `t_sawit_hub_panen`

**Purpose:** Records individual harvest events on a specific plot. The most financially critical table — contains raw input fields plus several **stored generated columns** that compute financial metrics automatically at write time.

**Business logic:** Four generated columns eliminate the risk of denormalization bugs:
- `berat_ton` = `berat_kg / 1000`
- `berat_rata_janjang` = `berat_kg / jumlah_janjang` (average weight per bunch)
- `total_pendapatan` = `berat_kg * harga_per_kg`
- `hasil_bersih` = `total_pendapatan - COALESCE(biaya_panen, 0)`

The composite UNIQUE key `(user_id, id_lahan, tanggal_panen)` prevents duplicate harvest records for the same plot on the same day — a business rule enforced at DB level.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id_panen` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `id_lahan` | `bigint unsigned` | NO | — | → `t_sawit_hub_lahan.id_lahan` |
| `tanggal_panen` | `date` | NO | — | Harvest date |
| `luas_panen_ha` | `decimal(10,2)` | YES | NULL | Area harvested this session |
| `jumlah_janjang` | `int` | YES | NULL | Bunch count |
| `berat_kg` | `decimal(12,2)` | YES | NULL | Total weight in kg |
| `berat_ton` | `decimal(12,4)` | YES | **GENERATED STORED** | `berat_kg / 1000` |
| `berat_rata_janjang` | `decimal(10,3)` | YES | **GENERATED STORED** | `berat_kg / jumlah_janjang` |
| `harga_per_kg` | `decimal(10,2)` | YES | NULL | Price per kg (IDR) |
| `total_pendapatan` | `decimal(14,2)` | YES | **GENERATED STORED** | `berat_kg * harga_per_kg` |
| `biaya_panen` | `decimal(12,2)` | YES | NULL | Harvest cost (labor, transport, etc.) |
| `hasil_bersih` | `decimal(14,2)` | YES | **GENERATED STORED** | `total_pendapatan - COALESCE(biaya_panen,0)` |
| `catatan` | `text` | YES | NULL | Notes |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |
| `deleted_at` | `datetime` | YES | NULL | Soft delete |

**Indexes:**

| Name | Columns | Type | Purpose |
|------|---------|------|---------|
| `PRIMARY` | `id_panen` | PK | — |
| `idx_user_id_id_lahan_tanggal_panen` | `(user_id, id_lahan, tanggal_panen)` | UNIQUE | Prevents duplicate daily harvest per plot |
| `idx_user_id` | `user_id` | INDEX | — |
| `idx_id_lahan` | `id_lahan` | INDEX | — |
| `idx_tanggal_panen` | `tanggal_panen` | INDEX | Date-range queries |
| `idx_user_tanggal` | `(user_id, tanggal_panen)` | INDEX | Dashboard aggregations |
| `idx_deleted_at` | `deleted_at` | INDEX | — |

---

### 4. `t_sawit_hub_perawatan`

**Purpose:** Records individual maintenance/care events on a plot — fertilizing, pesticide application, pruning, etc. Each row is one application of one material type.

**Business logic:** `satuan` (unit) is an enum because the valid units are well-defined domain values (kg, liter, gram, unit, zak, botol). The composite UNIQUE key `(user_id, id_lahan, tanggal_perawatan, jenis_perawatan, bahan)` prevents duplicating the same maintenance activity with the same material on the same day for the same plot, while still allowing multiple different materials on the same day.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id_perawatan` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `id_lahan` | `bigint unsigned` | NO | — | → `t_sawit_hub_lahan.id_lahan` |
| `tanggal_perawatan` | `date` | NO | — | Maintenance date |
| `jenis_perawatan` | `varchar(50)` | NO | — | Category (e.g., pemupukan, penyemprotan) |
| `bahan` | `varchar(150)` | NO | — | Material name (fertilizer/pesticide brand, etc.) |
| `jumlah` | `decimal(10,2)` | YES | NULL | Quantity used |
| `satuan` | `enum('kg','liter','gram','unit','zak','botol')` | NO | `'kg'` | Unit of measure |
| `harga_satuan` | `decimal(12,2)` | YES | NULL | Price per unit (IDR) |
| `total_harga_material` | `decimal(12,2)` | YES | NULL | Material cost total |
| `biaya_pekerja` | `decimal(12,2)` | YES | NULL | Labor cost |
| `total_biaya_perawatan` | `decimal(12,2)` | YES | NULL | Total cost (material + labor) |
| `keterangan` | `text` | YES | NULL | Notes |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |
| `deleted_at` | `datetime` | YES | NULL | Soft delete |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id_perawatan` | PK |
| `idx_user_id_id_lahan_tanggal_perawatan_jenis_perawatan_bahan` | `(user_id, id_lahan, tanggal_perawatan, jenis_perawatan, bahan)` | UNIQUE |
| `idx_user_id` | `user_id` | INDEX |
| `idx_id_lahan` | `id_lahan` | INDEX |
| `idx_perawatan_tanggal` | `tanggal_perawatan` | INDEX |
| `idx_user_id_tanggal_perawatan` | `(user_id, tanggal_perawatan DESC)` | INDEX |
| `idx_user_id_id_lahan_tanggal_perawatan` | `(user_id, id_lahan, tanggal_perawatan DESC)` | INDEX |
| `idx_deleted_at` | `deleted_at` | INDEX |

---

### 5. `t_sawit_hub_pendapatan`

**Purpose:** An income aggregation record per plot per harvest date. Summarizes multiple `panen` events into a financial reporting row with a single generated net income column.

**Business logic:** While `t_sawit_hub_panen` captures operational harvest data, `t_sawit_hub_pendapatan` is the *financial ledger entry*. The two tables serve different concerns: panen = field operation data, pendapatan = accountable income record. The composite UNIQUE includes `deleted_at` (soft-delete-aware uniqueness), which allows a logical re-entry after a soft-deleted record.

`pendapatan_bersih` is a stored generated column: `COALESCE(pendapatan_kotor,0) - COALESCE(biaya_total,0)`.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id_pendapatan` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `id_lahan` | `bigint unsigned` | NO | — | → `t_sawit_hub_lahan.id_lahan` |
| `tanggal_panen` | `date` | NO | — | Harvest date this income is linked to |
| `total_janjang` | `int` | YES | NULL | Total bunch count (summary) |
| `total_berat_kg` | `decimal(12,2)` | NO | — | Total weight in kg |
| `pendapatan_kotor` | `decimal(14,2)` | NO | — | Gross income (IDR) |
| `biaya_total` | `decimal(14,2)` | NO | — | Total costs |
| `pendapatan_bersih` | `decimal(14,2)` | YES | **GENERATED STORED** | `pendapatan_kotor - biaya_total` |
| `catatan` | `text` | YES | NULL | Notes |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |
| `deleted_at` | `datetime` | YES | NULL | Soft delete |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id_pendapatan` | PK |
| `idx_user_id_id_lahan_tanggal_panen_deleted_at` | `(user_id, id_lahan, tanggal_panen, deleted_at)` | UNIQUE |
| `idx_user_id` | `user_id` | INDEX |
| `idx_id_lahan` | `id_lahan` | INDEX |
| `idx_tanggal_panen` | `tanggal_panen` | INDEX |
| `idx_user_id_tanggal_panen` | `(user_id, tanggal_panen DESC)` | INDEX |
| `idx_user_id_id_lahan_tanggal_panen` | `(user_id, id_lahan, tanggal_panen DESC)` | INDEX |
| `idx_deleted_at` | `deleted_at` | INDEX |

---

### 6. `t_sawit_hub_jadwal_perawatan`

**Purpose:** Recurring maintenance schedule definitions. Describes what should be done, on which plot, and how frequently — but does not log individual executions (those are `t_sawit_hub_perawatan` records).

**Business logic:** The `frequensi_tipe` enum covers a wide range of agricultural schedules (weekly through annual, plus custom-day intervals). `frequensi_custom_hari` is only meaningful when `frequensi_tipe = 'custom'`. `is_active = 0` soft-disables a schedule without deleting it. The schedule start/end dates allow seasonal schedules. The backend's `GetUpcomingJadwal` endpoint uses these rows to forecast upcoming work.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id_jadwal_perawatan` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `id_lahan` | `bigint unsigned` | NO | — | → `t_sawit_hub_lahan.id_lahan` |
| `jenis_perawatan` | `varchar(50)` | NO | — | Maintenance type |
| `deskripsi` | `text` | YES | NULL | Description |
| `frequensi_tipe` | `enum(...)` | NO | `'bulanan'` | `mingguan`, `dua_mingguan`, `bulanan`, `dua_bulanan`, `tiga_bulanan`, `empat_bulanan`, `enam_bulanan`, `tahunan`, `dua_kali_tahunan`, `tiga_kali_tahunan`, `custom` |
| `frequensi_custom_hari` | `int` | YES | NULL | Custom interval in days (used when `frequensi_tipe = 'custom'`) |
| `tanggal_mulai` | `date` | NO | — | Schedule start date |
| `tanggal_akhir` | `date` | YES | NULL | Schedule end date (NULL = indefinite) |
| `estimasi_biaya` | `decimal(12,2)` | YES | NULL | Estimated cost per occurrence (IDR) |
| `is_active` | `tinyint(1)` | YES | `1` | 1 = active, 0 = paused |
| `catatan` | `text` | YES | NULL | Notes |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |
| `deleted_at` | `datetime` | YES | NULL | Soft delete |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id_jadwal_perawatan` | PK |
| `idx_user_id` | `user_id` | INDEX |
| `idx_id_lahan` | `id_lahan` | INDEX |
| `idx_user_id_is_active` | `(user_id, is_active)` | INDEX |
| `idx_user_id_id_lahan_is_active` | `(user_id, id_lahan, is_active)` | INDEX |
| `idx_tanggal_mulai` | `tanggal_mulai` | INDEX |
| `idx_deleted_at` | `deleted_at` | INDEX |

---

### 7. `t_sawit_hub_field_checklist_runs`

**Purpose:** A single field inspection session (run) for a specific plot on a specific date. Acts as the header record for a checklist; the individual tasks are in `t_sawit_hub_field_checklist_run_items`.

**Business logic:** This is the "head" of a 1:many parent-child relationship. A run starts as `pending`, transitions to `in_progress`, then `completed` (at which point `completed_at` is stamped). The items inside the run are created with the run and reflect what was checked during the field visit.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id_run` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `id_lahan` | `bigint unsigned` | NO | — | → `t_sawit_hub_lahan.id_lahan` |
| `title` | `varchar(255)` | NO | — | Run/session label |
| `status` | `varchar(32)` | NO | `'pending'` | `pending`, `in_progress`, `completed` |
| `task_date` | `date` | NO | — | Date of field inspection |
| `completed_at` | `datetime` | YES | NULL | Timestamp when all items completed |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |
| `deleted_at` | `datetime` | YES | NULL | Soft delete |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id_run` | PK |
| `idx_checklist_runs_user_date` | `(user_id, task_date)` | INDEX |
| `idx_checklist_runs_status` | `status` | INDEX |
| `idx_checklist_runs_deleted_at` | `deleted_at` | INDEX |

---

### 8. `t_sawit_hub_field_checklist_run_items`

**Purpose:** Individual checklist items belonging to a run. Each row is one thing to check/do during the field inspection.

**Business logic:** Items are ordered by `item_order` for display. `is_required = 1` marks mandatory items that must be completed before a run can transition to `completed`. A run cannot be marked complete if any `is_required` item is still `pending`. No soft delete — items are destroyed with their parent run.

> **Junction role:** This is a **detail/line-item table** (not a true many-to-many junction), providing a one-to-many breakdown of a run's tasks.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id_item` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `id_run` | `bigint unsigned` | NO | — | → `t_sawit_hub_field_checklist_runs.id_run` |
| `item_label` | `varchar(255)` | NO | — | Task description |
| `item_order` | `int` | NO | `0` | Display sort order |
| `is_required` | `tinyint(1)` | NO | `1` | Mandatory to complete the run |
| `status` | `varchar(32)` | NO | `'pending'` | `pending`, `done`, `skipped` |
| `note` | `text` | YES | NULL | Item-level note/observation |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id_item` | PK |
| `idx_checklist_items_run` | `id_run` | INDEX |

---

### 9. `t_sawit_hub_subscriptions`

**Purpose:** Tracks subscription purchase records. One row per payment attempt/order. A user can have multiple rows (renewals, failed attempts); the "current" subscription is determined by status and date range.

**Business logic:** `order_id` is the shared reference with Midtrans and with the `t_sawit_hub_payments` table. The `status` lifecycle is: `pending_payment` → `active` → `expired` / `cancelled`. `starts_at` and `ends_at` define the access window. The user row (`t_sawit_hub_users`) caches the active subscription state for fast reads; this table is the authoritative record.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `provider` | `varchar(32)` | NO | `'midtrans'` | Payment gateway used |
| `order_id` | `varchar(128)` | NO | — | **UNIQUE** — Midtrans order reference |
| `status` | `varchar(32)` | NO | `'pending_payment'` | Subscription lifecycle status |
| `plan_name` | `varchar(64)` | NO | `''` | Plan label at time of purchase |
| `plan_price` | `decimal(12,2)` | NO | `0.00` | Price at time of purchase (IDR) |
| `currency` | `varchar(8)` | NO | `'IDR'` | |
| `starts_at` | `datetime` | YES | NULL | Subscription start |
| `ends_at` | `datetime` | YES | NULL | Subscription end |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |
| `deleted_at` | `datetime` | YES | NULL | Soft delete |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id` | PK |
| `uk_subscriptions_order_id` | `order_id` | UNIQUE |
| `idx_subscriptions_user_status` | `(user_id, status)` | INDEX |
| `idx_subscriptions_deleted_at` | `deleted_at` | INDEX |

---

### 10. `t_sawit_hub_payments`

**Purpose:** Payment transaction records. One row per Midtrans payment transaction. Tracks the raw payment result independent of the subscription it unlocks.

**Business logic:** `order_id` is shared with `t_sawit_hub_subscriptions` — when a payment `settlement` arrives via webhook, the backend updates both the payment row and the subscription row. Keeping them separate allows a subscription to exist without a settled payment (pending state) and allows querying revenue data independently of subscription status.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `provider` | `varchar(32)` | NO | `'midtrans'` | |
| `order_id` | `varchar(128)` | NO | — | **UNIQUE** — matches `t_sawit_hub_subscriptions.order_id` |
| `transaction_id` | `varchar(128)` | YES | NULL | Provider transaction reference |
| `payment_status` | `varchar(32)` | NO | `'pending'` | `pending`, `settlement`, `expire`, `cancel`, `deny`, `failure` |
| `gross_amount` | `decimal(12,2)` | NO | `0.00` | Amount charged (IDR) |
| `currency` | `varchar(8)` | NO | `'IDR'` | |
| `payment_type` | `varchar(64)` | YES | NULL | Method: `bank_transfer`, `gopay`, etc. |
| `paid_at` | `datetime` | YES | NULL | Timestamp of successful payment |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |
| `deleted_at` | `datetime` | YES | NULL | Soft delete |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id` | PK |
| `uk_payments_order_id` | `order_id` | UNIQUE |
| `idx_payments_user_status` | `(user_id, payment_status)` | INDEX |
| `idx_payments_deleted_at` | `deleted_at` | INDEX |
| `idx_payments_status_gross` | `(payment_status, gross_amount)` | INDEX |

---

### 11. `t_sawit_hub_payment_events`

**Purpose:** Idempotency log for incoming Midtrans webhook callbacks. Each webhook delivery is recorded here before processing; the UNIQUE constraint on `(provider, event_key)` prevents double-processing the same webhook.

**Business logic:** Midtrans can deliver the same webhook multiple times. The backend's `PaymentCallback` handler:  
1. Attempts INSERT into this table.  
2. If INSERT fails (duplicate key), the event was already processed — return 200 and stop.  
3. If INSERT succeeds, proceed with payment/subscription state update.  

The `payload` JSON column stores the raw webhook body for audit/debugging. There is no `deleted_at` because event records are immutable.

> **Junction role:** Acts as a **join/bridge** between external payment system events and the internal `order_id` space shared by `payments` and `subscriptions`.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `provider` | `varchar(32)` | NO | — | `midtrans` |
| `event_key` | `varchar(191)` | NO | — | Provider event ID (UNIQUE together with `provider`) |
| `order_id` | `varchar(128)` | NO | — | References payment/subscription order |
| `status` | `varchar(64)` | NO | — | Webhook status value |
| `payload` | `json` | YES | NULL | Raw webhook body |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id` | PK |
| `uk_payment_events_provider_event` | `(provider, event_key)` | UNIQUE |
| `idx_payment_events_order_id` | `order_id` | INDEX |

---

### 12. `t_sawit_hub_subscription_reminders`

**Purpose:** Scheduled email reminder queue for subscription lifecycle events (trial expiry warnings, renewal reminders, payment failures).

**Business logic:** The `BillingReminderWorker` background job runs on a configurable interval and queries `WHERE status = 'pending' AND scheduled_for <= NOW()`. After sending, it stamps `sent_at` and sets `status = 'sent'`. The UNIQUE key `(user_id, reminder_type, scheduled_for)` prevents the worker from scheduling duplicate reminders if it runs more than once before a reminder fires.

`subscription_id` is nullable because trial reminders fire before any subscription row exists.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `subscription_id` | `bigint unsigned` | YES | NULL | → `t_sawit_hub_subscriptions.id` (nullable) |
| `reminder_type` | `varchar(32)` | NO | — | e.g., `trial_expiry_3d`, `renewal_reminder` |
| `scheduled_for` | `datetime` | NO | — | When the reminder should fire |
| `sent_at` | `datetime` | YES | NULL | When the reminder was actually sent |
| `status` | `varchar(32)` | NO | `'pending'` | `pending`, `sent`, `failed` |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id` | PK |
| `uk_subscription_reminders_unique` | `(user_id, reminder_type, scheduled_for)` | UNIQUE |
| `idx_subscription_reminders_status_schedule` | `(status, scheduled_for)` | INDEX |

---

### 13. `t_sawit_hub_notifications`

**Purpose:** In-app notification inbox per user. Notifications are created by backend jobs and displayed in the `/notifikasi` page.

**Business logic:** `action_url` provides a deep-link target so the frontend can route the user directly to the relevant record (e.g., `/subscription` for a payment reminder notification). Soft delete (`deleted_at`) lets users dismiss/clear notifications without losing audit visibility. The index on `(user_id, deleted_at, created_at)` supports the common query: "load all non-deleted notifications for this user, newest first."

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `type` | `varchar(64)` | NO | — | Notification category |
| `title` | `varchar(255)` | NO | — | Short heading |
| `message` | `text` | NO | — | Full notification body |
| `action_url` | `varchar(255)` | YES | NULL | Deep link path |
| `is_read` | `tinyint(1)` | NO | `0` | 0 = unread, 1 = read |
| `read_at` | `datetime` | YES | NULL | When the user opened it |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `deleted_at` | `datetime` | YES | NULL | Soft delete (user dismiss) |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id` | PK |
| `idx_notifications_user_created` | `(user_id, created_at)` | INDEX |
| `idx_notifications_user_read` | `(user_id, is_read)` | INDEX |
| `idx_notifications_deleted_at` | `deleted_at` | INDEX |
| `idx_notifications_user_deleted_created` | `(user_id, deleted_at, created_at)` | INDEX |

---

### 14. `t_sawit_hub_email_logs`

**Purpose:** Audit trail for every email sent by the system. Provides idempotency via `event_key` (like payment events) and debugging visibility for failed sends.

**Business logic:** `event_key` is a deterministic string constructed from the email type and triggering event (e.g., `welcome:{user_id}` or `reset:{user_id}:{timestamp}`). Before sending any email, the backend inserts a row with `status = 'pending'`; if `event_key` already exists, the email has already been sent (idempotent). `user_id` is nullable to support contact-form emails from anonymous visitors.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | YES | NULL | → `t_sawit_hub_users.user_id` (nullable for anon) |
| `event_key` | `varchar(191)` | NO | — | **UNIQUE** — idempotency key |
| `email` | `varchar(191)` | NO | — | Recipient address |
| `type` | `varchar(64)` | NO | — | Email template type |
| `subject` | `varchar(255)` | NO | — | Email subject |
| `status` | `varchar(32)` | NO | `'pending'` | `pending`, `sent`, `failed` |
| `provider` | `varchar(32)` | YES | NULL | `resend` or SMTP |
| `error_message` | `text` | YES | NULL | Failure reason |
| `sent_at` | `datetime` | YES | NULL | Delivery timestamp |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id` | PK |
| `uk_email_logs_event_key` | `event_key` | UNIQUE |
| `idx_email_logs_user_created` | `(user_id, created_at)` | INDEX |

---

### 15. `t_sawit_hub_harga_tbs`

**Purpose:** User-recorded commodity price for Fresh Fruit Bunches (Tandan Buah Segar / TBS). Users log the local mill price they received so the system can pre-fill harvest records and track price history.

**Business logic:** Each user maintains their own price history — there is no shared market price feed. `sumber` captures the price source (mill name, market reference, etc.). These records feed the `harga_per_kg` pre-fill in harvest entry forms and the price trend charts.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id_harga` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `user_id` | `bigint unsigned` | NO | — | → `t_sawit_hub_users.user_id` |
| `tanggal` | `date` | NO | — | Price date |
| `harga_per_kg` | `decimal(10,2)` | NO | — | Price per kg (IDR) |
| `sumber` | `varchar(100)` | YES | NULL | Price source |
| `catatan` | `text` | YES | NULL | Notes |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id_harga` | PK |
| `idx_user_id` | `user_id` | INDEX |
| `idx_tanggal` | `tanggal` | INDEX |

---

### 16. `t_sawit_hub_password_resets`

**Purpose:** Time-limited OTP codes for the forgot-password flow. The PK is a UUID string, not an auto-increment, to make reset URLs non-enumerable.

**Business logic:** Flow: user submits email → backend hashes email → looks up by `email_hash` → creates a row with a 6-digit `code` and 15-minute `expires_at` → sends code via email. On verify: look up by `(email_hash, code)` where `used_at IS NULL AND expires_at > NOW()`. On successful reset: stamp `used_at`. The composite index on `(email_hash, code, used_at, created_at)` covers the full verification query as a covering index.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `varchar(36)` | NO | — | **PK** — UUID string |
| `email_hash` | `varchar(64)` | NO | — | Deterministic hash of the reset email |
| `code` | `varchar(6)` | NO | — | 6-digit OTP |
| `expires_at` | `datetime` | NO | — | Token expiry |
| `used_at` | `datetime` | YES | NULL | Stamped on successful reset |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id` | PK |
| `idx_email_hash` | `email_hash` | INDEX |
| `idx_password_resets_lookup` | `(email_hash, code, used_at, created_at)` | INDEX |

---

### 17. `t_sawit_hub_visits`

**Purpose:** Anonymous page visit analytics. Captures each page view from the frontend's `useVisitTracker` hook.

**Business logic:** Fully anonymous — no `user_id` column. `visitor_id` is a browser-generated persistent identifier (e.g., stored in localStorage); `session_id` is per-session. IP addresses are stored for geo-lookup but are not linked to user accounts. PK is a UUID string. Used by the admin dashboard for traffic analytics.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `varchar(36)` | NO | — | **PK** — UUID string |
| `session_id` | `varchar(64)` | YES | NULL | Browser session ID |
| `visitor_id` | `varchar(64)` | YES | NULL | Persistent anonymous visitor ID |
| `ip_address` | `varchar(45)` | YES | NULL | IPv4 or IPv6 |
| `device_type` | `varchar(10)` | YES | NULL | `mobile`, `desktop`, `tablet` |
| `country` | `varchar(100)` | YES | NULL | |
| `city` | `varchar(100)` | YES | NULL | |
| `page` | `varchar(255)` | YES | NULL | Route path visited |
| `created_at` | `timestamp` | YES | `CURRENT_TIMESTAMP` | Note: `timestamp` type (not `datetime`) |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `id` | PK |
| `idx_visits_created` | `created_at` | INDEX |
| `idx_visits_device` | `device_type` | INDEX |
| `idx_visits_session` | `session_id` | INDEX |

---

### 18. `t_sawit_hub_theme_configs`

**Purpose:** Singleton-style table storing the global UI theme configuration for the application. Modified by admins via the admin panel; consumed by the `GET /api/PlatformThemeService` public endpoint at app startup.

**Business logic:** This table is designed to hold a single active row (the currently deployed theme). There is no FK relationship — it is a free-standing configuration store. All color values are 7-character hex codes (`#rrggbb`). Default values match the brand palette (`#16a34a` green / `#059669` emerald / `#f97316` orange).

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `primary_color` | `varchar(7)` | YES | `'#16a34a'` | Hex color |
| `secondary_color` | `varchar(7)` | YES | `'#059669'` | Hex color |
| `accent_color` | `varchar(7)` | YES | `'#f97316'` | Hex color |
| `background_color` | `varchar(7)` | YES | `'#ffffff'` | Hex color |
| `text_color` | `varchar(7)` | YES | `'#111827'` | Hex color |
| `border_color` | `varchar(7)` | YES | `'#e5e7eb'` | Hex color |
| `dark_mode` | `tinyint(1)` | YES | `0` | 0 = light, 1 = dark |
| `theme_mode` | `varchar(20)` | YES | `'light'` | `light`, `dark`, `auto` |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |

**Indexes:** None (singleton-pattern table, PK only).

---

## sawit_hub_admin_db

---

### 19. `t_sawit_admin_users`

**Purpose:** Admin panel user accounts. Completely separate from `t_sawit_hub_users` — different DB, different JWT secret (`ADMIN_JWT_SECRET`), different role model. Uses the same encryption approach (email/phone hash + enc pattern).

**Business logic:** `role` is `admin | super_admin` (no plain `user` role). `legacy_user_id` is a soft cross-database pointer to `sawit_hub_db.t_sawit_hub_users.user_id` — populated during migration of admin accounts that previously existed in the main users table. New admin accounts have `legacy_user_id = NULL`. `is_active` acts as an account enable/disable switch that the super_admin can toggle without deleting the account.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `admin_user_id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `legacy_user_id` | `bigint unsigned` | YES | NULL | Cross-DB soft ref → `sawit_hub_db.t_sawit_hub_users.user_id` |
| `public_id` | `varchar(36)` | NO | — | **UNIQUE** — UUID exposed to clients |
| `username` | `varchar(50)` | NO | — | **UNIQUE** |
| `email_hash` | `varchar(64)` | NO | — | **UNIQUE** — deterministic hash |
| `email_enc` | `text` | NO | — | AES-encrypted email |
| `full_name_enc` | `text` | YES | NULL | AES-encrypted full name |
| `phone_enc` | `text` | YES | NULL | AES-encrypted phone |
| `phone_hash` | `varchar(64)` | YES | NULL | **UNIQUE** — deterministic hash |
| `password_hash` | `varchar(255)` | NO | — | bcrypt |
| `role` | `enum('admin','super_admin')` | NO | `'admin'` | |
| `is_active` | `tinyint(1)` | NO | `1` | Account enabled flag |
| `last_login_at` | `datetime` | YES | NULL | Last successful login |
| `migrated_at` | `datetime` | YES | NULL | When account was migrated from main DB |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |
| `updated_at` | `datetime` | NO | `CURRENT_TIMESTAMP ON UPDATE` | |
| `deleted_at` | `datetime` | YES | NULL | Soft delete |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `admin_user_id` | PK |
| `idx_admin_public_id` | `public_id` | UNIQUE |
| `idx_admin_email_hash` | `email_hash` | UNIQUE |
| `idx_admin_username` | `username` | UNIQUE |
| `idx_admin_phone_hash` | `phone_hash` | UNIQUE |
| `idx_admin_role` | `role` | INDEX |
| `idx_admin_is_active` | `is_active` | INDEX |
| `idx_admin_deleted_at` | `deleted_at` | INDEX |
| `idx_admin_legacy_user_id` | `legacy_user_id` | INDEX |

---

### 20. `t_sawit_admin_sessions`

**Purpose:** JWT session tracking for admin users. Enables per-session revocation and the "logout all devices" feature. The `jti` (JWT ID) claim in every issued JWT is stored here so the auth middleware can verify a token hasn't been revoked before accepting it.

**Business logic:** Every successful login creates one row. The middleware checks `WHERE jti = ? AND revoked_at IS NULL AND token_expires_at > NOW()`. On logout, `revoked_at` is stamped and `revoke_reason` set (e.g., `manual`, `logout_all`, `password_change`). On `logout-all`, all rows for `admin_user_id` with `revoked_at IS NULL` are batch-updated.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `session_id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `admin_user_id` | `bigint unsigned` | NO | — | → `t_sawit_admin_users.admin_user_id` |
| `jti` | `varchar(64)` | NO | — | **UNIQUE** — JWT `jti` claim |
| `token_issued_at` | `datetime` | NO | — | JWT `iat` |
| `token_expires_at` | `datetime` | NO | — | JWT `exp` |
| `revoked_at` | `datetime` | YES | NULL | NULL = valid, set = revoked |
| `revoke_reason` | `varchar(100)` | YES | NULL | Reason string |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `session_id` | PK |
| `idx_admin_session_jti` | `jti` | UNIQUE |
| `idx_admin_session_user` | `admin_user_id` | INDEX |
| `idx_admin_session_revoked` | `revoked_at` | INDEX |
| `idx_admin_session_expires` | `token_expires_at` | INDEX |

---

### 21. `t_sawit_admin_audit_logs`

**Purpose:** Immutable audit trail of every significant admin action (user role changes, deactivations, password resets, settings updates, system kill-switch toggles). Satisfies compliance/accountability requirements.

**Business logic:** `admin_user_id` is nullable — system-generated actions (cron jobs, automated processes) can produce audit entries without an acting human admin. `target_type` + `target_id` form a polymorphic reference (e.g., `target_type = 'user'`, `target_id = '42'`). `metadata_json` captures the before/after state or request payload. Rows are never updated or deleted — the table grows append-only.

> **No soft delete** — audit logs are immutable by design.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `audit_id` | `bigint unsigned` | NO | AUTO_INCREMENT | **PK** |
| `admin_user_id` | `bigint unsigned` | YES | NULL | → `t_sawit_admin_users.admin_user_id` (nullable for system actions) |
| `action` | `varchar(120)` | NO | — | Action identifier, e.g., `change_role`, `deactivate_user` |
| `target_type` | `varchar(80)` | YES | NULL | Entity type targeted, e.g., `user`, `settings` |
| `target_id` | `varchar(120)` | YES | NULL | Entity ID targeted |
| `ip_address` | `varchar(64)` | YES | NULL | Actor's IP address |
| `user_agent` | `varchar(255)` | YES | NULL | Actor's browser/client |
| `metadata_json` | `json` | YES | NULL | Before/after state or request payload |
| `created_at` | `datetime` | NO | `CURRENT_TIMESTAMP` | |

**Indexes:**

| Name | Columns | Type |
|------|---------|------|
| `PRIMARY` | `audit_id` | PK |
| `idx_admin_audit_user` | `admin_user_id` | INDEX |
| `idx_admin_audit_action` | `action` | INDEX |
| `idx_admin_audit_created` | `created_at` | INDEX |

---

## Junction / Bridge Table Analysis

The schema contains **no true many-to-many junction tables**. All relationships are direct parent-child (1:many). However, two tables serve a **bridge/coordination role**:

### `t_sawit_hub_field_checklist_run_items` — Line-item bridge
- **Pattern:** Master-detail (order header / order lines)
- **Purpose:** Breaks a single checklist run into discrete trackable items
- **Why separate:** Supports variable-length checklists per run, per-item status tracking, required vs optional items, and individual notes — none of which are possible with a single-row run record
- **Relationship:** `t_sawit_hub_field_checklist_runs` 1 ──── ∞ `t_sawit_hub_field_checklist_run_items`

### `t_sawit_hub_payment_events` — Idempotency bridge
- **Pattern:** Event sourcing / webhook deduplication
- **Purpose:** Bridges the external Midtrans webhook domain into the internal payment/subscription domain
- **Why separate:** Webhooks can arrive multiple times, out of order, or before the order row exists. This table absorbs all events safely; the downstream payment + subscription rows are only updated once per event key. Also serves as a raw payload archive for debugging disputes
- **Relationship:** Midtrans → `t_sawit_hub_payment_events` → (resolves to) `t_sawit_hub_payments` + `t_sawit_hub_subscriptions` via `order_id`

### `t_sawit_hub_subscription_reminders` — Scheduling bridge
- **Pattern:** Outbox / scheduled task queue
- **Purpose:** Decouples "when to remind" from "which user / which subscription" — the background worker (`BillingReminderWorker`) polls this table as its work queue
- **Why separate from notifications:** Reminders are *scheduled future actions* requiring retry logic, deduplication (UNIQUE key), and status tracking. `t_sawit_hub_notifications` holds *delivered* in-app messages
- **Relationship:** `t_sawit_hub_users` ──── `t_sawit_hub_subscription_reminders` ◦─── `t_sawit_hub_subscriptions`

---

## Design Patterns Summary

| Pattern | Tables |
|---------|--------|
| **Encrypt-then-hash** (never plaintext PII) | `users`, `admin_users` — `email_enc`/`email_hash`, `phone_enc`/`phone_hash` |
| **Soft delete** (`deleted_at`) | `lahan`, `panen`, `perawatan`, `pendapatan`, `jadwal_perawatan`, `checklist_runs`, `subscriptions`, `payments`, `notifications`, `admin_users` |
| **Stored generated columns** (DB-computed financials) | `panen` (4 columns), `pendapatan` (1 column) |
| **Denormalized subscription cache on user row** | `users.subscription_status`, `users.midtrans_order_id`, etc. — avoids JOIN on every auth check |
| **Idempotency keys** | `email_logs.event_key`, `payment_events.(provider,event_key)` |
| **UUID string PKs for enumeration-sensitive tables** | `password_resets.id`, `visits.id` |
| **Logical (app-enforced) FKs only** | All 22 tables — no `FOREIGN KEY REFERENCES` constraints |
| **Composite unique keys as business rules** | `panen(user_id,id_lahan,tanggal_panen)`, `perawatan(user,lahan,date,type,material)`, `pendapatan(user,lahan,date,deleted_at)`, `reminders(user,type,scheduled_for)` |
| **Append-only audit log** | `t_sawit_admin_audit_logs` — no update/delete, no `deleted_at` |
