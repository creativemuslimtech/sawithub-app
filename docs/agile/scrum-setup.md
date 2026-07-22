# SawitHub — Scrum Setup

**Version:** 1.0  
**Date:** 2026-05-21  
**Product:** SawitHub Palm Oil Farm Management SaaS

---

## 1. Sprint Planning — Sprints 1–3

### Assumptions

- Sprint length: **2 weeks**
- Team capacity: **~50 SP per sprint** (estimated for a 4-person team at 70% velocity)
- Sprints are forward-looking from current state — existing ✅ features are in production; these sprints address 🔧 polish items, 🆕 new features, and technical improvements identified in the codebase
- Priorities: Must Have unresolved items first, then Should Have items with highest business value

---

### Sprint 1 — "Retention & Field Reliability"

**Sprint Goal:** Ensure the core farmer loop — record harvest → see net income → get reminded about maintenance — works flawlessly on mobile in low-connectivity conditions. These are the features most directly tied to daily active use and churn reduction.

**Business Rationale:** With 12,400+ active farmers, even a 5% churn reduction from better offline support and push notifications is worth more than any new feature this quarter.

| Story ID | Story | SP | Epic |
|---|---|---|---|
| DAS-8 | Offline-first dashboard: serve cached data when no network | 8 | Dashboard |
| NOT-6 | Android push notifications for maintenance reminders | 8 | Notifications |
| JAD-7 | Mark a scheduled maintenance "done" — auto-advance to next occurrence | 5 | Scheduling |
| LAP-7 | Direct file download of financial report (not only via email) | 5 | Reporting |
| LAP-5 | PDF report includes farm name and formatted header (bank-ready) | 3 | Reporting |
| TBS-4 | Notify farmer when TBS price changes significantly | 5 | Commodity |
| LAH-8 | Auto-display tree age from planting year on farm list | 2 | Farm Mgmt |
| ADM-11 | Backend endpoints for PWA/Android install stats (unblocks ADM-11 UI) | 5 | Admin |
| NOT-7 | Notification preference settings (per-type opt-in/out) | 5 | Notifications |

**Sprint 1 Total: 46 SP**

**Sprint 1 Risks:**
- Push notifications require Capacitor Push plugin configuration and Play Console setup — spike may be needed in planning
- Offline caching strategy for dashboard needs design decision: Zustand persistence vs. Service Worker cache

**Sprint 1 Success Metrics:**
- Dashboard loads from cache within 500ms in airplane mode
- Maintenance reminder push delivered to test device within 5 minutes of schedule trigger
- Financial report PDF downloadable directly (no email bounce required for verification)

---

### Sprint 2 — "Growth & Monetization Unlock"

**Sprint Goal:** Activate the two highest-value growth channels: annual subscription pricing and the foundation of cooperative-tier billing. Simultaneously improve trial-to-paid conversion with better paywall UX and subscription upgrade prompts.

**Business Rationale:** Annual pre-pay improves cash flow and reduces churn by ~40% on average for SaaS. The cooperative group billing foundation unlocks the B2B2C channel that can add 200–1,000 farmers per deal.

| Story ID | Story | SP | Epic |
|---|---|---|---|
| SUB-9 | Annual subscription plan with 2-month discount (Rp 300,000/year) | 5 | Billing |
| SUB-8 | Cooperative group billing — phase 1: org account + invite members | 13 | Billing |
| LAP-6 | Cooperative consolidated report (all member farms in one PDF) | 8 | Reporting |
| KOP-1 | Cooperative admin account creation and member invitation flow | 13 | Enterprise |
| JAD-6 | WhatsApp Business API integration for maintenance reminders | 8 | Scheduling |
| KAL-5 | Save fertilizer calculator result as a maintenance record in one tap | 5 | Calculator |

**Sprint 2 Total: 52 SP**

> Note: SUB-8 + KOP-1 are tightly coupled and should be planned as a single feature thread. If the team determines they exceed capacity together, defer KOP-1 to Sprint 3 and deliver SUB-9 + JAD-6 + LAP-6 + KAL-5 (34 SP) instead.

**Sprint 2 Risks:**
- WhatsApp Business API requires Meta approval (can take 1–2 weeks) — submit application before sprint starts
- Cooperative billing model needs legal/finance review for IDR group invoicing
- SUB-8 + KOP-1 combined (26 SP) is high; recommend splitting into sub-tasks ≤8 SP each in refinement

**Sprint 2 Success Metrics:**
- Annual plan visible in subscription checkout flow; at least one test transaction completes
- Cooperative org can be created, and 3 test farmer accounts successfully joined as members
- WhatsApp reminder delivered to test number for a triggered maintenance schedule

---

### Sprint 3 — "Data Intelligence & Platform Maturity"

**Sprint Goal:** Surface deeper insights from the data farmers are already recording. Add bulk data entry to reduce manual friction for larger farms. Lay the groundwork for PSR compliance exports that unlock the government distribution channel.

**Business Rationale:** Larger farms (5+ ha) are the highest-ARPU segment. Bulk import removes their primary adoption barrier. PSR compliance features open a government-subsidized acquisition channel with minimal CAC.

| Story ID | Story | SP | Epic |
|---|---|---|---|
| PAN-8 | Bulk harvest import from CSV/Excel | 8 | Harvest |
| KOP-5 | PSR-compliant farm record export for subsidy applications | 13 | Enterprise |
| DAS-7 | "Top 3 performing months" highlight on dashboard | 3 | Dashboard |
| RAW-7 | Maintenance cost breakdown chart (material vs. labor) | 5 | Maintenance |
| TBS-5 | Auto-pull official DISBUN/GAPKI TBS price for user's province | 8 | Commodity |
| KAL-6 | Estimated cost display in fertilizer calculator | 5 | Calculator |
| CHK-4 | Reusable field checklist templates | 5 | Checklist |
| LAP-8 | One-tap WhatsApp share for financial report | 5 | Reporting |

**Sprint 3 Total: 52 SP**

> Note: TBS-5 (auto price pull) requires identifying a reliable DISBUN API or scraping source — spike task needed. KOP-5 (PSR export) format must be validated against current Kementan requirements before development.

**Sprint 3 Risks:**
- DISBUN/GAPKI price feed is not officially available as a public API — data sourcing strategy needed
- PSR export format may change with government regulation updates — design for configurability
- KOP-5 at 13 SP should be broken down; PSR export schema research is at least a 3 SP spike

**Sprint 3 Success Metrics:**
- 50-row harvest CSV imported successfully with validation errors surfaced per-row
- PSR export passes format check against latest Kementan template (validated manually)
- DISBUN price auto-populates for at least 5 major palm provinces (Riau, Sumut, Kalbar, Jambi, Sumsel)

---

### 3-Sprint Roadmap View

```
Sprint 1 (Weeks 1-2)           Sprint 2 (Weeks 3-4)           Sprint 3 (Weeks 5-6)
"Retention & Field Reliability"  "Growth & Monetization"        "Data Intelligence & Maturity"
───────────────────────────────  ─────────────────────────────  ──────────────────────────────
✓ Offline dashboard cache        ✓ Annual subscription plan     ✓ Bulk harvest CSV import
✓ Android push notifications     ✓ Cooperative billing phase 1  ✓ PSR compliance export
✓ Schedule completion flow       ✓ WhatsApp reminders           ✓ Auto TBS price pull
✓ Direct PDF download            ✓ Coop consolidated report     ✓ Cost breakdown charts
✓ Bank-ready PDF header          ✓ Coop org + member invite     ✓ Reusable checklist templates
✓ TBS price change alert         ✓ Fertilizer → maintenance     ✓ Dashboard seasonal insights
✓ Tree age auto-display                                         ✓ WhatsApp report share
✓ Notification preferences
✓ Admin app install stats API
46 SP                            ~50 SP                         ~52 SP
```

---

## 2. Definition of Done (DoD)

The Definition of Done applies to **every user story** before it can be moved to Done in the sprint board. All criteria must be met — no exceptions.

### 2.1 Code Quality

- [ ] Code reviewed by at least one other team member (PR approved)
- [ ] No unresolved PR comments marked as blocking
- [ ] New code passes `golangci-lint` (Go) or `eslint` + `tsc -b` (TypeScript) with zero new errors
- [ ] `go vet ./...` passes for Go changes
- [ ] No new `// TODO`, `// FIXME`, or `// HACK` comments introduced (existing ones are acceptable; new ones must have a ticket reference)
- [ ] No hardcoded credentials, API keys, or PII values in committed code
- [ ] No `console.log` / `fmt.Println` debug statements in production code paths

### 2.2 Testing

- [ ] Unit tests written for all new business logic functions (Go: table-driven tests; TypeScript: Vitest)
- [ ] Unit test coverage for the changed package does not decrease below the pre-story baseline
- [ ] All existing tests pass: `go test ./...` + `npm run test -- --run`
- [ ] For handler-level changes: at least one integration test exercises the happy path against real DB and Redis
- [ ] For frontend feature pages: at least one Playwright test covers the primary user flow
- [ ] No new flaky tests introduced (flaky test = passes <95% of runs)

### 2.3 Functionality

- [ ] Feature works on the latest stable Chrome, Safari, and Firefox (web)
- [ ] Feature works on Android 10+ (Capacitor app and mobile Chrome)
- [ ] Feature works correctly when the user is on a slow 3G connection (tested with Chrome DevTools throttling)
- [ ] Subscription guards enforced: feature is gated correctly for trial / pro / expired users
- [ ] No regression in existing features on the same page (smoke-tested manually)
- [ ] Edge cases handled: empty states, error states, and loading states all render correctly

### 2.4 Security

- [ ] New API endpoints require authentication unless explicitly designed as public
- [ ] All user inputs validated server-side (not only client-side)
- [ ] No new PII fields stored outside AES-encrypted columns or their deterministic hash equivalents
- [ ] New Redis keys follow the `sawithub:prod:{domain}:{key}` convention and are listed in `packages/redis-config`
- [ ] No new Redis keys that could store email, phone, or password data
- [ ] Rate limiting applies to all new protected endpoints
- [ ] New Midtrans webhook handlers use idempotency keys

### 2.5 Performance

- [ ] Dashboard and financial report endpoints respond in <500ms at p95 under normal load
- [ ] New database queries have indexes for all filter/join columns (verified with `EXPLAIN`)
- [ ] No N+1 query patterns introduced in new handlers
- [ ] Frontend bundle size increase <50 KB per new page (checked via Vite build output)
- [ ] New React components do not cause unnecessary re-renders of sibling components (checked with React DevTools Profiler for pages with >50 list items)

### 2.6 Documentation & Observability

- [ ] New API endpoints documented in `apps/admin-backend/docs/openapi.yaml` (if admin-backend) or inline handler comment (if user backend)
- [ ] New environment variables added to the service's `.env.example` file with a description comment
- [ ] New background jobs or cron workers documented in `docs/architecture/system-architecture.md` job table
- [ ] Significant business logic changes reflected in relevant `docs/` files
- [ ] New admin-backend endpoints trigger type regeneration (`npm run gen:types`)

### 2.7 Deployment Readiness

- [ ] Feature is deployed to staging and manually verified by the developer
- [ ] Staging smoke test passes: happy path works end-to-end on staging environment
- [ ] Database migrations are backward-compatible with the currently deployed production binary
- [ ] New migrations tested for rollback (`down` migration runs without error)
- [ ] No breaking changes to existing API response shapes without a versioning plan
- [ ] Feature flags / subscription enforcement flags set correctly for staging

### 2.8 Acceptance

- [ ] Product Owner has accepted the story against the acceptance criteria defined in sprint planning
- [ ] Demo-ready: the story can be shown in the Sprint Review without a script or workarounds
- [ ] Accessibility: new interactive elements are keyboard-navigable and have ARIA labels where needed

---

## 3. Team Ceremonies Schedule Template

### Team Composition (Recommended)

| Role | Count | Responsibilities |
|---|---|---|
| Product Owner | 1 | Backlog prioritization, acceptance, stakeholder liaison |
| Scrum Master | 1 | Ceremony facilitation, impediment removal, team health |
| Backend Engineer (Go) | 1–2 | API, DB, background jobs, infrastructure |
| Frontend Engineer (TypeScript) | 1–2 | React SPA, admin panel, mobile |
| QA / Full-Stack | 1 | Testing, E2E automation, cross-service validation |

*Total team size: 5–7 people. Scrum Master may be a rotating role for a team this size.*

---

### Sprint Calendar (2-week sprint, Monday start)

```
WEEK 1
────────────────────────────────────────────────────────────────────
Mon  ░░░░░░░░░░░░░░░░░░░░░░  Sprint Planning (3–4 hours)
Tue  Development
Wed  Development + Daily Scrum
Thu  Development + Daily Scrum
Fri  Development + Daily Scrum + Weekly Backlog Check (30 min)

WEEK 2
────────────────────────────────────────────────────────────────────
Mon  Development + Daily Scrum + Mid-Sprint Review (internal, 30 min)
Tue  Development + Daily Scrum
Wed  Development + Daily Scrum + Backlog Refinement (90 min)
Thu  Development + Daily Scrum  ← Feature freeze for this sprint
Fri  ░░░░░░░░░░░░░░░░░░░░░░  Sprint Review (1 hour) → Sprint Retro (1 hour)
```

---

### Ceremony Details

#### Daily Scrum (Stand-up)
- **Duration:** 15 minutes (strict)
- **Format:** Async-first (Slack/Notion by 9:30 AM WIB) + optional 5-min sync for blockers
- **Three questions:**
  1. What did I complete since yesterday?
  2. What am I working on today?
  3. Do I have any blockers?
- **Anti-patterns to avoid:** Problem-solving in stand-up, status reports to Scrum Master (not to each other), attending but not participating
- **Scrum Master role:** Identify blockers, schedule follow-up conversations outside stand-up

#### Sprint Planning
- **Duration:** 3–4 hours (2-week sprint)
- **Attendees:** Full Scrum team + Product Owner
- **Inputs:** Refined backlog with estimated stories, team capacity (subtract PTO, holidays, support rotations)
- **Outputs:** Sprint Goal (one sentence), Sprint Backlog (committed stories), Sprint Board populated
- **Process:**
  1. PO presents Sprint Goal and top backlog items (30 min)
  2. Team asks clarifying questions; PO updates acceptance criteria if needed (45 min)
  3. Team breaks stories into tasks and estimates capacity fit (60 min)
  4. Team commits to Sprint Backlog; Scrum Master updates board (30 min)
- **Capacity formula:** `available_days × team_size × 0.7 × avg_SP_per_day`
  - Example: 10 days × 5 engineers × 0.7 × ~1.5 SP/day = ~52 SP capacity

#### Backlog Refinement (Grooming)
- **Duration:** 90 minutes
- **Cadence:** Every sprint, Week 2 Wednesday (1 week before next sprint)
- **Attendees:** Full Scrum team + Product Owner
- **Goal:** Ensure top 2 sprints of backlog are ready (estimated, acceptance criteria written, dependencies identified)
- **Activities:**
  1. Review newly added stories — write acceptance criteria
  2. Re-estimate stories that have changed in scope
  3. Split stories >8 SP into smaller stories
  4. Identify and log dependencies (blocked by, blocks)
  5. Promote or demote priorities based on PO feedback
- **Ready criteria** (story is "Ready for Sprint" when):
  - Acceptance criteria written and agreed
  - Story estimated (SP assigned)
  - Dependencies identified and resolved or planned
  - Design/mockups attached (for UI stories)
  - No story >8 SP enters a sprint (must be split)

#### Sprint Review
- **Duration:** 1 hour
- **Cadence:** Last Friday of the sprint
- **Attendees:** Scrum team + Product Owner + invited stakeholders (cooperative partners, pilot users)
- **Format:**
  1. Scrum Master: Sprint Goal recap + velocity (10 min)
  2. Each developer demos their completed stories against acceptance criteria (30 min)
  3. PO: Accept or reject each story; notes on what needs adjustment (10 min)
  4. Open discussion: stakeholder feedback on priorities (10 min)
- **Outputs:** Accepted stories moved to Done; rejected stories return to backlog with feedback; updated product increment
- **Demo environment:** Always demo on staging — never on production, never on localhost

#### Sprint Retrospective
- **Duration:** 1 hour
- **Cadence:** Last Friday of the sprint, immediately after Review
- **Attendees:** Scrum team only (no Product Owner, no external stakeholders — psychological safety)
- **Format (rotate formats to prevent staleness):**

  *Format A — Start / Stop / Continue (even sprints):*
  ```
  What should we START doing?
  What should we STOP doing?
  What should we CONTINUE doing?
  ```

  *Format B — 4Ls (odd sprints):*
  ```
  What did we LIKE?
  What did we LEARN?
  What did we LACK?
  What do we LONG FOR?
  ```

- **Process:**
  1. Silent individual reflection + sticky notes (10 min)
  2. Group by theme (10 min)
  3. Dot vote on top 3 items to act on (5 min)
  4. Define 1–3 actionable improvement items with an owner and a deadline (15 min)
  5. Review action items from previous retro (10 min)
  6. Close (5 min)
- **Outputs:** 1–3 improvement actions with owners, added to next sprint's board as non-functional tasks

#### Optional: Weekly Backlog Sync (PO + Scrum Master only)
- **Duration:** 30 minutes
- **Cadence:** Friday of Week 1
- **Purpose:** PO shares any market/stakeholder signals that should update priorities; Scrum Master flags technical risks the PO should be aware of; align on refinement session agenda for Week 2

---

### Meeting Anti-Patterns to Avoid

| Anti-pattern | Impact | Fix |
|---|---|---|
| Stand-up becomes a status report to the manager | Kills psychological safety, hides real blockers | Scrum Master explicitly redirects: "tell the team, not me" |
| Sprint Planning without refined backlog | Planning runs over 4 hours, stories are vague | Enforce Ready criteria; refuse to plan stories with no acceptance criteria |
| Retrospective items never actioned | Team loses trust in the process | Make 1 improvement action mandatory each sprint; review previous one first |
| Review with only developers attending | Backlog never gets real user feedback | Invite 1–2 actual farmers as stakeholders quarterly |
| Stories carried over sprint after sprint (zombie stories) | Inflates WIP, blocks new work | After 2 sprints unfinished, re-estimate or split; if 3+ sprints, return to backlog for re-prioritization |
| Refinement skipped "because we're busy" | Next sprint planning is chaos | Treat refinement as an investment, not overhead; technical debt from rushed planning is costlier |

---

### Sprint Board Columns

```
BACKLOG → READY → IN PROGRESS → IN REVIEW → STAGING → DONE
```

| Column | Definition |
|---|---|
| **Backlog** | All stories not selected for current sprint |
| **Ready** | Stories meeting the Ready criteria, available for next sprint selection |
| **In Progress** | Developer has started work; branch created |
| **In Review** | PR opened; awaiting code review |
| **Staging** | Code merged; deployed to staging; awaiting QA/PO verification |
| **Done** | All DoD criteria met; PO accepted in Sprint Review |

**WIP Limits (recommended):**
- In Progress: max 2 stories per developer (prevents context-switching)
- In Review: max 4 stories total (prevents review bottleneck)
- Staging: max 6 stories total (prevents staging environment becoming stale)

---

### Velocity & Capacity Tracking Template

Track per sprint to identify sustainable pace:

| Sprint | Committed SP | Completed SP | Velocity | Carry-over | Notes |
|---|---|---|---|---|---|
| Sprint 1 | 46 | — | — | — | — |
| Sprint 2 | 50 | — | — | — | — |
| Sprint 3 | 52 | — | — | — | — |
| Average | — | — | — | — | After 3 sprints |

**Velocity calculation:** Use 3-sprint rolling average for capacity planning. Do not use committed SP — use completed SP only.

**Healthy velocity signals:**
- Carry-over <10% of committed SP
- Velocity variance <20% sprint-over-sprint
- No story takes >1.5x its estimated SP to complete (if it does, re-estimate the category in retro)

---

### Key Performance Indicators (KPIs) to Review in Sprint Reviews

| KPI | Target | Measured How |
|---|---|---|
| Trial-to-paid conversion rate | >25% | Admin analytics dashboard |
| Monthly churn rate | <5% | Admin revenue view |
| Daily Active Users / Monthly Active Users | >30% | Admin overview: online_users_now / active_users_30d |
| Average farms per Pro user | >2 | Admin data query |
| Financial report exports per month | Growing MoM | Admin analytics |
| p95 API response time | <500ms | `/api/health` redis_metrics |
| Asynq email queue depth | <50 items | `/api/health` redis_queue.email_depth |
| Sprint velocity (3-sprint avg) | Stable ±20% | Velocity tracking table above |
