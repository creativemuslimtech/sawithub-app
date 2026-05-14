# SawitHub Tech Stack Roadmap

Track implementation progress of planned infrastructure and tooling improvements.

**Legend:** `[ ]` Not started · `[~]` In progress · `[x]` Done

---

## Do First

| # | Suggestion | Effort | Impact | Status | Notes |
|---|-----------|--------|--------|--------|-------|
| 4 | Sentry error tracking | Low | High | `[x]` | `github.com/getsentry/sentry-go` + `sentry-go/http` middleware |
| 2 | API docs (Scalar) | Low | Medium | `[ ]` | Mount at `/docs`, serve from existing OpenAPI spec in `openapi/` |
| 7 | Asynq job queue | Medium | High | `[ ]` | Replace hand-rolled Redis queue in `internal/queue/` and `cmd/worker/` |
| 10 | golang-migrate | Medium | High | `[ ]` | Replace `ENABLE_RUNTIME_SCHEMA_SYNC`, migrations live in `database-sawithub` |

---

## Next Sprint

| # | Suggestion | Effort | Impact | Status | Notes |
|---|-----------|--------|--------|--------|-------|
| 3 | OpenTelemetry tracing | Medium | High | `[ ]` | Instrument Go app, export to Uptrace or Jaeger |
| 5 | Log aggregation (Axiom) | Low | High | `[ ]` | Ship Railway stdout logs to Axiom (free tier) |
| 8 | FCM push notifications | Medium | High | `[ ]` | `firebase-admin-go`, add push channel to `NotificationDeliveryService` |
| 9 | SSE real-time updates | Low | Medium | `[ ]` | `GET /api/stream/events` using `http.Flusher`, no polling needed |
| 6 | Prometheus + Grafana | Medium | Medium | `[x]` | `/metrics` endpoint + Grafana Alloy on Railway → Grafana Cloud |

---

## Future

| # | Suggestion | Effort | Impact | Status | Notes |
|---|-----------|--------|--------|--------|-------|
| 1 | API Gateway (Kong) | High | High | `[ ]` | Central API management, consumer keys, route-level pause |
| 11 | Feature flags (Unleash) | Medium | Medium | `[ ]` | Self-hosted on Railway, runtime toggles without redeploy |
| 12 | Meilisearch | Medium | Medium | `[ ]` | Full-text search across harvests, maintenance, income records |
| 14 | Cloudflare R2 | Low | Medium | `[ ]` | Farm photos, PDF report exports, presigned upload URLs |
| 13 | Svix webhooks | Medium | Medium | `[ ]` | Outbound webhooks for B2B/enterprise consumers |
| 15 | gRPC internal API | High | Medium | `[ ]` | Type-safe internal comms between `backend-sawithub` ↔ `admin-backend-sawithub` |

---

## Completed

| # | Suggestion | Completed | Notes |
|---|-----------|-----------|-------|
| 4 | Sentry error tracking | 2026-05-15 | `sentry-go` + `sentryhttp` middleware, user context in auth, DLQ capture in email worker |

---

_Last updated: 2026-05-15_
