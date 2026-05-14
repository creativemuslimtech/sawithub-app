## Summary

- Jelaskan perubahan policy/config Redis yang diajukan.

## Scope

- [ ] Keyspace policy
- [ ] TTL matrix
- [ ] ACL/access policy
- [ ] Ops runbook
- [ ] Integration contract

## Security Checklist

- [ ] Tidak ada secret/token/password hardcoded.
- [ ] Tidak ada raw PII baru disimpan di Redis.
- [ ] Semua key transient punya TTL.
- [ ] Tidak ada command berisiko tinggi ditambahkan ke runtime path.

## Operational Checklist

- [ ] Dampak terhadap rollback dijelaskan.
- [ ] Dampak terhadap observability dijelaskan.
- [ ] Migration/breaking change dijelaskan (jika ada).

## Test/Evidence

- [ ] `bash scripts/validate-config.sh`
- [ ] `bash scripts/check-redis-health.sh` (jika environment tersedia)
