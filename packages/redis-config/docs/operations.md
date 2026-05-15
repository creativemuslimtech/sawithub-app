# Operations Runbook

## Daily Operations

- Jalankan health check:
  - `bash scripts/check-redis-health.sh`
- Pantau:
  - connection errors,
  - timeout rate,
  - queue depth,
  - cache hit ratio.

## Backup and Restore Drill

Karena Redis managed di Railway, backup strategy mengikuti platform snapshot.

Checklist drill bulanan:

1. Catat baseline metrics sebelum drill.
2. Trigger snapshot/backup dari Railway.
3. Simulasikan restore ke environment staging.
4. Jalankan smoke test:
   - auth revoke checks,
   - queue enqueue/dequeue,
   - dashboard cache fill.
5. Catat hasil dan update issue retrospective.

## Incident Playbooks

### A. Redis Partial Outage

1. Aktifkan mode degrade (feature flags di backend).
2. Verifikasi service tetap melayani traffic critical.
3. Monitor latency dan error rate.
4. Recover normal mode setelah health stabil.

### B. Credential Compromise Suspected

1. Rotate Redis password segera.
2. Redeploy service yang menggunakan secret.
3. Revoke credential lama.
4. Audit access logs dan timeline insiden.

### C. Keyspace Pollution / Memory Spike

1. Identifikasi namespace penyebab.
2. Purge selective keyspace (jangan `FLUSHALL`).
3. Perbaiki TTL policy jika ditemukan key tanpa expiry.
4. Jalankan postmortem.

## Emergency Commands (Ops-only)

- Selective purge pattern by namespace.
- Global session invalidate by version bump key.
- Dead-letter queue replay with bounded batch size.
