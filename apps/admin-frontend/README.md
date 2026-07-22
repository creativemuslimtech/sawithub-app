# apps/admin-frontend — SawitHub Admin Panel

React 19 + TypeScript SPA for SawitHub platform operators and administrators. Deployed on Vercel. Also packages as a Capacitor Android app. Connects exclusively to `apps/admin-backend`.

**URL:** `http://localhost:5174` (dev) | `https://adminpanel.sawithub.com` (production)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form v7 + Zod v4 |
| Charts | Recharts v3 |
| Mobile | Capacitor v8 (Android) |
| Auth | reCAPTCHA v3 (`react-google-recaptcha-v3`) |
| Type generation | `openapi-typescript` from `admin-backend/openapi/` |
| HTTP client | Axios |
| Deploy | Vercel (web) + Capacitor (Android) |

---

## Local Setup

### 1. Install dependencies

From the monorepo root:

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Minimum for local development:

```env
# .env.local
VITE_API_BASE_URL=http://localhost:8001/api
VITE_APP_URL=http://localhost:5174
VITE_ENVIRONMENT=development
VITE_DEV_API_PROXY_TARGET=http://localhost:8001
```

The `VITE_DEV_API_PROXY_TARGET` tells the Vite proxy where to send `/api` requests.

### 3. Start dev server

Make sure `apps/admin-backend` is running on port 8001 first, then:

```bash
npm run dev --workspace=apps/admin-frontend
# or from monorepo root:
make dev-admin-frontend
```

App available at: http://localhost:5174

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Admin backend API URL (`/api` suffix required) |
| `VITE_APP_URL` | No | Canonical admin panel URL |
| `VITE_ENVIRONMENT` | No | `production` / `staging` / `development` |
| `VITE_DEV_API_PROXY_TARGET` | No | Vite proxy target (dev only) |

> `VITE_API_BASE_URL` must point to `admin-backend`, **not** the user backend. The `check:backend-target` script enforces this.

---

## Commands

```bash
# Development
npm run dev               # Vite dev server

# Type generation from OpenAPI spec
npm run gen:types         # generates src/api/types.generated.ts

# Validation
npm run check:backend-target       # verify vercel.json points to admin backend
npm run validate:analytics-events  # validate analytics event names

# Linting
npm run lint              # ESLint

# Tests
npm test                  # Vitest (unit)
npm run test:coverage     # coverage report
npm run test:e2e          # Playwright smoke test (admin login)

# Build
npm run build             # validate → typecheck → vite build
npm run preview           # preview production build
```

---

## Project Structure

```
apps/admin-frontend/
├── src/
│   ├── pages/            Route-level page components
│   │   ├── admin/        /admin/* routes (users, analytics, system, audit)
│   │   └── auth/         Login page
│   ├── components/       Shared admin UI components
│   ├── hooks/            Custom hooks (TanStack Query, admin auth)
│   ├── api/              Axios API client
│   │   └── types.generated.ts  (auto-generated from OpenAPI — do not edit)
│   └── lib/              Utility functions
├── tests/                Playwright E2E tests
├── scripts/              Build validation scripts
├── android/              Capacitor Android project
├── public/               Static assets (robots.txt blocks all crawling)
├── .env.example
├── vercel.json           Active Vercel config
└── CLAUDE.md             AI assistant routing rules
```

---

## Routing

| Path | Page |
|---|---|
| `/` | Redirects to `/admin` |
| `/login` | Admin login |
| `/admin` | Overview dashboard |
| `/admin/users` | User management |
| `/admin/data` | Platform data view |
| `/admin/analytics` | Analytics & trends |
| `/admin/monitoring` | System monitoring |
| `/admin/settings` | Admin settings |
| `/admin/audit` | Audit log |

Legacy redirect aliases (`/dashboard`, `/users`, `/data`, etc.) redirect to their `/admin/...` equivalents.

---

## Auth

Admin sessions use a separate JWT secret (`ADMIN_JWT_SECRET`) and a separate database (`sawit_hub_admin_db`). Tokens are stored in localStorage under:
- `sawit_admin_token`
- `sawit_admin_user`

User backend tokens are completely rejected by admin middleware.

---

## Type Generation

The admin frontend types are auto-generated from the admin backend's OpenAPI spec:

```bash
npm run gen:types
# Reads: ../../apps/admin-backend/openapi/openapi.yaml
# Writes: src/api/types.generated.ts
```

Run this after any changes to the admin backend API contract. The generated file is committed to the repository.

---

## Android (Capacitor)

The admin panel is packaged as an Android app via Capacitor v8. The `android/` directory is the native project.

```bash
# Sync web build to native
npx cap sync android

# Open in Android Studio
npx cap open android
```

The web app must be built first (`npm run build`) before syncing to Capacitor.

---

## Deployment

Same pattern as the user frontend but with different Vercel project and admin-backend target. The `check:backend-target` script verifies that `vercel.json` rewrites point to the admin backend, not the user backend.

`public/robots.txt` disallows all crawlers — the admin panel should never be indexed.
