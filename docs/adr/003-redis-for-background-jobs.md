# ADR-003: Asynq on Redis for Background Job Queue

**Status:** Accepted

## Context

SawitHub needs to send transactional emails asynchronously:
- Welcome email on registration (`email:welcome`)
- Password reset code (`email:reset_code`)
- Monthly financial report PDF (`email:report`)

Sending email synchronously in the HTTP handler would:
- Block the response until Resend API responds (adds 200–500ms latency)
- Fail the entire request if Resend is temporarily unavailable
- Provide no retry mechanism for failed deliveries

Options considered:

| Option | Tradeoffs |
|---|---|
| Synchronous HTTP call in handler | Simple but fragile; couples request latency to email delivery |
| Database-backed job table + polling worker | No new infrastructure; polling adds DB load; delay between poll intervals |
| Dedicated message queue (RabbitMQ, SQS, etc.) | Reliable; adds operational complexity; another service to manage |
| Asynq on Redis | Redis already required; built-in retry, DLQ, visibility into queue state; no new infrastructure |

## Decision

Use [Asynq](https://github.com/hibiken/asynq) as the background job system, backed by the same Redis instance already used for rate limiting, caching, and session management.

**Queue names:**
- `email:welcome` — registration confirmation
- `email:reset_code` — password reset OTP
- `email:report` — PDF report delivery

**Worker process:** A separate binary at `apps/backend/cmd/worker/` runs the Asynq server. In Railway deployment, this runs as a separate process alongside the main HTTP server.

**Feature flag:** `REDIS_FEATURE_QUEUE=true/false` — when disabled, jobs fall back to synchronous execution or are skipped (graceful degradation).

**Queue visibility:** The health endpoint at `GET /api/health` returns `redis_queue` metrics: active job count, DLQ depth per queue name. This gives on-call engineers visibility without needing a separate Asynq dashboard.

## Consequences

**Benefits:**
- Email delivery failures don't fail the HTTP response — users see success immediately
- Asynq provides automatic retry with exponential backoff
- Dead-letter queue (DLQ) captures permanently-failed jobs for investigation
- No new infrastructure — Redis is already deployed and managed on Railway
- Queue depth is visible via the health endpoint

**Trade-offs:**
- If Redis is unavailable, job enqueue fails — email won't be sent. This is acceptable because the HTTP response already succeeded and the user can retry the operation
- Worker process must be deployed and kept running separately — Railway handles this, but adds a second process to monitor
- Asynq's Redis key patterns (`asynq:*`) must be excluded from the TTL eviction policies targeting `sawithub:*` prefixed keys — Redis eviction policy is `allkeys-lru` in production, which could evict queued jobs under memory pressure. This is mitigated by Railway's managed Redis having sufficient memory for the workload
