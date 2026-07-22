# Contributing to SawitHub

This guide covers how to work in the SawitHub monorepo: branching, commits, CI, and the Definition of Done.

---

## Development Workflow

We use **trunk-based development** with short-lived feature branches off `main`.

```
main ← always deployable
  └── feat/lahan-bulk-import   (branch, PR, merge same day or within a few days)
  └── fix/panen-date-validation
  └── chore/upgrade-go-1.26
```

### Branch Naming

| Prefix | Use |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `chore/` | Tooling, deps, CI, config |
| `docs/` | Documentation only |
| `refactor/` | Code changes with no behavior change |
| `test/` | Adding or updating tests only |

Keep branch names lowercase and hyphen-separated. No ticket numbers in branch names unless it aids traceability.

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`

Scopes: `backend`, `admin-backend`, `frontend`, `admin-frontend`, `shared`, `db`, `ci`

Examples:

```
feat(backend): add trial usage check to panen create handler
fix(frontend): correct date serialization in laporan filter
chore(ci): pin golangci-lint to v1.64.8
docs(adr): record decision to use Asynq for email queue
```

- Present tense, imperative mood: "add" not "added" / "adds"
- First line ≤ 72 characters
- No trailing period

---

## Pull Requests

1. **Rebase on main** before opening a PR — no merge commits in the PR branch
2. **Self-review your diff** before requesting review
3. **Link related ADR** in the PR description if you're making an architectural decision
4. **Pass CI** — all checks must be green before merge
5. **One reviewer** required for backend changes; frontend PRs can be merged after CI passes if low-risk

PR title follows the same Conventional Commits format as the commit message.

---

## CI Checks

Four GitHub Actions workflows run on path-filtered pushes:

| Workflow | Trigger paths | Jobs |
|---|---|---|
| `backend.yml` | `apps/backend/**`, `go.work` | lint (golangci-lint), verify (test + build) |
| `admin-backend.yml` | `apps/admin-backend/**`, `go.work` | lint, verify |
| `frontend.yml` | `apps/frontend/**`, `packages/shared/**` | check (lint + tsc + vitest), build (vite), e2e (playwright) |
| `admin-frontend.yml` | `apps/admin-frontend/**`, `packages/shared/**` | check, build |

All checks must pass. Do not use `--no-verify` or skip lint.

---

## Definition of Done

A story/task is done when all of the following are true:

### Code
- [ ] Feature implemented and matches acceptance criteria
- [ ] No `TODO`, `FIXME`, or `console.log` left in production code paths
- [ ] No dead code introduced
- [ ] All new env vars documented in `.env.example`

### Tests
- [ ] Unit tests written for non-trivial logic
- [ ] E2E test added or updated if user flow changed
- [ ] All existing tests pass (`go test ./...` and `npm test`)
- [ ] No tests skipped without a written reason

### Security
- [ ] No PII cached in Redis (no keys matching `*email*`, `*phone*`, `*password*`)
- [ ] SQL queries use parameterized statements
- [ ] New endpoints protected by appropriate middleware (auth, rate limit, subscription guard)
- [ ] No secrets committed (env vars only)

### Backend
- [ ] Handler follows existing error response format `{"error": "..."}`
- [ ] DB migrations applied via `packages/database/` SQL files — no schema changes in application code
- [ ] Generated columns not set in INSERT/UPDATE
- [ ] Subscription guard added where required (`RequireFullAccess` or `RequireFeature`)

### Frontend
- [ ] `check:backend-target` passes (vercel.json points to correct backend)
- [ ] TypeScript compiles with no errors (`npm run typecheck`)
- [ ] New forms use React Hook Form + Zod schema
- [ ] API calls go through the shared Axios client

### Docs
- [ ] OpenAPI spec updated if any endpoint changed signature (`docs/api/openapi.yaml`)
- [ ] ADR created if an architectural decision was made (`docs/adr/`)
- [ ] Service README updated if setup steps changed

### CI
- [ ] All CI checks green (lint + test + build)
- [ ] PR reviewed and approved

---

## Database Migrations

Migrations live in `packages/database/` (shared) and `apps/backend/migrations/` (backend-specific). Managed by [golang-migrate](https://github.com/golang-migrate/migrate).

Rules:
- **Always write a paired `.down.sql`** for every `.up.sql`
- Migration files are immutable once merged to main — never edit a deployed migration
- To change a schema, add a new migration file
- Test `down.sql` locally before opening a PR: `migrate -database ... down 1`
- Avoid locking migrations on large tables — use `ALTER TABLE ... ALGORITHM=INPLACE` or a background copy strategy

Migration file naming: `{sequential_number}_{short_description}.up.sql`

---

## Adding a New API Endpoint

1. Add handler function to the appropriate file in `internal/handler/`
2. Register route in `cmd/main.go` router setup
3. Add middleware if required (`RequireFullAccess`, `RequireFeature`, or subscription guard)
4. Add input validation via the `validator` package — use existing validators before writing new ones
5. Update `docs/api/openapi.yaml` with the new path, request/response schemas
6. Write a unit test for the handler
7. If it introduces a new subscription gate, document the HTTP 402 condition

---

## Adding a New Frontend Route

1. Create the page component in `src/pages/`
2. Register the route in `src/App.tsx`
3. Wrap with auth guard if protected
4. Add query using TanStack Query — avoid direct `useEffect` + fetch
5. Form validation via React Hook Form + Zod schema (import from `@sawithub/shared` if schema is shared)
6. Run `npm run typecheck` — fix all errors before opening PR

---

## Environment Variables

- **Never commit `.env` files** — only `.env.example` is committed
- **Document every new variable** in `.env.example` with a comment explaining its purpose
- **Mirror subscription constants** between frontend (`VITE_SUBSCRIPTION_TRIAL_DAYS`) and backend (`SUBSCRIPTION_TRIAL_DAYS`) — they must match
- Production secrets are set in Railway (backends) and Vercel (frontends) — not in the repository

---

## Package Decisions

- **Add a dependency only when necessary** — evaluate bundle size impact for frontend packages
- **Go deps**: run `go mod tidy` after adding/removing, commit updated `go.sum`
- **npm deps**: prefer packages already in use over introducing new ones for overlapping functionality
- Before adding a new npm package, check if `@sawithub/shared`, TanStack Query, Zustand, RHF+Zod, or Recharts already covers the need

---

## Questions?

Open an issue or start a discussion in the repository. For security vulnerabilities, contact the maintainers directly — do not open a public issue.
