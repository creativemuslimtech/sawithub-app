# SawitHub — Product Backlog

**Product:** SawitHub Palm Oil Farm Management SaaS  
**Version:** 1.0  
**Date:** 2026-05-21  
**Scrum Master:** —  
**Product Owner:** —

---

## Backlog Key

| Symbol | Meaning |
|---|---|
| ✅ | Implemented in current codebase |
| 🔧 | Partially implemented / needs polish |
| 🆕 | New — not yet implemented |

**Story Points:** Fibonacci (1, 2, 3, 5, 8, 13, 21)  
**Priority:** Must Have · Should Have · Could Have · Won't Have (MoSCoW)

---

## Epic 1 — Identity & Access Management

*Users must be able to register, authenticate, and manage their account securely.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| IAM-1 | As a **new farmer**, I want to register with my full name, email, username, and password so that I can create my SawitHub account. | 3 | Must Have | ✅ |
| IAM-2 | As a **registered farmer**, I want to log in using my email or username so that I can access my farm data. | 3 | Must Have | ✅ |
| IAM-3 | As a **farmer who forgot their password**, I want to receive a 6-digit OTP to my email so that I can reset my password securely. | 5 | Must Have | ✅ |
| IAM-4 | As a **logged-in farmer**, I want to log out of my current session so that my account stays secure on shared devices. | 1 | Must Have | ✅ |
| IAM-5 | As a **security-conscious farmer**, I want to log out of all active sessions at once so that I can revoke access if my device is lost. | 2 | Should Have | ✅ |
| IAM-6 | As a **farmer**, I want to update my full name, email, phone number, username, and password separately so that I can keep my profile accurate. | 5 | Should Have | ✅ |
| IAM-7 | As a **first-time farmer**, I want to be guided through an onboarding wizard on my first login so that I understand how to start using SawitHub. | 5 | Must Have | ✅ |
| IAM-8 | As a **farmer**, I want SawitHub to track my "onboarding completed" preference so that the wizard never reappears after I finish it. | 2 | Must Have | ✅ |
| IAM-9 | As a **farmer using a shared family device**, I want my session to automatically expire after 30 days of inactivity so that my data stays private. | 2 | Should Have | ✅ |
| IAM-10 | As a **farmer**, I want my email and phone number to be stored encrypted so that my personal data is protected even if the database is compromised. | 5 | Must Have | ✅ |

**Epic total: 33 SP**

---

## Epic 2 — Farm / Plot Management (Lahan)

*Farmers manage one or more oil palm plots as the primary unit of all operational data.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| LAH-1 | As a **farmer**, I want to register a new farm plot with its name, seedling type, location, area (ha), tree count, and planting year so that all my records are tied to the right plot. | 5 | Must Have | ✅ |
| LAH-2 | As a **farmer with multiple plots**, I want to view a list of all my registered plots so that I can navigate between them easily. | 3 | Must Have | ✅ |
| LAH-3 | As a **farmer**, I want to edit a plot's details so that I can correct mistakes or update information after replanting. | 3 | Should Have | ✅ |
| LAH-4 | As a **farmer who sold a plot**, I want to delete a plot (soft delete) so that it no longer appears in my active records. | 2 | Should Have | ✅ |
| LAH-5 | As a **farmer on a Pro subscription**, I want to register unlimited plots so that I can manage my full landholding without restriction. | 3 | Must Have | ✅ |
| LAH-6 | As a **trial farmer**, I want to register up to 2 plots during my free trial so that I can evaluate the product before subscribing. | 3 | Must Have | ✅ |
| LAH-7 | As a **farmer with many plots**, I want to set an "active farm" so that the dashboard defaults to showing my primary plot without manual filtering each time. | 3 | Should Have | ✅ |
| LAH-8 | As a **farmer**, I want to see the planting age of each plot calculated automatically from the planting year so that I don't have to compute it manually. | 2 | Could Have | 🆕 |

**Epic total: 24 SP**

---

## Epic 3 — Harvest Recording (Panen)

*The harvest is the primary revenue event. Recording it accurately drives all financial outputs.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| PAN-1 | As a **farmer**, I want to record a harvest with the plot, date, harvested area, bunch count (janjang), weight (kg), price per kg, harvest cost, and notes so that I have a complete record of each harvest. | 5 | Must Have | ✅ |
| PAN-2 | As a **farmer**, I want the system to automatically calculate total revenue, net income, and average bunch weight from my harvest inputs so that I don't need a calculator. | 5 | Must Have | ✅ |
| PAN-3 | As a **farmer**, I want to view my harvest history filtered by plot and date range so that I can review past performance. | 3 | Must Have | ✅ |
| PAN-4 | As a **farmer who made a mistake**, I want to edit a harvest record so that I can correct errors in weight or price. | 3 | Should Have | ✅ |
| PAN-5 | As a **farmer**, I want to delete an incorrect harvest record so that it doesn't skew my financial reports. | 2 | Should Have | ✅ |
| PAN-6 | As a **farmer**, I want the system to prevent duplicate harvest entries for the same plot on the same date so that I don't accidentally double-record a harvest. | 3 | Must Have | ✅ |
| PAN-7 | As a **farmer using a weighbridge receipt**, I want to quickly enter weight from a receipt photo so that I don't have to manually type every number. (OCR capture) | 13 | Could Have | 🆕 |
| PAN-8 | As a **farmer with many plots**, I want to import multiple harvest records from a CSV or Excel file so that I don't have to enter them one by one. | 8 | Could Have | 🆕 |

**Epic total: 42 SP**

---

## Epic 4 — Maintenance Management (Perawatan)

*Maintenance costs (fertilizer, chemicals, labor) are the primary expense category.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| RAW-1 | As a **farmer**, I want to record a maintenance activity with the plot, date, type, material, quantity, unit, material cost, and labor cost so that my expenses are tracked separately from revenue. | 5 | Must Have | ✅ |
| RAW-2 | As a **farmer**, I want the system to automatically calculate total maintenance cost (material + labor) so that I see the full cost of each activity. | 3 | Must Have | ✅ |
| RAW-3 | As a **farmer**, I want to view my maintenance history filtered by plot and date so that I can review expense trends. | 3 | Must Have | ✅ |
| RAW-4 | As a **farmer who made a mistake**, I want to edit or delete a maintenance record so that my cost data stays accurate. | 3 | Should Have | ✅ |
| RAW-5 | As a **farmer**, I want to choose from predefined maintenance types (pupuk, semprot, pruning, etc.) so that my records are consistently categorized. | 2 | Should Have | ✅ |
| RAW-6 | As a **farmer**, I want to choose material units from a standardized list (kg, liter, gram, zak, botol, unit) so that my records are comparable across activities. | 2 | Should Have | ✅ |
| RAW-7 | As a **farmer**, I want to see a cost breakdown chart (material vs. labor) for a period so that I know where my maintenance money goes. | 5 | Could Have | 🆕 |

**Epic total: 23 SP**

---

## Epic 5 — Maintenance Scheduling (Jadwal Perawatan)

*Recurring maintenance schedules ensure farmers never miss a critical activity like fertilizing.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| JAD-1 | As a **farmer**, I want to create a recurring maintenance schedule with frequency (weekly, bi-weekly, monthly, custom days) and start/end dates so that I have an automated work plan. | 5 | Must Have | ✅ |
| JAD-2 | As a **farmer**, I want to view all upcoming maintenance schedules so that I can plan my week in advance. | 3 | Must Have | ✅ |
| JAD-3 | As a **farmer**, I want to receive an in-app notification when a scheduled maintenance is due soon so that I don't miss it. | 5 | Must Have | ✅ |
| JAD-4 | As a **farmer**, I want to edit or deactivate a schedule when my farming plan changes so that I don't receive irrelevant reminders. | 3 | Should Have | ✅ |
| JAD-5 | As a **farmer**, I want to add an estimated cost to a schedule so that I can budget upcoming maintenance activities. | 2 | Should Have | ✅ |
| JAD-6 | As a **farmer using WhatsApp daily**, I want to receive maintenance reminders via WhatsApp so that I see them even if I don't open the app. | 8 | Should Have | 🆕 |
| JAD-7 | As a **farmer**, I want to mark a scheduled maintenance as "done" so that the schedule advances to the next occurrence automatically. | 5 | Should Have | 🆕 |
| JAD-8 | As a **farmer**, I want to see a calendar view of my scheduled maintenance so that I can visualize busy weeks. | 5 | Could Have | 🆕 |

**Epic total: 36 SP**

---

## Epic 6 — Income Tracking (Pendapatan)

*Income aggregation provides a higher-level financial view beyond individual harvests.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| PEN-1 | As a **farmer**, I want to record an income entry that aggregates harvest totals for a plot and date so that I have a consolidated income record. | 5 | Must Have | ✅ |
| PEN-2 | As a **farmer**, I want the system to calculate net income (gross income minus total costs) automatically so that I always see my true profit. | 3 | Must Have | ✅ |
| PEN-3 | As a **farmer**, I want to view my income history in a list filtered by plot and date so that I can track revenue over time. | 3 | Should Have | ✅ |
| PEN-4 | As a **farmer**, I want to edit or delete an income record so that I can correct aggregation errors. | 2 | Should Have | ✅ |

**Epic total: 13 SP**

---

## Epic 7 — Dashboard & Analytics

*The dashboard is the farmer's daily entry point — it must answer "how am I doing?" in one screen.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| DAS-1 | As a **farmer**, I want to see a dashboard with net profit, harvest weight, maintenance cost, and upcoming tasks for the current month so that I understand my farm's performance at a glance. | 8 | Must Have | ✅ |
| DAS-2 | As a **farmer**, I want to filter my dashboard by period (month, week, custom range) and by plot so that I can drill into specific time windows. | 5 | Must Have | ✅ |
| DAS-3 | As a **farmer with multiple plots**, I want to compare net profit per hectare across plots so that I know which plot is performing best. | 5 | Must Have | ✅ |
| DAS-4 | As a **farmer**, I want to see a sparkline/chart of my income trend over the last 10 periods so that I can spot growth or decline visually. | 3 | Should Have | ✅ |
| DAS-5 | As a **farmer**, I want the dashboard to load within 2 seconds even with 5 years of data so that I can check it quickly between field activities. | 5 | Must Have | ✅ |
| DAS-6 | As a **farmer**, I want to edit a harvest or maintenance record directly from the dashboard without navigating away so that corrections are fast. | 5 | Should Have | ✅ |
| DAS-7 | As a **farmer**, I want to see a "top 3 performing months" highlight so that I can identify seasonal patterns. | 3 | Could Have | 🆕 |
| DAS-8 | As a **farmer on a slow mobile network**, I want the dashboard to serve cached data when I'm offline so that I can still review my numbers in the field. | 8 | Should Have | 🆕 |

**Epic total: 42 SP**

---

## Epic 8 — Financial Reporting (Laporan Keuangan)

*Financial reports are the highest-retention feature — farmers use them for bank loan applications and cooperative meetings.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| LAP-1 | As a **farmer**, I want to view a financial report for any period with total revenue, total costs, and net profit so that I have a complete profit-and-loss picture. | 5 | Must Have | ✅ |
| LAP-2 | As a **farmer**, I want to export my financial report as a PDF and receive it via email so that I can share it with my bank or cooperative. | 8 | Must Have | ✅ |
| LAP-3 | As a **farmer**, I want to export my financial report as an Excel file so that I can do further analysis in a spreadsheet. | 5 | Should Have | ✅ |
| LAP-4 | As a **farmer**, I want to filter reports by plot and by period (month, quarter, year) so that I get the exact data I need. | 3 | Must Have | ✅ |
| LAP-5 | As a **farmer**, I want the exported PDF to include my farm's name and logo so that it looks professional when submitted to a bank. | 3 | Should Have | 🆕 |
| LAP-6 | As a **cooperative administrator**, I want to download a consolidated report covering all member farms so that I can prepare the monthly cooperative meeting report. | 13 | Should Have | 🆕 |
| LAP-7 | As a **farmer**, I want to download my report directly from the app as a file (not only via email) so that I can save it instantly. | 5 | Should Have | 🆕 |
| LAP-8 | As a **farmer**, I want to share my report via WhatsApp with one tap so that I can send it to my cooperative officer without using email. | 5 | Could Have | 🆕 |

**Epic total: 47 SP**

---

## Epic 9 — Commodity Price Tracking (Harga TBS)

*TBS (Fresh Fruit Bunch) prices are the primary external variable affecting farm profitability.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| TBS-1 | As a **farmer**, I want to record the TBS price per kg with the date and source (e.g., mill name) so that I have a historical price log. | 3 | Must Have | ✅ |
| TBS-2 | As a **farmer**, I want to see a TBS price trend chart for the last 12 months so that I can spot price patterns before a harvest. | 5 | Must Have | ✅ |
| TBS-3 | As a **farmer**, I want to see age-adjusted TBS price tiers (≥10 years gets full price, younger gets a discount) so that I understand why my actual payout differs from the base price. | 5 | Should Have | ✅ |
| TBS-4 | As a **farmer**, I want to receive a notification when the TBS price changes significantly so that I can decide whether to harvest now or wait. | 5 | Should Have | 🆕 |
| TBS-5 | As a **farmer**, I want SawitHub to pull the official DISBUN/GAPKI price automatically for my province so that I don't have to enter it manually. | 8 | Could Have | 🆕 |

**Epic total: 26 SP**

---

## Epic 10 — Fertilizer Calculator (Kalkulator Pupuk)

*The fertilizer calculator helps farmers optimize input costs — a direct ROI tool.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| KAL-1 | As a **farmer**, I want to enter my plot, tree age, tree count, and NPK percentages of my fertilizer so that I get a dosage recommendation per tree and total for the season. | 8 | Must Have | ✅ |
| KAL-2 | As a **farmer**, I want to choose from preset fertilizer types (NPK 12-12-17, Urea, TSP, etc.) so that I don't have to look up NPK ratios manually. | 3 | Should Have | ✅ |
| KAL-3 | As a **farmer**, I want the calculator to pre-fill my plot's tree count and planting year so that I don't have to re-enter data I already have in SawitHub. | 3 | Should Have | ✅ |
| KAL-4 | As a **farmer**, I want to choose a fertilizing period (3-month, 6-month, annual) so that my dosage recommendation matches my actual schedule. | 3 | Should Have | ✅ |
| KAL-5 | As a **farmer**, I want to save a calculator result as a maintenance record automatically so that my planned fertilizer application is captured without re-entry. | 5 | Could Have | 🆕 |
| KAL-6 | As a **farmer**, I want to see the estimated cost of the recommended fertilizer based on current market prices so that I can budget the application. | 5 | Could Have | 🆕 |

**Epic total: 27 SP**

---

## Epic 11 — Field Checklist

*Structured field inspection checklists ensure consistent farm quality control visits.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| CHK-1 | As a **farmer**, I want to create a field inspection checklist run for a specific plot and date so that I can systematically check my farm's condition. | 5 | Should Have | ✅ |
| CHK-2 | As a **farmer**, I want to mark individual checklist items as complete or incomplete during a field visit so that I have a completion record. | 3 | Should Have | ✅ |
| CHK-3 | As a **farmer**, I want to add notes to a checklist item so that I can document observations without a separate tool. | 2 | Should Have | ✅ |
| CHK-4 | As a **farmer**, I want to create reusable checklist templates so that I don't have to re-create the same items for every inspection. | 5 | Could Have | 🆕 |
| CHK-5 | As a **cooperative supervisor**, I want to view checklist results for all member farms so that I can monitor field quality across the cooperative. | 8 | Could Have | 🆕 |

**Epic total: 23 SP**

---

## Epic 12 — Notifications

*Notifications are the primary retention mechanism — they bring farmers back to the app.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| NOT-1 | As a **farmer**, I want to see an in-app notification center so that I can review all system alerts in one place. | 3 | Must Have | ✅ |
| NOT-2 | As a **farmer**, I want to mark all notifications as read in one tap so that I can clear my notification badge quickly. | 1 | Should Have | ✅ |
| NOT-3 | As a **farmer**, I want to delete read notifications so that I keep my notification center clean. | 1 | Could Have | ✅ |
| NOT-4 | As a **farmer**, I want to receive a reminder notification when my subscription is about to expire so that I can renew before losing access. | 3 | Must Have | ✅ |
| NOT-5 | As a **farmer**, I want to receive a reminder when a maintenance schedule is due within 24 hours so that I can prepare materials. | 5 | Must Have | ✅ |
| NOT-6 | As a **farmer with an Android device**, I want to receive push notifications for maintenance reminders even when the app is closed so that I don't miss critical tasks. | 8 | Should Have | 🆕 |
| NOT-7 | As a **farmer**, I want to configure which notification types I receive so that I only get alerts that are relevant to me. | 5 | Could Have | 🆕 |

**Epic total: 26 SP**

---

## Epic 13 — Subscription & Billing

*Subscription management is the primary monetization mechanism.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| SUB-1 | As a **new farmer**, I want a 14-day free trial with all features and 2 farm slots so that I can evaluate the product before committing. | 5 | Must Have | ✅ |
| SUB-2 | As a **trial farmer**, I want to see my remaining trial days on the dashboard so that I know when to subscribe. | 2 | Must Have | ✅ |
| SUB-3 | As a **farmer ready to subscribe**, I want to check out to "Petani Pro" using Midtrans so that I can pay in IDR via my preferred local payment method. | 8 | Must Have | ✅ |
| SUB-4 | As a **farmer**, I want to see my subscription status, current plan, and expiry date in my profile so that I know when to renew. | 3 | Must Have | ✅ |
| SUB-5 | As a **farmer**, I want to view my full payment transaction history so that I can track my subscription payments over time. | 3 | Should Have | ✅ |
| SUB-6 | As a **farmer whose subscription expired**, I want to see a clear paywall explaining what I'm missing so that I'm motivated to renew. | 3 | Must Have | ✅ |
| SUB-7 | As a **farmer**, I want to pay via bank transfer, GoPay, OVO, or QRIS so that I can use my preferred Indonesian payment method. | 3 | Must Have | ✅ |
| SUB-8 | As a **cooperative member**, I want to be billed as part of a group subscription managed by my cooperative admin so that I don't have to manage individual payments. | 13 | Should Have | 🆕 |
| SUB-9 | As a **farmer on a Pro plan**, I want to be able to pay annually at a discounted rate so that I save money and don't worry about monthly renewals. | 5 | Should Have | 🆕 |
| SUB-10 | As a **farmer**, I want to receive a renewal reminder 7 days and 3 days before my subscription expires so that I have time to arrange payment. | 3 | Must Have | ✅ |

**Epic total: 48 SP**

---

## Epic 14 — Admin Panel

*The admin panel enables the SawitHub operations team to manage users, monitor health, and intervene in production.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| ADM-1 | As an **admin**, I want to log in to a separate admin panel with my admin credentials so that I can manage the platform without touching the user interface. | 3 | Must Have | ✅ |
| ADM-2 | As an **admin**, I want to view a dashboard showing total users, active users, revenue, total harvests, and total farm weight recorded so that I can monitor platform health at a glance. | 5 | Must Have | ✅ |
| ADM-3 | As an **admin**, I want to view a list of all users with their subscription status, last seen date, and role so that I can identify inactive or problematic accounts. | 5 | Must Have | ✅ |
| ADM-4 | As an **admin**, I want to change a user's role, deactivate an account, or reset a user's password so that I can handle support requests efficiently. | 5 | Must Have | ✅ |
| ADM-5 | As an **admin**, I want to view analytics charts for user growth, harvest trends, and revenue over time so that I can track business KPIs month-over-month. | 8 | Must Have | ✅ |
| ADM-6 | As an **admin**, I want to toggle a global API kill-switch via the system menu so that I can disable the platform instantly during critical incidents. | 5 | Must Have | ✅ |
| ADM-7 | As an **admin**, I want to disable a specific API endpoint without taking the whole platform offline so that I can isolate a buggy feature while keeping everything else running. | 5 | Should Have | ✅ |
| ADM-8 | As an **admin**, I want to view a complete audit log of all admin actions with timestamps and IP addresses so that I can trace any change made to the system. | 5 | Must Have | ✅ |
| ADM-9 | As an **admin**, I want to view system health metrics (DB pool, Redis stats, queue depth) so that I can diagnose performance issues without SSH access. | 5 | Should Have | ✅ |
| ADM-10 | As an **admin**, I want to update platform settings (subscription price, trial days, theme colors) without a code deployment so that I can make business changes quickly. | 5 | Should Have | ✅ |
| ADM-11 | As an **admin**, I want to view app installation counts and version adoption rates for PWA, Android, and iOS so that I know which platform our users prefer. | 5 | Should Have | 🔧 |
| ADM-12 | As an **admin**, I want to mark a user as "billing exempt" so that partners, testers, and cooperative admins can use Pro features without paying. | 2 | Should Have | ✅ |
| ADM-13 | As a **super admin**, I want to create and deactivate other admin accounts so that I control who has access to the admin panel. | 5 | Must Have | ✅ |
| ADM-14 | As an **admin**, I want to view revenue reports with transaction details filterable by date range and payment status so that I can reconcile Midtrans payouts. | 8 | Should Have | ✅ |

**Epic total: 71 SP**

---

## Epic 15 — Platform & Public Pages

*The public-facing pages drive acquisition; platform reliability drives retention.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| PLT-1 | As a **potential farmer**, I want to visit a landing page that explains SawitHub's value, shows pricing, and lets me sign up so that I can decide to try the product. | 8 | Must Have | ✅ |
| PLT-2 | As a **potential farmer**, I want to submit a contact form so that I can ask questions before signing up. | 3 | Should Have | ✅ |
| PLT-3 | As a **farmer using a mobile browser**, I want the app to work as a PWA that I can install to my home screen so that it feels like a native app without the Play Store. | 5 | Must Have | ✅ |
| PLT-4 | As an **admin**, I want to track anonymous page visits by device type and country so that I can understand where our traffic comes from. | 5 | Should Have | ✅ |
| PLT-5 | As an **admin**, I want to update the platform's primary color scheme from the admin settings so that the frontend reflects brand changes without a code deploy. | 5 | Could Have | ✅ |
| PLT-6 | As a **farmer in Indonesia**, I want the entire app interface to be in Bahasa Indonesia so that I can use it without language barriers. | 3 | Must Have | ✅ |
| PLT-7 | As a **farmer in a low-connectivity area**, I want the app to load quickly over a 3G connection so that I can record harvests from the field. | 5 | Must Have | ✅ |
| PLT-8 | As a **farmer with an Android phone**, I want to download a native Android app from the Play Store so that I get push notifications and a native app experience. | 8 | Should Have | 🔧 |
| PLT-9 | As a **farmer with an iPhone**, I want to use a native iOS app so that I have parity with Android users. | 13 | Could Have | 🆕 |

**Epic total: 55 SP**

---

## Epic 16 — Cooperative & Enterprise Tier (Future)

*Cooperative-tier features unlock the highest-value distribution channel.*

| # | User Story | SP | Priority | Status |
|---|---|---|---|---|
| KOP-1 | As a **cooperative administrator**, I want to create an organization account and invite farmer members so that I can manage subscriptions on behalf of the group. | 13 | Should Have | 🆕 |
| KOP-2 | As a **cooperative administrator**, I want to see a unified dashboard showing aggregate data for all member farms so that I can prepare monthly reports. | 13 | Should Have | 🆕 |
| KOP-3 | As a **cooperative administrator**, I want to export a consolidated financial report for all members so that I can present it at cooperative meetings. | 8 | Should Have | 🆕 |
| KOP-4 | As a **palm oil mill operator**, I want to integrate with SawitHub's API to receive real-time harvest data from registered farms so that I can plan mill capacity. | 21 | Could Have | 🆕 |
| KOP-5 | As a **PSR program facilitator**, I want to export PSR-compliant farm records from SawitHub so that farmers can submit replanting subsidy applications. | 13 | Should Have | 🆕 |
| KOP-6 | As a **bank agricultural officer**, I want farmers to share a bank-ready income verification report from SawitHub so that I can process crop loan applications faster. | 8 | Should Have | 🆕 |

**Epic total: 76 SP**

---

## Backlog Summary

| Epic | Stories | Total SP | Must Have SP | Should Have SP | Could Have SP |
|---|---|---|---|---|---|
| 1. Identity & Access | 10 | 33 | 23 | 10 | — |
| 2. Farm Management | 8 | 24 | 17 | 7 | — |
| 3. Harvest Recording | 8 | 42 | 24 | 5 | 13 |
| 4. Maintenance Mgmt | 7 | 23 | 18 | 5 | — |
| 5. Maintenance Scheduling | 8 | 36 | 13 | 18 | 5 |
| 6. Income Tracking | 4 | 13 | 8 | 5 | — |
| 7. Dashboard & Analytics | 8 | 42 | 26 | 11 | 5 |
| 8. Financial Reporting | 8 | 47 | 21 | 21 | 5 |
| 9. Commodity Prices | 5 | 26 | 8 | 5 | 13 |
| 10. Fertilizer Calculator | 6 | 27 | 8 | 9 | 10 |
| 11. Field Checklist | 5 | 23 | — | 10 | 13 |
| 12. Notifications | 7 | 26 | 9 | 8 | 5 |
| 13. Subscription & Billing | 10 | 48 | 27 | 21 | — |
| 14. Admin Panel | 14 | 71 | 38 | 28 | — |
| 15. Platform | 9 | 55 | 21 | 26 | 8 |
| 16. Cooperative/Enterprise | 6 | 76 | — | 63 | 13 |
| **Total** | **123** | **612** | **261** | **252** | **90** |

> **Won't Have (this time):** KOP-4 (Mill API integration at 21 SP) is deferred until cooperative tier has critical mass. OCR harvest capture (PAN-7, 13 SP) is deferred pending mobile camera API validation. iOS native app (PLT-9, 13 SP) is deferred until Android Play Store launch is stable.

---

## Backlog Refinement Notes

1. **LAH-8** (auto-calculate tree age) can be implemented as a derived field in the frontend — 2 SP, quick win.
2. **JAD-6** (WhatsApp reminders) requires integration with WhatsApp Business API — needs vendor selection before sprint.
3. **LAP-6** (cooperative consolidated report) is a prerequisite for KOP-3; should be groomed together.
4. **ADM-11** (app install stats) is blocked on backend endpoints — flagged `TODO[backend-pending]` in codebase. Backend API must be built first.
5. **SUB-8** (cooperative group billing) should be broken down further in a separate refinement session — 13 SP is too large for a single sprint item.
