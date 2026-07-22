# apps/admin-backend — SawitHub Admin API

Go 1.25 REST API for the SawitHub admin panel. Provides platform-level user management, analytics, system controls (API kill-switch), and audit logging. Uses a separate JWT secret and admin-only database.

**Port:** `8001` (local) | **Databases:** `sawit_hub_db` (read) + `sawit_hub_admin_db` (admin auth) | **Deploy:** Railway

---

## Stack

| Layer | Technology |
|---|---|
| Router | [chi v5](https://github.com/go-chi/chi) |
| Database | MySQL 8.0 — `sawit_hub_db` (analytics) + `sawit_hub_admin_db` (admin accounts) |
| Auth | HMAC-SHA256 JWT, separate `ADMIN_JWT_SECRET` |
| Cache / Rate limit | Redis 7 (`redis/go-redis/v9`) |
| API kill-switch | APIGate middleware — per-endpoint state in Redis |
| Observability | OpenTelemetry (OTLP/gRPC) + stdout structured logs |
| OpenAPI validation | [kin-openapi](https://github.com/getkin/kin-openapi) |

---

## Local Setup

### 1. Prerequisites

- Go 1.25+
- MySQL 8.0+ with both `sawit_hub_db` and `sawit_hub_admin_db` databases
- Redis 7+ running on `localhost:6379`
- The user backend (`apps/backend`) should be running first so admin can read its data

```bash
# Create admin database if not exists
mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS sawit_hub_admin_db;"
```

### 2. Environment variables

```bash
cp .env.example .env
```

Minimum required fields:

```env
DATABASE_URL=root:root@tcp(localhost:3306)/sawit_hub_db?parseTime=true&loc=Asia%2FJakarta&charset=utf8mb4
DATABASE_URL_READ=root:root@tcp(localhost:3306)/sawit_hub_db?parseTime=true&loc=Asia%2FJakarta&charset=utf8mb4
ADMIN_DATABASE_URL=root:root@tcp(localhost:3306)/sawit_hub_admin_db?parseTime=true&loc=Asia%2FJakarta&charset=utf8mb4
ADMIN_DATABASE_URL_READ=root:root@tcp(localhost:3306)/sawit_hub_admin_db?parseTime=true&loc=Asia%2FJakarta&charset=utf8mb4
ADMIN_JWT_SECRET=any-32-char-admin-dev-secret
ENCRYPTION_KEY=32-byte-dev-encryption-key!!!!!!
REDIS_ADDR=localhost:6379
FRONTEND_URL=http://localhost:5174
BASE_URL=http://localhost:8001
PORT=8000
```

### 3. Run

```bash
go run ./cmd/main.go
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Main app DB write DSN (`sawit_hub_db`) |
| `DATABASE_URL_READ` | Yes | Main app DB read DSN |
| `ADMIN_DATABASE_URL` | Yes | Admin DB write DSN (`sawit_hub_admin_db`) |
| `ADMIN_DATABASE_URL_READ` | Yes | Admin DB read DSN |
| `ADMIN_JWT_SECRET` | Yes | Separate JWT signing key for admin tokens |
| `ENCRYPTION_KEY` | Yes | Same 32-byte AES-256 key as user backend |
| `REDIS_ADDR` | Yes | Redis host:port (shared with user backend) |
| `REDIS_PREFIX` | No | Key prefix — must match user backend prefix |
| `REDIS_TLS` | No | `true` in production |
| `PORT` | No | HTTP port (default: `8000`; run on `8001` locally) |
| `FRONTEND_URL` | Yes | Admin panel URL for CORS |
| `BASE_URL` | Yes | Admin backend canonical URL |

Redis feature flags:

| Variable | Controls |
|---|---|
| `REDIS_FEATURE_RATE_LIMIT` | Admin API rate limiting |
| `REDIS_FEATURE_CACHE` | Analytics overview (3min) + trends (5min) cache |
| `REDIS_FEATURE_SESSIONS` | Admin JWT session management |
| `REDIS_FEATURE_PRESENCE` | Presence data for user monitoring |

---

## Project Structure

```
apps/admin-backend/
├── cmd/
│   └── main.go           startup sequence
├── internal/
│   ├── handler/          HTTP handlers (auth, users, analytics, system)
│   ├── middleware/        Admin auth guard, rate limit, APIGate
│   ├── config/           App config loading
│   ├── db/               MySQL connection pools (dual database)
│   ├── redis/            Redis client setup
│   ├── observability/    OTel + metrics
│   ├── logger/           Structured logger
│   └── telemetry/        OTel tracer
├── openapi/              OpenAPI spec for kin-openapi validation
└── .env.example
```

---

## API Endpoints

All endpoints require `Authorization: Bearer <adminToken>` except `/api/admin/auth/login`.

| Group | Endpoints |
|---|---|
| Auth | `POST /api/admin/auth/login`, `GET /api/admin/auth/me` |
| Users | `GET /api/admin/users`, `GET /api/admin/users/{id}`, `PUT /api/admin/users/{id}/status`, `DELETE /api/admin/users/{id}` |
| Analytics | `GET /api/admin/analytics/overview`, `GET /api/admin/analytics/panen-trends` |
| System | `GET /api/admin/system/api-endpoint-state`, `PUT /api/admin/system/api-endpoint-state`, `GET /api/admin/system/audit-logs` |

Full spec: `docs/api/openapi.yaml` (adminBearerAuth security scheme).

---

## API Kill-Switch (APIGate)

The `PUT /api/admin/system/api-endpoint-state` endpoint lets admins disable individual API endpoints on the **user backend** without a deploy. The state is stored in Redis and read by the `APIGate` middleware on each request.

```json
{ "endpoint": "POST /api/panen", "enabled": false, "reason": "Emergency maintenance" }
```

Disabled endpoints return HTTP 503 with a maintenance message. Changes propagate within the Redis TTL window.

---

## Testing

```bash
go test ./...
go test -race ./...
```

---

## Security Notes

- Admin JWT tokens use a completely separate signing secret (`ADMIN_JWT_SECRET`) — user tokens are rejected by admin middleware and vice versa.
- Admin accounts live in `sawit_hub_admin_db`, not in the user database.
- All admin write actions are recorded to the audit log.
- The `ENCRYPTION_KEY` must be identical to the user backend so the admin service can decrypt PII fields when needed for support operations.
