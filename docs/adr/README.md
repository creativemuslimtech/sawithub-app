# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for SawitHub. Each ADR documents a significant technical decision: the context that forced the choice, the options considered, and the rationale for the final decision.

## Index

| ADR | Title | Status |
|---|---|---|
| [ADR-001](001-pii-encryption-strategy.md) | PII Encryption Strategy (AES-256 + SHA-256 hash columns) | Accepted |
| [ADR-002](002-jwt-session-management.md) | JWT Session Management with Redis Revocation | Accepted |
| [ADR-003](003-redis-for-background-jobs.md) | Asynq on Redis for Background Job Queue | Accepted |
| [ADR-004](004-subscription-middleware-guards.md) | Subscription Enforcement via Middleware Guards | Accepted |
| [ADR-005](005-separate-admin-backend.md) | Separate Admin Backend Service | Accepted |
| [ADR-006](006-mysql-generated-columns.md) | MySQL Generated Columns for Derived Financial Values | Accepted |
| [ADR-007](007-trunk-based-development.md) | Trunk-Based Development with Path-Filtered CI | Accepted |
| [ADR-008](008-tanstack-query-zustand.md) | TanStack Query + Zustand for Frontend State | Accepted |

## Format

Each ADR uses this structure:

```
# ADR-NNN: Title

**Status:** Accepted | Deprecated | Superseded by ADR-NNN

## Context
What situation forced this decision?

## Decision
What did we decide?

## Consequences
What are the trade-offs?
```

## Writing a New ADR

1. Copy the template from an existing ADR
2. Number sequentially (`009-...`)
3. Add an entry to the index above
4. Reference the ADR in the PR description that implements the decision
