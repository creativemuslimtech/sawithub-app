# ADR-007: Trunk-Based Development with Path-Filtered CI

**Status:** Accepted

## Context

SawitHub is a small team with four deployable services in a monorepo. We need a branching strategy that:
- Keeps `main` always deployable
- Avoids long-lived branch divergence
- Runs CI efficiently — changing the frontend shouldn't rebuild Go services

Options considered:

| Strategy | Tradeoffs |
|---|---|
| GitFlow (main + develop + release branches) | Heavy; long-lived branches cause merge conflicts; overhead for a small team |
| Feature branches + GitHub Flow (PR to main) | Simple; `main` stays deployable; works well with short-lived feature branches |
| Trunk-based development | Strictest form of GitHub Flow; enforces small, frequent commits |
| Monorepo with separate service branches | Independent service deploys; hard to coordinate cross-service changes |

## Decision

Trunk-based development: **all changes merge directly to `main` via short-lived feature branches (same-day or 1–3 day branches)**. No develop branch, no release branches.

**Path-filtered CI:** GitHub Actions workflows use `paths:` filters so each service's workflow only runs when that service's files change:

```yaml
# .github/workflows/backend.yml
on:
  push:
    paths:
      - 'apps/backend/**'
      - 'go.work'
      - 'go.work.sum'
```

This means:
- A CSS change in `apps/frontend/` does not trigger Go CI
- A migration in `packages/database/` triggers both Go services
- CI time is proportional to what changed, not the total monorepo size

**Railway auto-deploy:** Both Go services are configured to auto-deploy from `main` on Railway with `railway.toml` specifying the build command and watch path per service.

**Vercel auto-deploy:** Both frontend apps auto-deploy from `main` via Vercel's GitHub integration.

## Consequences

**Benefits:**
- `main` is always in a deployable state — no "integration branch" where things break before reaching main
- Short-lived branches minimize merge conflicts
- Path-filtered CI keeps build times fast — frontend changes don't wait for Go compilation
- Simple mental model: branch off main, PR to main, done

**Trade-offs:**
- Requires discipline to keep branches short-lived (1–3 days max) — long-lived branches defeat the purpose
- Feature flags are necessary for work-in-progress features that span multiple PRs — we don't have a feature flag system yet (tracked as a backlog item)
- Emergency hotfixes follow the same process (branch → PR → merge to main) — there is no separate release branch to patch, which is simpler but means all in-flight feature work on main is also deployed
