# ADR-005: Separate Admin Backend Service

**Status:** Accepted

## Context

SawitHub needs an admin panel for operators to:
- View and manage all user accounts
- See platform-level analytics
- Toggle API endpoints on/off (kill-switch)
- View audit logs

Options for how to implement admin functionality:

| Option | Tradeoffs |
|---|---|
| Admin routes in the same backend (`/admin/*`) | Single deploy; but admin JWT and user JWT share the same server process |
| Separate admin backend service | Two deploys; clear security boundary; separate secrets |
| Admin panel calls user backend with elevated `role=admin` claim | Simpler; but any bug in JWT role check could escalate a user JWT to admin |

## Decision

A completely separate service: `apps/admin-backend`.

**Separate JWT secret:** `ADMIN_JWT_SECRET` is distinct from `JWT_SECRET`. A user JWT presented to the admin backend is unconditionally rejected (different secret = verification fails). An admin JWT presented to the user backend is also rejected. There is no shared token space.

**Separate database:** Admin accounts live in `sawit_hub_admin_db` (3 tables). The admin service reads from `sawit_hub_db` for analytics/user management but does not share the write credentials in the same way.

**Separate Vercel project:** `admin-frontend` deploys to `adminpanel.sawithub.com`, a distinct domain with `robots.txt` blocking all crawlers.

**Separate CORS origin:** The admin backend's `FRONTEND_URL` is set to the admin panel domain — user frontend requests are rejected.

## Consequences

**Benefits:**
- A compromised user token cannot be escalated to admin access — different secrets make cross-service token use impossible
- Admin service can be deployed, scaled, or rolled back independently of the user-facing service
- Admin database credentials are separate — a breach of the user backend does not expose admin credentials
- Clear code separation: admin-specific queries and logic don't pollute the user-facing codebase

**Trade-offs:**
- Two backend services to deploy and maintain on Railway
- Shared `ENCRYPTION_KEY` is still required so admin can decrypt user PII fields for support operations — this is documented and must be kept in sync
- Admin analytics queries read from `sawit_hub_db` directly, which means admin reporting load hits the same MySQL cluster as user traffic. A dedicated analytics replica would be the next step if analytics queries cause load issues
- Some code is duplicated (middleware, logger, OTel setup) between the two services — kept intentionally rather than extracting a shared Go package, to keep each service independently deployable
