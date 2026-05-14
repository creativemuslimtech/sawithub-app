# Integration Contract: backend-sawithub

## Contract Version

- `redis_contract_version: v1`
- Breaking change policy: bump major and release migration notes.

## Key Conventions

Prefix wajib: `sawithub:prod`

- Rate limit:
  - `sawithub:prod:ratelimit:user:{userID}:{route}:{window}`
  - `sawithub:prod:ratelimit:ip:{ip}:{route}:{window}`
- Auth/session:
  - `sawithub:prod:auth:revoke:jti:{jti}`
  - `sawithub:prod:auth:session_version:user:{userID}`
- Cache:
  - `sawithub:prod:cache:dashboard:user:{userID}`
  - `sawithub:prod:cache:laporan_keuangan:user:{userID}:period:{p}:month:{m}:year:{y}:lahan:{id}`
  - `sawithub:prod:cache:admin:overview`
- Queue:
  - `sawithub:prod:queue:jobs:email_export`
  - `sawithub:prod:queue:jobs:mailer`
  - `sawithub:prod:queue:dead_letter`
- Presence:
  - `sawithub:prod:presence:online:user:{userID}`
  - `sawithub:prod:presence:last_seen:user:{userID}`

## TTL Contract

- Rate limit windows: 60s default.
- Dashboard cache: 30s.
- Laporan keuangan cache: 60s.
- Admin aggregate cache: 120s.
- Revoke token key: until token expiry + safety buffer.
- Presence online key: 90s heartbeat.

## Invalidation Rules

Invalidate cache pada mutation sukses:

- `lahan`, `panen`, `pendapatan`, `perawatan`, `jadwal_perawatan` write
  - invalidate dashboard + laporan related keys.
- Admin user/status changes
  - invalidate admin aggregate keys.

## Failure Behavior

- Redis unavailable:
  - read cache fallback ke MySQL query langsung.
  - limiter fallback ke in-memory conservative mode.
  - queue producer bisa fallback ke sync mode hanya untuk operasi kritikal.

## Compatibility Checklist

- [ ] Tidak ubah format key existing tanpa migration plan.
- [ ] Tidak ubah TTL major tanpa impact review.
- [ ] Semua perubahan key schema disertai rollback strategy.
