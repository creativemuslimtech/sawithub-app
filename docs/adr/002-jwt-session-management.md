# ADR-002: JWT Session Management with Redis Revocation

**Status:** Accepted

## Context

SawitHub needs to support:
1. **Single-token logout** — user logs out from one device, that token stops working immediately
2. **Logout-all-devices** — user changes password or suspects compromise; all sessions invalidated instantly
3. **Admin-initiated session kill** — admin suspends an account; user is immediately logged out everywhere

Stateless JWTs with short expiry handle (1) poorly — you must wait for expiry. Long-expiry JWTs make (2) and (3) impossible without a token blocklist.

Options considered:

| Option | Tradeoffs |
|---|---|
| Short-expiry JWT (15min) + refresh tokens | Complex token refresh UX; mobile apps need token refresh background job |
| JWT blocklist in MySQL | Write on every logout; read on every request; MySQL not optimized for this access pattern |
| JWT blocklist in Redis (JTI-based) | Fast read/write; TTL-based auto-cleanup; Redis is already required for rate limiting |
| Session-version counter in Redis | Bulk invalidation in O(1); no need to track individual JTIs for logout-all |

## Decision

Two-layer revocation strategy:

**Layer 1 — Per-token JTI revocation (for single logout):**
- Each JWT contains a `jti` (UUID) claim
- On logout, the JTI is stored in Redis with a TTL equal to the token's remaining lifetime: `jti:{jti} → "revoked"` 
- Auth middleware checks this key on every request

**Layer 2 — Session version counter (for logout-all):**
- Each JWT contains a `session_version` claim (integer)
- Redis stores `session_version:user:{user_id}` → current version
- On logout-all or password change, the version counter is incremented
- Auth middleware rejects any token whose `session_version` < current Redis value
- Admin account suspension also bumps the version counter

**JWT parameters:**
- Algorithm: HMAC-SHA256
- Expiry: configurable (default in codebase), typically 7–30 days
- Separate secrets: `JWT_SECRET` (user backend) vs `ADMIN_JWT_SECRET` (admin backend) — user tokens are rejected by admin middleware and vice versa

## Consequences

**Benefits:**
- Immediate revocation without database write on every request
- Logout-all is O(1) — increment one Redis counter
- Redis TTL handles JTI cleanup automatically
- Admin can instantly invalidate any user's sessions

**Trade-offs:**
- All protected requests require one Redis read (JTI check) + one Redis read (session_version check) — adds ~1ms latency per request
- If Redis is down and `REDIS_FEATURE_SESSIONS=false`, revocation is bypassed — tokens remain valid until expiry. This is an accepted degradation during Redis outages (rate limiting and cache also degrade gracefully)
- Two separate JWT secrets means the admin and user services cannot share a token validation library without passing the correct secret — enforced by separate middleware
