# ADR-004: Subscription Enforcement via Middleware Guards

**Status:** Accepted

## Context

SawitHub has three access tiers:
- **Trial**: 14 days, capped at 1 farm and 2 harvests
- **Pro**: Rp 30,000/month, unlimited access
- **Expired**: trial ended, no active subscription — read-only or blocked

Subscription enforcement must be:
- Consistent — the same check runs regardless of which client calls the endpoint
- Testable — easy to verify a specific endpoint is guarded
- Centralized — business rules not scattered across handler logic

Options considered:

| Option | Tradeoffs |
|---|---|
| Check subscription in each handler | Simple but duplicated; easy to forget on new endpoints |
| Middleware per endpoint | Explicit registration; easy to audit which routes are guarded |
| Single gate middleware applied to all routes | Simple but overly broad; read endpoints shouldn't be gated |
| Database trigger or application layer rule | Application layer is correct; DB triggers are hard to test and observe |

## Decision

Two reusable middleware functions in `internal/middleware/`:

**`RequireFullAccess()`** — blocks if the user's subscription is expired (trial ended, no active Pro plan). Returns HTTP 402 with `{"error": "subscription required"}`. Applied to all write operations and report exports.

**`RequireFeature(feature string)`** — blocks specific feature access. Returns HTTP 402. Used for features that are gated separately from the base subscription (e.g., cooperative features, advanced analytics).

**Trial usage counters** — for per-action trial caps (harvests, report exports), handler-level checks use `EnsureTrialUsageAllowed(ctx, userID, "trial_harvest_used" | "trial_report_export_used", limit, ...)`. These are Redis counters incremented on each create; when the counter hits the cap, the handler returns 402 before any DB write. The farm cap is enforced differently — `active_farm_limit` (default `1`) is a column on `t_sawit_hub_users`, not a Redis counter, so raising it per-account (e.g. for a paid plan) is a DB update rather than a config change.

**Why HTTP 402 (Payment Required)?** This is the semantically correct status code for subscription enforcement. Frontend code checks for 402 specifically to trigger the upgrade modal.

## Consequences

**Benefits:**
- Route-level enforcement is explicit and auditable — search for `RequireFullAccess` to find all guarded endpoints
- HTTP 402 semantics let the frontend handle the paywall UI without parsing error message strings
- Trial usage counters in Redis are fast (O(1)) and don't require a DB read on every request

**Trade-offs:**
- Developers must remember to add `RequireFullAccess()` when adding new write endpoints — this is not automatic
- Trial counters in Redis can drift from the actual DB count if Redis is flushed. Recovery: counters are recomputed from the DB on the next request if missing (lazy rehydration)
- The `VITE_ALLOW_MOCK_BILLING=true` escape hatch used in E2E tests bypasses billing UI (not the API guard) — the server-side 402 check always applies
