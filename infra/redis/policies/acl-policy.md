# ACL Policy

## Service Roles

- `backend-api`
  - Read/write: `auth:*`, `ratelimit:*`, `cache:*`, `presence:*`
  - Queue publish only: `queue:jobs:*`
- `backend-worker`
  - Read/write: `queue:*`
  - Read-only: `auth:*` (jika dibutuhkan untuk job auth-sensitive)
- `ops-maintainer`
  - Operational commands terbatas untuk observability dan cleanup terkontrol.

## Command Guidance

Allowed command families (runtime):

- `GET`, `SET`, `DEL`, `EXPIRE`, `TTL`
- `HGET`, `HSET`, `HDEL`, `HGETALL`
- `INCR`, `DECR`
- `LPUSH`, `RPOP`, `BRPOP`, `LREM`
- `ZADD`, `ZREM`, `ZRANGE`
- `EVALSHA` (untuk limiter script versioned)

Avoid in app runtime:

- `FLUSHALL`, `FLUSHDB`, `KEYS`, `CONFIG SET`, `DEBUG`, `MODULE`

## Access Rules

- Credential per service, tidak share password antar service.
- Rotate credential berkala atau setelah incident.
- Gunakan secret manager platform, jangan commit credential ke git.
