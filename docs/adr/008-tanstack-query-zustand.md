# ADR-008: TanStack Query + Zustand for Frontend State Management

**Status:** Accepted

## Context

The SawitHub farmer app is a data-heavy SPA: dashboard metrics, harvest records, maintenance logs, financial reports. State management must handle:
- Server state (API data): loading, error, caching, background refresh, invalidation after mutations
- Client/UI state: active farm selection, auth user object, subscription status, modal state

Options considered:

| Approach | Tradeoffs |
|---|---|
| Redux Toolkit | Mature; verbose boilerplate; good for complex client state but overkill for server state |
| React Context + useReducer | Zero deps; fine for simple cases; becomes complex with multiple async data sources |
| SWR | Lightweight; cache-focused; fewer features than TanStack Query for complex mutation patterns |
| TanStack Query v5 + Zustand | Query for server state; Zustand for UI state; clear separation of concerns |
| Jotai | Atomic model; minimal boilerplate; less ecosystem adoption than Zustand at time of decision |

## Decision

**TanStack Query v5** for all server state (API data):
- Automatic caching with configurable `staleTime` / `gcTime`
- `useQuery` for reads, `useMutation` for writes
- Automatic cache invalidation via `queryClient.invalidateQueries()`
- Background refetch, retry logic, loading/error states built-in
- DevTools available in development (`@tanstack/react-query-devtools`)

**Zustand v5** for all client/UI state:
- Active farm selection (`current_active_farm_id`)
- Authenticated user object (from JWT decode or `/api/profile`)
- Subscription view (cached client-side between navigations)
- Modal/drawer open state

**React Hook Form v7 + Zod v4** for form state:
- Form state is inherently local — not in TanStack Query or Zustand
- Zod schemas from `@sawithub/shared` are reused between frontend validation and display
- `@hookform/resolvers` bridges RHF and Zod

**Why not put server state in Zustand?** Zustand requires manual loading/error state tracking and cache invalidation logic. TanStack Query handles this automatically. Mixing both leads to double-state bugs (Zustand store out of sync with TanStack Query cache).

## Consequences

**Benefits:**
- Clear ownership: TanStack Query owns all data that comes from the server; Zustand owns UI state that exists independent of server round-trips
- Mutations automatically invalidate relevant queries — dashboard refreshes after a new harvest is recorded without manual state updates
- TanStack Query's `staleTime` configuration aligns with backend cache TTLs (e.g., dashboard data stale after 30s matches the Redis cache TTL)
- Zustand's minimal API means no action creators, reducers, or sagas — simple direct state updates

**Trade-offs:**
- Two state libraries to learn instead of one — new developers must understand when to use which
- TanStack Query v5 introduced breaking changes from v4 (different `useQuery` signature, `onSuccess`/`onError` callbacks removed) — the codebase is on v5; any documentation or blog post using v4 patterns will be misleading
- Zustand stores are module-level singletons — difficult to reset between Vitest test cases. Each test that mutates a Zustand store must explicitly reset it: `useStore.setState(initialState)`
- `@sawithub/shared` Zod schemas must be kept in sync when the backend adds validation — currently a manual process
