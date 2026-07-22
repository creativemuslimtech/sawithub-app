# SawitHub

SawitHub is a palm oil farm management SaaS for Indonesian smallholder farmers. It provides harvest tracking, maintenance scheduling, financial reporting, and subscription billing — all in one mobile-friendly app.

**12,400+ active users · 18 provinces · Rp 30,000/month**

---

## Monorepo Structure

```
sawithub-app/
├── apps/
│   ├── backend/            Go API — user-facing (port 8000)
│   ├── admin-backend/      Go API — admin panel (port 8001)
│   ├── frontend/           React SPA — farmer app (Vercel)
│   └── admin-frontend/     React SPA — admin panel (Vercel + Capacitor Android)
├── packages/
│   ├── shared/             TypeScript types + Zod schemas (@sawithub/shared)
│   ├── database/           Shared SQL schema (plain .sql files, lexical order via sql-apply.yml)
│   └── redis-config/       Shared Redis configuration
├── docs/                   Architecture, API, agile, research docs
├── go.work                 Go workspace (backend + admin-backend)
└── package.json            npm workspace root (frontend + admin-frontend + shared)
```

## Services

| Service | Language | Port | Database | Deploy |
|---|---|---|---|---|
| `apps/backend` | Go 1.25 + chi | 8000 | MySQL `sawit_hub_db` | Railway |
| `apps/admin-backend` | Go 1.25 + chi | 8001 | MySQL `sawit_hub_db` + `sawit_hub_admin_db` | Railway |
| `apps/frontend` | React 19 + Vite | 5173 | — | Vercel |
| `apps/admin-frontend` | React 19 + Vite | 5174 | — | Vercel |

---

## Quick Start

### Prerequisites

- **Go 1.25+** — [install](https://go.dev/dl/)
- **Node.js 20+** with npm
- **MySQL 8.0+** — running locally or via Docker
- **Redis 7+** — running locally or via Docker

### 1. Clone and install

```bash
git clone https://github.com/your-org/sawithub-app.git
cd sawithub-app
npm install          # install all frontend workspaces
```

### 2. Set up databases

```bash
# Start MySQL and Redis (example with Docker)
docker run -d --name sawit-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=sawit_hub_db \
  -p 3306:3306 mysql:8.0

docker run -d --name sawit-redis \
  -p 6379:6379 redis:7

# Create the admin database
docker exec sawit-mysql mysql -uroot -proot -e "CREATE DATABASE sawit_hub_admin_db;"
```

### 3. Configure environment variables

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env — set DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY, REDIS_ADDR

# Admin backend
cp apps/admin-backend/.env.example apps/admin-backend/.env
# Edit apps/admin-backend/.env — set all DB URLs, ADMIN_JWT_SECRET, ENCRYPTION_KEY, REDIS_ADDR

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
# Leave VITE_API_BASE_URL unset — Vite proxies /api to localhost:8000

# Admin frontend
cp apps/admin-frontend/.env.example apps/admin-frontend/.env.local
# Set VITE_DEV_API_PROXY_TARGET=http://localhost:8001
```

### 4. Run migrations

Migrations run automatically on backend startup. To run manually:

```bash
cd apps/backend
go run ./cmd/main.go   # runs migrations then starts server
```

### 5. Start all services

```bash
# Terminal 1 — user backend
make dev-backend

# Terminal 2 — admin backend
make dev-admin-backend

# Terminal 3 — user frontend
make dev-frontend

# Terminal 4 — admin frontend
make dev-admin-frontend
```

| App | URL |
|---|---|
| Farmer app | http://localhost:5173 |
| Admin panel | http://localhost:5174 |
| User API | http://localhost:8000 |
| Admin API | http://localhost:8001 |

---

## Development Commands

```bash
# Go
make dev-backend           # run user backend
make dev-admin-backend     # run admin backend
make test-go               # go test ./... in both services
make vet-go                # go vet ./...
make tidy-go               # go mod tidy

# TypeScript
make dev-frontend          # vite dev server (user app)
make dev-admin-frontend    # vite dev server (admin app)
make build-all             # build all npm workspaces

# npm workspaces
npm run lint               # eslint all workspaces
npm run typecheck          # tsc all workspaces

# Frontend tests
cd apps/frontend
npm test                   # vitest (unit)
npm run test:e2e           # playwright E2E (Chromium)
npm run test:coverage      # coverage report
```

---

## Documentation

| Doc | Path |
|---|---|
| System Architecture | `docs/architecture/system-architecture.md` |
| SDLC & CI/CD | `docs/sdlc/sdlc.md` |
| Product Backlog | `docs/agile/product-backlog.md` |
| Scrum Setup | `docs/agile/scrum-setup.md` |
| OpenAPI Spec | `docs/api/openapi.yaml` |
| Postman Collection | `docs/api/postman-collection.json` |
| Market Research | `docs/research/market-research.md` |
| ADRs | `docs/adr/` |
| Contributing | `CONTRIBUTING.md` |

---

## Architecture Overview

```
Browser / Mobile (PWA)
        │
  ┌─────▼─────┐      ┌───────────────┐
  │  frontend  │      │ admin-frontend │
  │  (Vercel)  │      │   (Vercel)    │
  └─────┬─────┘      └───────┬───────┘
        │ /api                │ /api
  ┌─────▼─────┐      ┌───────▼───────┐
  │  backend  │      │ admin-backend  │
  │  :8000    │      │    :8001      │
  └─────┬─────┘      └───────┬───────┘
        │                    │
  ┌─────▼────────────────────▼───────┐
  │         MySQL + Redis             │
  │  sawit_hub_db  sawit_hub_admin_db │
  └───────────────────────────────────┘
```

Key technical decisions:
- **PII encryption**: `email`, `phone`, `full_name` stored AES-256 encrypted; SHA-256 hash columns for DB lookup
- **JWT sessions**: HMAC-SHA256, per-token JTI revocation, Redis session_version for bulk logout
- **Subscription guards**: `RequireFullAccess()` and `RequireFeature(f)` middleware → HTTP 402
- **Background jobs**: Asynq queues on Redis — `email:welcome`, `email:reset_code`, `email:report`
- **Admin kill-switch**: APIGate middleware reads per-endpoint enabled state from Redis

See `docs/adr/` for full rationale behind each decision.

---

## Environment Variables

Each service documents its variables in `.env.example`:

- `apps/backend/.env.example` — user backend
- `apps/admin-backend/.env.example` — admin backend
- `apps/frontend/.env.example` — user frontend
- `apps/admin-frontend/.env.example` — admin frontend

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
