# apps/backend — SawitHub User API

Go 1.25 REST API for the SawitHub farmer-facing application. Handles authentication, farm data CRUD, financial reporting, subscription billing (Midtrans), email delivery (Resend/Asynq), and observability.

**Port:** `8000` | **Database:** `sawit_hub_db` (MySQL) | **Deploy:** Railway

---

## Stack

| Layer | Technology |
|---|---|
| Router | [chi v5](https://github.com/go-chi/chi) |
| Database | MySQL 8.0 — primary write + read replica |
| Migrations | [golang-migrate v4](https://github.com/golang-migrate/migrate) |
| Auth | HMAC-SHA256 JWT (`golang-jwt/jwt/v5`) |
| Cache / Sessions | Redis 7 (`redis/go-redis/v9`) |
| Background jobs | [Asynq v0.26](https://github.com/hibiken/asynq) on Redis |
| Email | [Resend API](https://resend.com) |
| Payments | Midtrans Snap |
| Observability | OpenTelemetry (OTLP/gRPC) + stdout structured logs |
| PII encryption | AES-256-GCM (`golang.org/x/crypto`) |

---

## Local Setup

### 1. Prerequisites

- Go 1.25+
- MySQL 8.0+ running on `localhost:3306`
- Redis 7+ running on `localhost:6379`

```bash
# Quick local infra with Docker
docker run -d --name sawit-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=sawit_hub_db \
  -p 3306:3306 mysql:8.0

docker run -d --name sawit-redis -p 6379:6379 redis:7
```

### 2. Environment variables

```bash
cp .env.example .env
```

Minimum required fields to get a running server:

```env
DATABASE_URL=root:root@tcp(localhost:3306)/sawit_hub_db?parseTime=true&loc=Asia%2FJakarta&charset=utf8mb4
DATABASE_URL_READ=root:root@tcp(localhost:3306)/sawit_hub_db?parseTime=true&loc=Asia%2FJakarta&charset=utf8mb4
JWT_SECRET=any-32-char-dev-secret
ENCRYPTION_KEY=32-byte-dev-encryption-key!!!!!!
REDIS_ADDR=localhost:6379
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:8000
PORT=8000
```

See `.env.example` for the complete list including Resend, Midtrans, and OTel variables.

### 3. Run

```bash
go run ./cmd/main.go
```

The server runs migrations automatically on startup (5 retries, 3s delay). Once ready:

```
GET http://localhost:8000/api/health
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL write DSN |
| `DATABASE_URL_READ` | Yes | MySQL read-replica DSN |
| `JWT_SECRET` | Yes | HMAC-SHA256 signing key |
| `ENCRYPTION_KEY` | Yes | 32-byte AES-256 key for PII |
| `REDIS_ADDR` | Yes | Redis host:port |
| `REDIS_PASSWORD` | No | Redis auth password |
| `REDIS_PREFIX` | No | Key prefix (default: `sawithub:prod`) |
| `REDIS_TLS` | No | `true` in production |
| `PORT` | No | HTTP port (default: `8000`) |
| `FRONTEND_URL` | Yes | CORS allowed origin |
| `BASE_URL` | Yes | Backend canonical URL |
| `RESEND_API_KEY` | No | Required for email delivery |
| `EMAIL_FROM` | No | Sender address |
| `MIDTRANS_SERVER_KEY` | No | Required for billing |
| `MIDTRANS_CLIENT_KEY` | No | Required for billing |
| `MIDTRANS_ENV` | No | `sandbox` or `production` |
| `SUBSCRIPTION_PLAN_PRICE` | No | Plan price in IDR (default: 30000) |
| `SUBSCRIPTION_TRIAL_DAYS` | No | Trial period days (default: 14) |
| `REMINDER_JOB_ENABLED` | No | Enable billing reminder ticker |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | No | OTel collector gRPC endpoint |

Redis feature flags (all default `true`):

| Variable | Controls |
|---|---|
| `REDIS_FEATURE_RATE_LIMIT` | 100-token bucket per user, refills 2/sec (~120 req/min sustained) |
| `REDIS_FEATURE_CACHE` | Dashboard (90s) + laporan (2min) cache |
| `REDIS_FEATURE_SESSIONS` | JWT session_version revocation |
| `REDIS_FEATURE_QUEUE` | Asynq email job queue |
| `REDIS_FEATURE_PRESENCE` | Online presence heartbeat |

---

## Project Structure

```
apps/backend/
├── cmd/
│   ├── main.go           startup: env → Redis → OTel → DB → migrate → serve
│   └── worker/           Asynq worker process
├── internal/
│   ├── handler/          HTTP handlers (one file per domain)
│   ├── middleware/        Auth, rate limit, subscription guards, APIGate
│   ├── billing/          Midtrans checkout + webhook processing
│   ├── billingdomain/    Subscription domain types
│   ├── crypto/           AES-256 encrypt/decrypt + SHA-256 hash
│   ├── db/               MySQL connection pool setup
│   ├── farmcore/         Lahan, panen, perawatan, jadwal repositories
│   ├── farmfinance/      Pendapatan, harga repositories
│   ├── identity/         User, auth, profile repositories
│   ├── jobs/             Background job definitions (BillingReminderWorker)
│   ├── logger/           Structured logger setup
│   ├── mailer/           Resend email templates
│   ├── notification/     Redis-backed notification store
│   ├── observability/    OTel + metrics snapshot
│   ├── platform/         Health check, system info
│   ├── queue/            Asynq task definitions
│   ├── redis/            Redis client + feature flag config
│   ├── reporting/        Laporan keuangan aggregation
│   ├── subscription/     Subscription status + guards
│   ├── taskqueue/        Asynq server + handler wiring
│   ├── telemetry/        OTel tracer setup
│   └── validator/        Custom validation rules (DateRange, PositiveFloat, etc.)
├── migrations/           SQL migration files (golang-migrate)
├── docs/
│   └── env.example       (symlink to .env.example)
└── .env.example
```

---

## Testing

```bash
# All tests
go test ./...

# With race detector
go test -race ./...

# Specific package
go test ./internal/crypto/...

# Verbose
go test -v ./internal/handler/...
```

Tests are unit tests only. Integration tests (hitting real MySQL/Redis) are run via the CI `verify` job against the Railway staging environment.

---

## Middleware Chain

Requests pass through this chain in order:

```
RealIP → RequestID → Logger → Recoverer → OTelHTTP
    → CORS
    → RateLimit (Redis token bucket, 100 burst / 2 per sec refill per user)
    → APIGate (Redis kill-switch per endpoint)
    → AuthRequired (JWT verify + session_version check)
    → [RequireFullAccess | RequireFeature] (subscription guards)
    → Handler
```

---

## Key Design Notes

**PII encryption:** `email`, `phone`, `full_name` are stored AES-256-GCM encrypted in `_enc` columns. Lookup is done via `_hash` columns (SHA-256 deterministic). Never cache PII in Redis — any key matching `*email*`, `*phone*`, or `*password*` is forbidden.

**JWT revocation:** Each token carries a `jti` claim stored in Redis. Single-token logout deletes the JTI. Logout-all bumps `session_version:user:{id}` — any token with an older version is rejected.

**Subscription limits:** Trial users are capped at 2 harvests (enforced via `EnsureTrialUsageAllowed()`, a Redis counter) and 1 active farm (enforced via the `active_farm_limit` column default on `t_sawit_hub_users`, not a Redis counter). Pro access is enforced by `RequireFullAccess()` middleware on write operations and report endpoints.

**Database generated columns:** `berat_ton`, `berat_rata_janjang`, `total_pendapatan`, `hasil_bersih` in `t_sawit_hub_panen`; `pendapatan_bersih` in `t_sawit_hub_pendapatan` — never set these in INSERT/UPDATE, the DB computes them.

---

## CI

GitHub Actions workflow: `.github/workflows/backend.yml`

Two parallel jobs triggered on changes to `apps/backend/**`:
- `lint`: golangci-lint v1.64.8
- `verify`: `go test ./...` + `go build ./cmd/main.go`

---

## API Documentation

Full OpenAPI 3.0.3 spec: `docs/api/openapi.yaml` (root `docs/` directory)

Health endpoint: `GET /api/health` — returns Redis metrics, queue depths, and OTel status.
