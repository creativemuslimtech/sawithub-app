# apps/frontend — SawitHub Farmer App

React 19 + TypeScript SPA for Indonesian palm oil smallholder farmers. Progressive Web App (PWA) deployed on Vercel. Proxies API calls to `apps/backend`.

**URL:** `http://localhost:5173` (dev) | `https://www.sawithub.com` (production)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| Global state | Zustand v5 |
| Forms | React Hook Form v7 + Zod v4 |
| Charts | Recharts v3 |
| Icons | Lucide React |
| Testing (unit) | Vitest + Testing Library |
| Testing (E2E) | Playwright (Chromium) |
| HTTP client | Axios |
| Notifications | react-hot-toast |
| Deploy | Vercel (PWA) |

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

For local development, leave `VITE_API_BASE_URL` unset. Vite automatically proxies `/api` to `http://localhost:8000`.

```env
# .env.local — minimum for local dev
VITE_APP_URL=http://localhost:5173
VITE_ENVIRONMENT=development
VITE_SUBSCRIPTION_TRIAL_DAYS=14
VITE_SUBSCRIPTION_PLAN_PRICE_IDR=30000
```

### 3. Start dev server

Make sure `apps/backend` is running on port 8000 first, then:

```bash
npm run dev --workspace=apps/frontend
# or from monorepo root:
make dev-frontend
```

App available at: http://localhost:5173

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Explicit backend URL. If unset, uses `/api` (Vite proxy in dev, Vercel rewrite in prod) |
| `VITE_APP_URL` | No | Canonical site URL for OG tags |
| `VITE_ADMIN_APP_URL` | No | Admin panel URL — shows admin nav link for users with `role=admin` |
| `VITE_PUBLIC_ASSET_BASE_URL` | No | S3 bucket base URL for public images |
| `VITE_ENVIRONMENT` | No | `production` / `staging` / `development` |
| `VITE_SUBSCRIPTION_TRIAL_DAYS` | No | Trial period days (default: `14`) — must match backend |
| `VITE_SUBSCRIPTION_PLAN_PRICE_IDR` | No | Plan price (default: `30000`) — must match backend |
| `VITE_ALLOW_MOCK_BILLING` | No | `true` only for E2E tests — never set in production |

---

## Commands

```bash
# Development
npm run dev               # Vite dev server with HMR

# Type checking
npm run typecheck         # tsc -b (no emit)

# Linting
npm run lint              # ESLint

# Unit tests
npm test                  # Vitest (watch mode)
npm run test:coverage     # Coverage report (v8)

# E2E tests (requires running backend + frontend)
npm run test:e2e          # Playwright — subscription, export, logout tests
npm run test:visual       # Visual smoke test
npm run test:a11y         # Accessibility (axe-core)

# Build
npm run build             # typecheck → validate → vite build
npm run preview           # Preview production build locally

# Validation guards (run automatically in build)
npm run check:backend-target    # Ensure vercel.json rewrites correct backend
npm run validate:analytics-events  # Validate analytics event names
npm run check:public-pages      # Ensure public routes are correct
npm run check:icons             # Validate icon imports
```

---

## Project Structure

```
apps/frontend/
├── src/
│   ├── pages/            Route-level page components
│   ├── components/       Shared UI components
│   ├── hooks/            Custom hooks (TanStack Query, auth, subscription)
│   ├── stores/           Zustand global state stores
│   ├── api/              Axios API client + query functions
│   ├── copy/             Product constants (pricing, trial days)
│   ├── types/            Local TypeScript types
│   └── lib/              Utility functions
├── tests/                Playwright E2E tests
├── scripts/              Build validation scripts
├── public/               Static assets (icons, manifest.json)
├── .env.example
├── vercel.json           Active Vercel config (do not edit manually)
├── vercel.staging.json   Staging Vercel rewrite config
└── vercel.production.json Production Vercel rewrite config
```

---

## Vercel Deployment

The Vite proxy only works in local dev. In production and staging, Vercel rewrites `/api/*` to the Railway backend.

**Never edit `vercel.json` directly.** Use the config-swap script:

```bash
# Switch to staging config before merging to staging branch
./scripts/use-vercel-config.sh staging

# Switch to production config before merging to main
./scripts/use-vercel-config.sh production
```

The `check:backend-target` guard (runs in `npm run build`) will fail if `vercel.json` points to the wrong backend. This prevents accidentally deploying staging rewrites to production.

---

## Testing Guide

### Unit tests (Vitest)

Tests live alongside the code in `*.test.ts` / `*.test.tsx` files. Testing Library is used for component tests.

```bash
npm test                 # watch mode
npm run test:coverage    # coverage summary
```

### E2E tests (Playwright)

E2E tests require the backend running with `VITE_ALLOW_MOCK_BILLING=true`:

```bash
# In apps/frontend/.env.local:
VITE_ALLOW_MOCK_BILLING=true

npm run test:e2e
```

Key E2E test files:
- `tests/subscription-mock-flow.spec.ts` — billing checkout + subscription state
- `tests/export-xlsx-headers.spec.ts` — Excel export column validation
- `tests/logout-clears-session.spec.ts` — session invalidation after logout

---

## Subscription UI

The app enforces subscription limits client-side (backed by server 402 responses):
- **Trial**: 14 days, 1 farm, 2 harvests max
- **Pro**: Rp 30,000/month via Midtrans Snap

The `SubscriptionView` from `/api/subscription/status` drives all paywall UI. `access_mode` values: `trial`, `pro`, `expired`.
