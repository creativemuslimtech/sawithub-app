# Product Requirements Document
# SawitHub — Digital Palm Oil Plantation Management Platform

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Status** | Approved for Development |
| **Product** | SawitHub |
| **Platform** | Web (PWA) · Android |
| **Market** | Indonesia |
| **Currency / Language** | IDR · Bahasa Indonesia |
| **Primary Contact** | Product Team |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [User Stories](#5-user-stories)
6. [Core Features & Acceptance Criteria](#6-core-features--acceptance-criteria)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Out of Scope](#8-out-of-scope)
9. [Appendix — Glossary](#9-appendix--glossary)

---

## 1. Executive Summary

SawitHub is a **SaaS platform for small-to-medium palm oil (kelapa sawit) plantation owners and managers in Indonesia**. The platform digitalizes the paper-based record-keeping workflows that dominate the sector today: harvest logs, maintenance schedules, material cost tracking, commodity price history, and financial reporting.

Plantation owners who use SawitHub gain a real-time view of per-plot yield performance, cost-of-production breakdowns, and net income trends — information that currently exists only in notebooks, WhatsApp groups, and the memory of the kebun mandor (plantation supervisor). The product is delivered as a mobile-first Progressive Web App with an Android native wrapper, ensuring it works in low-bandwidth rural environments without requiring Play Store updates for each release.

Revenue model: monthly SaaS subscription at **IDR 30,000/month** with a **14-day free trial**. The trial allows meaningful product evaluation; the paid tier unlocks unlimited data entry and export features.

---

## 2. Problem Statement

### 2.1 Context

Indonesia is the world's largest producer of crude palm oil (CPO), with over 16 million hectares under cultivation. Roughly 40% of that area is owned by smallholders — individual farmers and families managing plots typically between 2–25 hectares. This segment is largely undigitalized.

### 2.2 The Pain

**Smallholder plantation owners cannot make data-driven decisions because they have no data.**

The current state for the majority of kebun sawit owners:

| Pain | Current Workaround | Cost of the Workaround |
|------|--------------------|----------------------|
| Harvest records are scattered | Paper notebooks, WhatsApp voice notes | Cannot compute yield trends; data lost when book is lost |
| Maintenance costs are untracked | Receipts in a folder, memory | Cannot calculate true cost-of-production; can't tell if a treatment is profitable |
| TBS prices fluctuate weekly | Mill price board, informal networks | No personal price history; can't correlate price changes with income |
| No financial visibility | Year-end summary from accountant | 12-month lag before understanding profitability |
| Multiple plots are managed inconsistently | Separate books per plot | No consolidated view; can't compare plot performance |
| Maintenance scheduling is informal | Verbal reminders, calendar notes | Missed treatments → yield loss |

### 2.3 Opportunity

No product currently addresses the *full* operational loop of a smallholder palm oil owner in a single mobile-friendly application. Existing agricultural software is designed for large agribusinesses with dedicated agronomists; it is too complex, too expensive, and not available in Bahasa Indonesia.

SawitHub can own this gap with a focused, affordable, mobile-first product.

### 2.4 Hypothesis

> If we give smallholder palm oil owners a simple way to record harvests, maintenance activities, and costs on their phone — and automatically compute their net income, yield trends, and maintenance cost breakdowns — they will be able to identify their least-profitable plots, optimize their maintenance spending, and negotiate better prices at mills.

---

## 3. Goals & Success Metrics

### 3.1 Business Goals

| Goal | Metric | Target (12 months post-launch) |
|------|--------|-------------------------------|
| Establish paid user base | Monthly Active Paid Users | 1,000 |
| Validate willingness to pay | Trial-to-paid conversion rate | ≥ 25% |
| Validate retention | Month-2 retention rate | ≥ 60% |
| Revenue | Monthly Recurring Revenue (MRR) | IDR 30,000,000 |
| Reduce churn | Monthly churn rate | ≤ 8% |

### 3.2 User Goals

| Goal | Metric |
|------|--------|
| Users understand their plantation economics | ≥ 70% of active users view the Financial Report at least once per month |
| Users log consistently | ≥ 3 harvest records per active user per month |
| Users engage with scheduling | ≥ 50% of users create at least one maintenance schedule |

### 3.3 Product Quality Goals

| Metric | Target |
|--------|--------|
| App load time (3G) | < 4 seconds |
| API p95 response time | < 500ms |
| Uptime | ≥ 99.5% |
| Data loss incidents | 0 |

---

## 4. User Personas

### Persona 1: Pak Hendra — The Smallholder Owner
*Primary user · Role: `user`*

**Demographics:** 42 years old · Riau, Sumatra · Owns 3 plots totalling 12 hectares · Primary income from sawit · Secondary phone: Android mid-range · Intermittent mobile data

**Goals:**
- Know how much he earned last month from each plot
- Track his fertilizer spending to know if it's worth it
- Get reminders for when to fertilize or spray

**Frustrations:**
- "I forget what I spent on the last round of pupuk (fertilizer) and the toke (middleman) says the price is lower than I expected"
- "I don't know which of my three kebun is making the most money"
- "My notebook got wet in the rain and I lost six months of records"

**Behaviors:**
- Records harvests the same day or next morning
- Prefers Bahasa Indonesia; not comfortable with English labels
- Will adopt a tool if it saves him time, not just creates digital work
- Trusts recommendations from other farmers in his cooperative (KUD)

**Key Jobs-to-be-Done:**
- *When I sell a harvest* → I want to record the weight, price, and cost so I know my net income without doing mental math
- *When I plan next month* → I want to see what maintenance I should do and roughly what it will cost
- *When I talk to the mill* → I want to know my historical average price so I can push back on a low offer

---

### Persona 2: Bu Ratna — The Manager's Spouse / Admin Helper
*Secondary user · Role: `user`*

**Demographics:** 38 years old · Manages the household finances for the family's 6-hectare plantation · Uses a tablet at home

**Goals:**
- Produce a clean financial summary for the family or bank loan officer
- Make sure all maintenance costs are recorded before month-end

**Frustrations:**
- "I have to ask Pak Ratna to explain his notebook every time the bank wants a report"
- "We can't get a KUR (government farm loan) without a proper business record"

**Key Jobs-to-be-Done:**
- *When preparing loan documents* → I want to export a financial summary as PDF or Excel with one tap
- *When reviewing the month* → I want to see total income vs total costs in a single view

---

### Persona 3: Budi — The Cooperative Extension Worker
*Edge-case user · Role: `user`*

**Demographics:** 30 years old · Pendamping (field agent) at a local cooperative · Manages field inspections for 20 member farms

**Goals:**
- Record field inspection results per plot
- Track maintenance completion across farms

**Key Jobs-to-be-Done:**
- *During a field visit* → I want a structured checklist so I don't miss anything
- *After a field visit* → I want a record of what I found and what I did

---

### Persona 4: Admin Operator
*Internal user · Role: `admin` / `super_admin` · Admin panel only*

**Demographics:** Technical/operations staff at SawitHub HQ

**Goals:**
- Monitor platform health and user activity
- Manage user subscriptions and access issues
- Respond to support requests (password resets, role changes)
- Audit all system changes for compliance

**Key Jobs-to-be-Done:**
- *When a user reports a payment issue* → I want to see their subscription and payment history instantly
- *When the platform behaves unexpectedly* → I want to toggle the API kill-switch without a deployment
- *When reviewing team actions* → I want an immutable audit log of everything any admin did

---

## 5. User Stories

### Epic 1: Farm (Plot) Management
- As Pak Hendra, I want to register each of my plots with its area and planting year so that all my records are organized by plot.
- As Pak Hendra, I want to switch between plots on the dashboard so that I can compare their performance.
- As Pak Hendra, I want to delete a plot I've sold without losing its historical records.

### Epic 2: Harvest Recording
- As Pak Hendra, I want to record a harvest with weight (kg), bunch count, price per kg, and harvest cost so that SawitHub calculates my net income for me.
- As Pak Hendra, I want to see a warning if I try to record a second harvest for the same plot on the same day (it's a business rule: one harvest entry per plot per day).
- As Bu Ratna, I want to see harvest income trend charts by week, month, or year so that I can explain our income seasonality to the bank.

### Epic 3: Maintenance & Cost Tracking
- As Pak Hendra, I want to record a fertilizer application with material name, quantity, unit, price per unit, and labor cost so that SawitHub calculates the total maintenance cost.
- As Pak Hendra, I want to record multiple materials for the same maintenance session (e.g., two fertilizer types applied on the same day).
- As Bu Ratna, I want to see a cost breakdown by maintenance type so that I know where our biggest expenses are.

### Epic 4: Income Aggregation
- As Bu Ratna, I want a separate income ledger that summarizes harvest proceeds and total costs per harvest date so that I have a clean financial record.

### Epic 5: Maintenance Scheduling
- As Pak Hendra, I want to set up a repeating schedule (weekly, monthly, custom) for each maintenance type so that I get reminders before each due date.
- As Pak Hendra, I want to see upcoming maintenance tasks for the next 30 days so that I can plan my labor and material purchases.
- As Pak Hendra, I want to pause a schedule without deleting it when I'm not harvesting (e.g., during the dry season).

### Epic 6: Field Inspection Checklists
- As Budi, I want to create a named field inspection run with a checklist of items so that I don't forget steps during a visit.
- As Budi, I want to mark each checklist item as done, skipped, or pending, and leave a note per item.
- As Budi, I want the run to be marked "complete" only after all required items are checked.

### Epic 7: TBS Commodity Price Tracking
- As Pak Hendra, I want to record the TBS price I received at each harvest so that I have a price history to refer to.
- As Pak Hendra, I want the price I recorded last to be pre-filled when I create a new harvest record.

### Epic 8: Financial Dashboard & Reports
- As Pak Hendra, I want a dashboard that shows total yield (tons), gross income, total costs, and net income for the selected period.
- As Pak Hendra, I want to filter the dashboard by individual plot or all plots combined.
- As Bu Ratna, I want to generate a financial report for any date range and export it as PDF or Excel.
- As Bu Ratna, I want to receive the financial report by email so that I can forward it directly to the bank officer.

### Epic 9: Fertilizer / Cost Calculator
- As Pak Hendra, I want a calculator where I enter my plot area and it tells me how much fertilizer I need and what it will cost.

### Epic 10: Subscription & Payments
- As Pak Hendra, I want a 14-day free trial to evaluate SawitHub before committing to payment.
- As Pak Hendra, I want to pay with local Indonesian payment methods (bank transfer, GoPay, etc.) via Midtrans.
- As Pak Hendra, I want to receive an email reminder 3 days before my trial ends so that I'm not surprised by a loss of access.
- As Pak Hendra, I want to see my payment history so that I can confirm which months I've paid.

### Epic 11: Notifications
- As Pak Hendra, I want in-app notifications for subscription expiry, upcoming maintenance, and payment confirmations.
- As Pak Hendra, I want to mark all notifications as read in one tap.

### Epic 12: Profile & Account
- As Pak Hendra, I want to update my display name, email, and phone number.
- As Pak Hendra, I want to change my password from the profile page.
- As Pak Hendra, I want to log out of all my devices at once if I think my account is compromised.

### Epic 13: Admin Operations
- As an Admin, I want to search for any user by email or username and see their subscription status.
- As an Admin, I want to reset a user's password without knowing their current password.
- As a Super Admin, I want to deactivate a user account without deleting their data.
- As an Admin, I want to enable or disable the global API kill-switch in an emergency without a code deployment.
- As a Super Admin, I want to see an audit log of all admin actions with timestamps and IP addresses.

---

## 6. Core Features & Acceptance Criteria

---

### F-01: Farm (Plot) Registration and Management

**Description:** Users register and manage their plantation plots. Each plot is the primary organizational unit for all downstream data (harvests, maintenance, income).

**Subscription gate:** Creating new plots and editing/deleting existing plots require an active subscription (or trial quota not exhausted). Reading plot data is always accessible.

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | User can create a plot with: display name (required), seed variety, location description, area in hectares (> 0), tree count (> 0), and planting year (1900–current year). |
| AC-02 | User can edit all plot fields after creation. |
| AC-03 | User can soft-delete a plot. Deleted plots no longer appear in active lists but their associated harvest/maintenance records are preserved and still readable. |
| AC-04 | Plot list displays all non-deleted plots belonging to the logged-in user, sorted by creation date descending. |
| AC-05 | Users on a `trialing` subscription may create up to `trial_farm_create_used` limit plots. Exceeding the limit shows a subscription upgrade prompt. |
| AC-06 | Users may designate one plot as their "active farm" at any time. The active farm determines the default context for dashboard and data entry screens. |
| AC-07 | Attempting to create a plot when `subscription_status` is `expired` (and `billing_exempt = 0`) returns an error with a link to the subscription page. |

---

### F-02: Harvest Recording (Panen)

**Description:** The core data entry feature. Users log each harvest event with operational and financial inputs. The system computes financial metrics automatically via stored generated columns — no mental math required from the user.

**Computed fields (calculated by the database, never entered by user):**

| Field | Formula |
|-------|---------|
| Weight in tons | `berat_kg ÷ 1000` |
| Average bunch weight | `berat_kg ÷ jumlah_janjang` |
| Gross income | `berat_kg × harga_per_kg` |
| Net income | `gross_income − COALESCE(biaya_panen, 0)` |

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | User can record a harvest with: plot (required), harvest date (required), area harvested (ha), bunch count, weight in kg, price per kg, harvest cost, and notes. |
| AC-02 | System displays computed fields (tons, average bunch weight, gross income, net income) in real time as the user fills the form, before saving. |
| AC-03 | Submitting a harvest for a plot + date combination that already exists returns a validation error: "Panen untuk kebun ini pada tanggal tersebut sudah dicatat." |
| AC-04 | The price per kg field is pre-filled with the most recent price the user recorded in their TBS price history. |
| AC-05 | User can view, edit, and delete any of their harvest records. Deleted records are soft-deleted. |
| AC-06 | Harvest list is paginated, filterable by plot and date range. |
| AC-07 | Trial users may create up to `trial_panen_used` harvest records. Exceeding the quota shows an upgrade prompt without losing the draft. |

---

### F-03: Maintenance Recording (Perawatan)

**Description:** Users log maintenance activities — fertilizer applications, pesticide spraying, pruning, weeding — with material and labor costs. Multiple materials can be recorded for the same day and plot (they are separate rows).

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | User can record a maintenance activity with: plot (required), date (required), maintenance type (required), material name (required), quantity, unit (kg / liter / gram / unit / zak / botol), unit price, total material cost, labor cost, total cost, and notes. |
| AC-02 | System prevents duplicate entries for the same plot + date + maintenance type + material combination. |
| AC-03 | User can record two different materials for the same plot on the same day (e.g., Urea and KCl applied together). They appear as separate rows, both linked to the same date. |
| AC-04 | Maintenance list is filterable by plot, date range, and maintenance type. |
| AC-05 | User can edit and soft-delete any maintenance record. |
| AC-06 | Trial users are subject to `trial_perawatan_used` quota. |

---

### F-04: Income Ledger (Pendapatan)

**Description:** A financial ledger distinct from harvest records. Pendapatan aggregates one harvest event's income and costs into a single accountable entry. This is the record the bank officer sees — cleaner and more formal than the operational harvest log.

**Computed field:** `pendapatan_bersih = pendapatan_kotor − biaya_total` (stored generated column).

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | User can create an income record with: plot, harvest date, total bunch count, total weight (kg), gross income (IDR), total costs (IDR), and notes. |
| AC-02 | Net income is displayed automatically as `gross income − total costs`. It cannot be entered manually. |
| AC-03 | Only one non-deleted income record is allowed per user + plot + harvest date combination. Attempting to create a duplicate shows a validation error. |
| AC-04 | Income list is filterable and sortable by date descending. |
| AC-05 | Income records can be edited and soft-deleted. |

---

### F-05: Maintenance Schedules (Jadwal Perawatan)

**Description:** Users define recurring maintenance schedules per plot. The system uses these definitions to surface upcoming tasks on the dashboard and send reminder notifications.

**Recurrence options:** Weekly (`mingguan`), bi-weekly (`dua_mingguan`), monthly (`bulanan`), bi-monthly (`dua_bulanan`), quarterly (`tiga_bulanan`), 4-monthly (`empat_bulanan`), semi-annual (`enam_bulanan`), annual (`tahunan`), twice-yearly (`dua_kali_tahunan`), three-times-yearly (`tiga_kali_tahunan`), custom (user-specified interval in days).

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | User can create a schedule with: plot, maintenance type, description, recurrence frequency, start date, optional end date, estimated cost per occurrence, active status, and notes. |
| AC-02 | When `frequensi_tipe = 'custom'`, the "interval in days" field is required and must be ≥ 1. For all other recurrence types, the interval field is hidden. |
| AC-03 | `GET /api/CoreMaintenanceScheduleService/upcoming` returns a list of maintenance tasks due within the next 30 days, sorted by due date ascending. |
| AC-04 | User can toggle a schedule between active and paused (`is_active`). Paused schedules do not appear in the upcoming list. |
| AC-05 | User can edit the recurrence type and dates of a schedule. |
| AC-06 | User can soft-delete a schedule. Deleted schedules are excluded from all upcoming task queries. |
| AC-07 | Trial users are subject to `trial_jadwal_used` quota. |

---

### F-06: Field Inspection Checklists

**Description:** A structured field visit feature. An inspection "run" is created for a specific plot on a specific date, and contains a set of ordered checklist items. Designed for systematic field assessments.

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | User can create a checklist run with: plot, date, title, and a list of ordered items. Each item has: label, sort order, required flag, and initial status of `pending`. |
| AC-02 | User can update the status of any item to `done` or `skipped`, and add a note to each item. |
| AC-03 | A run can only be marked `completed` if all items where `is_required = true` have status `done`. Attempting to complete with pending required items returns a validation error. |
| AC-04 | When a run is marked `completed`, `completed_at` is stamped with the current timestamp. |
| AC-05 | Completed runs are read-only. Items on a completed run cannot be modified. |
| AC-06 | Checklist runs are filterable by date and status. |

---

### F-07: TBS Commodity Price Tracking (Harga TBS)

**Description:** Users record the mill buying price for Fresh Fruit Bunches (Tandan Buah Segar) over time. This builds a personal price history used for harvest pre-fill and trend analysis.

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | User can record a TBS price entry with: date (required), price per kg in IDR (required), source/mill name (optional), and notes (optional). |
| AC-02 | The most recent TBS price entry is used as the default value for `harga_per_kg` when creating a new harvest record. |
| AC-03 | Price history is displayed in a list and/or trend chart, filterable by date range. |
| AC-04 | User can edit and delete TBS price entries. |

---

### F-08: Financial Dashboard

**Description:** The primary "home" screen for logged-in users. Provides an at-a-glance financial and operational summary for the selected period and plot.

**Period options:** Weekly, Monthly, Yearly.

**Displayed metrics:**
- Total weight (tons)
- Total gross income (IDR)
- Total costs (IDR)
- Net income (IDR)
- Average price per kg
- Average tons per period
- Cost breakdown by maintenance type (chart)
- Income vs cost trend chart (bar/line)
- Recent harvest records (last 5)
- Recent maintenance records (last 5)
- Upcoming maintenance tasks

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | Dashboard data loads within 2 seconds on a 4G connection and within 4 seconds on 3G. |
| AC-02 | User can select period (week / month / year) and plot (all plots / specific plot). The dashboard reloads with filtered data. |
| AC-03 | Dashboard data is cached at the API layer for 30 seconds to absorb rapid filter switching without hitting the database. |
| AC-04 | If the user has no harvest records for the selected period, an empty state is shown with a CTA to add a harvest. |
| AC-05 | The upcoming maintenance section shows the next 3 maintenance tasks ordered by due date. |
| AC-06 | All monetary values are formatted in Indonesian Rupiah format (e.g., "Rp 1.250.000"). |

---

### F-09: Financial Reports & Export

**Description:** Users can generate a financial summary report for any custom date range and export it as PDF or Excel (XLSX). An email export option sends the report to the user's registered email.

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | User can select a date range (start date, end date) and optional plot filter to generate a report. |
| AC-02 | Report includes: total harvests, total weight, gross income, total maintenance costs, net income, cost breakdown by maintenance type, harvest list, and maintenance cost list. |
| AC-03 | User can download the report as PDF (formatted for A4 printing). |
| AC-04 | User can download the report as Excel (.xlsx) with data in tabular format, suitable for further analysis. |
| AC-05 | User can trigger email export. The system sends the report as an email attachment to the user's registered email within 5 minutes. |
| AC-06 | Email export is an async operation (queued). The UI shows a confirmation message ("Report dikirim ke email Anda") immediately; the user does not wait for delivery. |
| AC-07 | Email export requires an active subscription. Trial users see an upgrade prompt when attempting this feature. |
| AC-08 | The export data matches what is displayed on the financial report screen (no discrepancies). |

---

### F-10: Fertilizer Calculator (Kalkulator Pupuk)

**Description:** A standalone calculator tool that helps users determine fertilizer application quantities and estimated costs based on plot area.

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | User can input plot area (hectares) and number of trees. |
| AC-02 | Calculator outputs recommended application quantities for common fertilizer types (Urea, TSP, KCl, Dolomite, etc.) based on standard smallholder agronomy guidelines. |
| AC-03 | User can input unit prices for each fertilizer type to get an estimated total material cost. |
| AC-04 | Calculator results are displayed on-screen; no data is saved to the user's account. |
| AC-05 | The calculator is accessible without an active subscription (available to trial and expired users). |

---

### F-11: Subscription & Payment

**Description:** SawitHub monetizes via a monthly subscription. The billing system handles trial periods, payment checkout via Midtrans (Indonesian payment gateway), payment callbacks, and subscription status synchronization.

**Subscription lifecycle states:** `trialing` → `active` → `expired` / `cancelled`

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | All new users receive a 14-day free trial on registration. `trial_ends_at` is set to `registration_time + 14 days`. |
| AC-02 | During trial, users can access all features subject to trial quotas (farm creation, harvest entry, maintenance entry, schedule creation, report export). Quota limits are configurable via environment variables. |
| AC-03 | When `trial_ends_at` is reached and no active subscription exists, `subscription_status` transitions to `expired`. Write operations on core features (create/edit/delete) are blocked; read access is preserved. |
| AC-04 | Checkout flow: user taps "Subscribe" → system creates a subscription record with `status = pending_payment` and a unique `order_id` → system calls Midtrans Snap API → user is redirected to Midtrans payment page → on success, a webhook arrives at `/api/BillingPaymentService/callback`. |
| AC-05 | The payment callback handler is idempotent: inserting the same `(provider, event_key)` into `payment_events` twice returns 200 without reprocessing. |
| AC-06 | On successful payment webhook: subscription status transitions to `active`, `starts_at` and `ends_at` are set, user's `subscription_status` is updated, and a success notification is sent in-app. |
| AC-07 | User can view their payment history (date, amount, status, payment method) from the subscription page. |
| AC-08 | Subscription renewal reminder emails are sent 7 days and 3 days before `ends_at`. |
| AC-09 | Trial expiry reminder emails are sent 3 days before `trial_ends_at`. |
| AC-10 | `billing_exempt = 1` users bypass all subscription enforcement. This flag can only be set by an Admin via the admin panel. |
| AC-11 | A mock payment callback endpoint (`/api/BillingPaymentService/mock/callback`) is available in staging environments only (controlled by `VITE_ALLOW_MOCK_BILLING`). It must not be exposed in production. |

---

### F-12: In-App Notification Center

**Description:** A notification inbox accessible from the main navigation. Notifications are generated by backend processes (payment confirmation, subscription reminders, upcoming maintenance alerts).

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | Unread notification count is displayed as a badge on the notification bell icon. |
| AC-02 | User can view all notifications in a list, newest first, with type, title, message, timestamp, and read status. |
| AC-03 | Tapping a notification with an `action_url` navigates the user to the relevant screen and marks the notification as read. |
| AC-04 | User can mark a single notification as read. |
| AC-05 | User can mark all notifications as read in one action. |
| AC-06 | User can delete all read notifications. |
| AC-07 | Soft-deleted notifications do not appear in the list. |
| AC-08 | Notifications older than 90 days are automatically purged from the database by a background cleanup process. |

---

### F-13: Authentication & Account Management

**Description:** Standard authentication flows with security-conscious design: no plaintext PII stored, JWT-based sessions with revocation, rate-limited auth endpoints.

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | User can register with: full name (≥ 2 chars), email (valid format), username (≥ 3 chars, alphanumeric + underscore), password (≥ 8 chars). |
| AC-02 | Email and phone number are stored encrypted (AES) + hashed (deterministic). Plaintext values are never persisted. |
| AC-03 | User can log in with username or email + password. On success, a JWT is returned and stored in the client's persistent store. |
| AC-04 | Forgot password flow: user submits email → system sends a 6-digit OTP to the email → OTP expires in 15 minutes → on verify-reset, user submits OTP → on reset-password, user submits new password. Each OTP is single-use. |
| AC-05 | User can update their full name, email, phone number, and username from the profile page. Each is a separate API call. |
| AC-06 | User can change their password from the profile page by submitting their current password + new password. |
| AC-07 | User can log out of the current session. |
| AC-08 | User can log out of all active sessions simultaneously ("logout all devices"). |
| AC-09 | JWTs are validated against a Redis revocation list on every authenticated request. A revoked or expired token returns HTTP 401. |
| AC-10 | The auth middleware updates `last_seen_at` on the user row at most once per minute (presence tracking). |
| AC-11 | User's `onboarding_done` preference flag is set after the user completes the initial onboarding flow. Users with this flag set skip the onboarding on subsequent logins. |

---

### F-14: Admin Panel

**Description:** A separate web application (`/admin`) for SawitHub internal operations staff. Authentication uses a completely separate identity store (`sawit_hub_admin_db`) and JWT secret.

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | Admin users log in at the admin panel URL with their admin credentials. Admin credentials are entirely separate from user credentials. |
| AC-02 | Admin dashboard (Overview) displays: total registered users, active subscriptions, revenue metrics, recent signups, and system health indicators. |
| AC-03 | Admin can search users by email, username, or user ID. User detail shows: subscription status, payment history, last active, and role. |
| AC-04 | Admin can change a user's role (`user` ↔ `admin`). The action is recorded in the audit log. |
| AC-05 | Admin can reset a user's password. The action is recorded in the audit log with the acting admin's ID and IP. |
| AC-06 | Super Admin can deactivate a user account. Deactivated users receive HTTP 401 on their next request. The action is recorded in the audit log. |
| AC-07 | Super Admin can set `billing_exempt = true` for a user to bypass subscription enforcement. |
| AC-08 | Admin can toggle the global API kill-switch via `PUT /api/admin/system/api-state`. When active, all user-facing API endpoints return a maintenance error. Admin panel endpoints are unaffected. |
| AC-09 | Admin panel displays an audit log with: timestamp, acting admin, action, target type/ID, IP address, and metadata. Audit log is immutable — no edit or delete capability. |
| AC-10 | Admin can view analytics: page visit trends, device type breakdown, active user cohorts, revenue trends. |
| AC-11 | Admin panel is protected by the same JWT + Redis revocation mechanism as the user app, using a separate `ADMIN_JWT_SECRET`. |

---

### F-15: Progressive Web App (PWA) & Android

**Description:** SawitHub must work reliably on mid-range Android phones in rural Indonesia where connectivity is inconsistent. The frontend is a PWA installable from the browser; a Capacitor-wrapped Android app provides native distribution.

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | The user frontend is installable as a PWA (Add to Home Screen) on Android Chrome. |
| AC-02 | The PWA manifest declares `display: standalone`, `orientation: portrait-primary`, and the correct brand colors. |
| AC-03 | Keyboard shortcuts are configured: tapping "Dashboard" shortcut opens `/dashboard`; tapping "Manajemen Lahan" opens `/lahan`. |
| AC-04 | The admin frontend includes a service worker (Workbox) with a NetworkFirst cache strategy for API routes and precaching for all static assets. |
| AC-05 | The admin frontend is installable as a standalone PWA and distributable as an Android APK via Capacitor. |
| AC-06 | The Vite build targets `es2020` for compatibility with Android WebView on mid-range phones (Android 8+). |
| AC-07 | The app functions in read-only mode when offline (cached dashboard data is displayed). Write operations show a "no connection" message, not a crash. |

---

### F-16: UI Theme Configuration

**Description:** The visual appearance of the platform (brand colors) is configurable via the admin panel without a code deployment. The theme is served to all clients on app startup.

**Acceptance Criteria:**

| # | Criterion |
|---|-----------|
| AC-01 | `GET /api/PlatformThemeService` is a public (unauthenticated) endpoint that returns the current theme configuration. |
| AC-02 | The frontend reads the theme on app startup and applies the color values to the UI. |
| AC-03 | Admin can update primary, secondary, accent, background, text, and border colors via the admin settings panel. |
| AC-04 | Theme changes take effect for new page loads immediately after the admin saves them. Existing sessions see the update within the cache TTL (120 seconds for admin aggregate cache). |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Requirement | Target | Source |
|-------------|--------|--------|
| Dashboard API response time | p95 < 500ms | Redis cache (30s TTL) for dashboard data |
| Financial report API response time | p95 < 1s | Redis cache (60s TTL) for report data |
| Static asset delivery | < 1s first load (CDN) | Vercel CDN deployment |
| Vite build target | ES2020 (Android WebView 8+ compat) | `vite.config.ts` `target: 'es2020'` |
| Chunk size warning threshold | 2,000 KB | Manual chunking: vendor-router, vendor-react, vendor-axios |
| API timeout | 30 seconds hard limit | Chi timeout middleware |

### 7.2 Availability & Reliability

| Requirement | Target |
|-------------|--------|
| Service availability (user backend) | ≥ 99.5% monthly |
| Data durability | Zero data loss (MySQL InnoDB + Railway managed backups) |
| Redis persistence | RDB snapshots + AOF enabled |
| Redis eviction policy | `allkeys-lru` (cache data is evictable; session/auth data is TTL-protected) |
| Panic recovery | All HTTP panics are caught by the Recoverer middleware; no server crashes from bad requests |

### 7.3 Security

| Requirement | Mechanism |
|-------------|-----------|
| No plaintext PII at rest | All email and phone values stored as AES-encrypted ciphertext + deterministic hash |
| Password storage | bcrypt hashing (`golang.org/x/crypto`) |
| JWT signing | HMAC-SHA256 |
| JWT revocation | Redis-backed revocation list (30-day TTL) |
| Separate admin identity | Completely separate DB, separate JWT secret (`ADMIN_JWT_SECRET`), separate session store key |
| Rate limiting | 100 requests/minute per authenticated user (Redis-backed sliding window) |
| Login attempt throttling | 15-minute window on login attempts (`auth.login_attempt_window` TTL) |
| Security headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` |
| CORS policy | Strict origin allowlist (FRONTEND_URL env + `capacitor://localhost`); no wildcard origins |
| Secrets management | Infisical integration for Railway environment variable sync; no secrets in git |
| API kill-switch | Redis-backed emergency gate controllable from admin panel without deployment |
| Admin audit trail | Immutable append-only audit log covering all admin actions with IP, user-agent, and metadata payload |
| Redis forbidden keys | No key containing `*email*`, `*phone*`, or `*password*` may be written to Redis |

### 7.4 Scalability

| Requirement | Implementation |
|-------------|---------------|
| Database connection pooling | Max 25 open connections, 10 idle, 10m lifetime, 2m idle timeout |
| Redis connection pooling | Pool size 20 (configurable) |
| Cache-aside pattern for reads | Dashboard and report queries served from Redis when fresh |
| Cache invalidation on writes | All POST/PUT/DELETE requests automatically invalidate user's cache keys via middleware |
| Async email delivery | Emails queued via Asynq (priority queue); delivery does not block the HTTP response |
| Background jobs | `BillingReminderWorker` runs on configurable interval (default 6h), not on every request |

### 7.5 Observability

| Requirement | Implementation |
|-------------|---------------|
| Distributed tracing | OpenTelemetry (OTLP/gRPC exporter for production, stdout for development) |
| Request logging | Structured HTTP access logs on all requests |
| Panic logging | Chi Recoverer middleware logs stack traces |
| API health endpoint | `GET /api/health` returns DB pool stats and Redis ping latency |
| Service naming | `OTEL_SERVICE_NAME`: `sawithub-backend` / `sawithub-admin-backend` |

### 7.6 Internationalisation

| Requirement | Detail |
|-------------|--------|
| Primary language | Bahasa Indonesia |
| Bilingual routes | Public pages available at both English and Indonesian paths (e.g., `/privacy` and `/privasi`, `/help` and `/bantuan`) |
| Currency | Indonesian Rupiah (IDR). No multi-currency support. |
| Date format | Standard Indonesian date formatting (DD/MM/YYYY) |
| Payment gateway | Midtrans (Indonesia-local) — supports bank transfer, GoPay, OVO, QRIS |

### 7.7 Compliance & Data

| Requirement | Detail |
|-------------|--------|
| Cookie consent | `/pengaturan-cookie` route provides cookie settings management |
| Privacy policy | Available at `/privacy` and `/privasi` |
| Terms of service | Available at `/terms` and `/syarat` |
| PII encryption | Mandatory for email, phone, and full name (non-negotiable) |
| Visit analytics | Anonymous (no user_id link); IP stored for geo only |

### 7.8 Testing Requirements

| Type | Tooling | Minimum Coverage |
|------|---------|-----------------|
| Unit tests | Vitest + React Testing Library | Core business logic utilities |
| Integration tests | Vitest + jsdom | Form validation, state management |
| End-to-end tests | Playwright | Subscription flow, XLSX export headers, logout session clearing |
| Visual regression | Playwright snapshots | Landing page and dashboard |
| Accessibility | Playwright + axe-core | No critical or serious violations |
| Backend tests | Go testing package | All service layer functions |

---

## 8. Out of Scope

The following are explicitly not in scope for v1.0. Items marked *(future)* are candidates for subsequent releases.

| Item | Reason / Notes |
|------|----------------|
| **iOS native app** | Only Android via Capacitor is in scope. iOS requires Apple Developer Account and separate PWA service worker restrictions. *(future)* |
| **Multi-user / team access per farm** | The data model assigns each record to a single `user_id`. No sharing, collaborator invites, or role-based data access within a farm account. *(future)* |
| **Real-time market price feed** | TBS prices are entered manually by the user. No integration with mill or commodity price APIs. *(future)* |
| **GPS / coordinate tracking** | `lokasi` is a free-text description, not coordinates. No map view or GPS boundary marking. *(future)* |
| **Weather data integration** | No integration with BMKG or any weather service. *(future)* |
| **Supply chain / buyer marketplace** | No feature for connecting farmers with mills or aggregators. *(future)* |
| **Cooperative / group management** | No multi-tenant workspace for a KUD (cooperative) to manage multiple member farms under one account. *(future)* |
| **Automated yield prediction / ML** | No AI/ML features in v1. Analytics are descriptive (what happened), not predictive. *(future)* |
| **Offline write support** | The PWA caches reads; write operations require connectivity. Full offline sync is not in scope. *(future)* |
| **Multi-language support (beyond ID/EN routes)** | Only Bahasa Indonesia is the user-facing language. No i18n framework. |
| **Invoicing or billing documents for CPO sales** | The platform tracks income but does not generate formal tax invoices (faktur pajak). |
| **Employee / labor management** | No payroll, worker registration, or labor hour tracking. |
| **Multi-currency** | IDR only. No USD or other currency support. |
| **Email provider failover** | One email provider (Resend) is configured. Automatic failover to SMTP on Resend failure is a configuration option but not a guaranteed feature. |
| **White-labeling / reseller program** | The theme configuration supports color customization but no per-tenant domain or full rebranding. |

---

## 9. Appendix — Glossary

| Term | Definition |
|------|-----------|
| **Lahan** | A single plantation plot (farm parcel). The primary organizational unit in SawitHub. |
| **Panen** | Harvest event. One panen entry = one harvest session on one lahan on one date. |
| **TBS (Tandan Buah Segar)** | Fresh Fruit Bunches — the raw harvested output of palm oil trees. Sold to mills by weight (kg). |
| **Janjang** | A single palm oil bunch (FFB). `jumlah_janjang` = bunch count per harvest. |
| **Berat Ton** | Weight in metric tons. Computed as `berat_kg / 1000`. |
| **Perawatan** | Maintenance activity. Includes fertilizing (pemupukan), spraying (penyemprotan), pruning (pemangkasan), weeding (pembersihan), etc. |
| **Jadwal Perawatan** | A recurring maintenance schedule definition (not an individual record). |
| **Pendapatan** | Income. `t_sawit_hub_pendapatan` is the formal income ledger as opposed to the operational harvest log. |
| **Pendapatan Kotor** | Gross income (before costs). |
| **Pendapatan Bersih** | Net income = gross income − total costs. |
| **Harga TBS** | TBS commodity price (per kg, IDR) at the user's mill. |
| **Pupuk** | Fertilizer. |
| **Kebun** | Plantation / garden. `nama_kebun` = plot display name. |
| **Mandor** | Plantation supervisor / field manager. |
| **KUD** | Koperasi Unit Desa — village cooperative; often involved in palm oil aggregation. |
| **KUR** | Kredit Usaha Rakyat — government-subsidized business loan for small enterprises. |
| **Midtrans** | Indonesian payment gateway. Supports bank transfer, GoPay, OVO, QRIS, credit card, etc. |
| **Snap** | Midtrans's hosted payment page product. SawitHub uses the Snap API for checkout. |
| **IDR** | Indonesian Rupiah (currency). |
| **PWA** | Progressive Web App — a web application installable on a device home screen with offline capabilities. |
| **Capacitor** | A tool (by Ionic) that wraps a web app in a native Android/iOS shell for distribution via app stores. |
| **AES** | Advanced Encryption Standard — used for encrypting PII columns (`email_enc`, `phone_enc`, `full_name_enc`). |
| **JTI** | JWT ID — a unique claim in each JWT token used for per-token revocation via Redis. |
| **Asynq** | A Go library for async background job processing using Redis as the queue backend. |
| **OTEL** | OpenTelemetry — vendor-neutral observability framework for distributed tracing. |
| **Trialing** | Initial subscription state for all new users (14-day free trial). |
| **Billing Exempt** | A flag (`billing_exempt = 1`) that bypasses all subscription enforcement for demo or partner accounts. |
