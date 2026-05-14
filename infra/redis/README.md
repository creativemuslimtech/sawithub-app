# redis-sawithub

Repository ini adalah single source of truth untuk standar Redis di SawitHub, dengan target utama Railway Managed Redis.

## Scope

- Security baseline (TLS, keyspace isolation, secret rotation, command policy).
- Operational runbook (health check, backup/restore drill, incident response).
- Integration contract untuk `backend-sawithub`.
- Policy-as-code ringan untuk keyspace dan TTL matrix.

## Repository Layout

- `.env.example` - template variabel environment Redis.
- `docs/architecture.md` - arsitektur dan data flow Redis.
- `docs/security.md` - kebijakan keamanan Redis.
- `docs/operations.md` - runbook operasional dan insiden.
- `docs/integration/backend-sawithub.md` - kontrak integrasi backend.
- `policies/keyspace.yml` - namespace key dan aturan ownership.
- `policies/ttl-matrix.yml` - TTL per domain key.
- `policies/acl-policy.md` - model akses service account.
- `scripts/validate-config.sh` - validasi policy dokumen.
- `scripts/check-redis-health.sh` - pemeriksaan health Redis endpoint.

## Quickstart

1. Copy variabel:
   - `cp .env.example .env`
2. Isi endpoint Redis Railway dan secret di `.env`.
3. Validasi policy dan env:
   - `bash scripts/validate-config.sh`
4. Cek health endpoint Redis:
   - `bash scripts/check-redis-health.sh`

## Railway Managed Redis Notes

- Redis server tidak dijalankan dari repo ini.
- Repo ini memegang standar konfigurasi, keamanan, dan proses operasional.
- Credential disimpan di secret manager platform (Railway/GitHub Actions), bukan di git.

## GitOps Sync to Railway Backend

Repo ini menyediakan workflow manual:
- `.github/workflows/sync-backend-railway.yml`

Fungsi workflow:
1. Validasi policy/config (`scripts/validate-config.sh`)
2. Sinkronisasi variabel Redis ke service `backend-sawithub` di Railway
3. Trigger redeploy backend dari source yang sudah terkoneksi GitHub

Secrets GitHub yang wajib (repo `redis-sawithub`):
- `RAILWAY_TOKEN`
- `RAILWAY_PROJECT_ID`
- `RAILWAY_ENVIRONMENT_NAME` (contoh: `production`)
- `RAILWAY_BACKEND_SERVICE_NAME` (contoh: `sawithub-backend`)
- `REDIS_ADDR`
- `REDIS_PASSWORD`
- `REDIS_DB` (opsional, default `0`)
- `REDIS_POOL_SIZE` (opsional, default `20`)
- `REDIS_PREFIX` (opsional, default `sawithub:prod`)
- `REDIS_TLS` (opsional, default `false` untuk private domain Railway)
- `REDIS_FEATURE_RATE_LIMIT` (opsional, default `true`)
- `REDIS_FEATURE_CACHE` (opsional, default `true`)
- `REDIS_FEATURE_SESSIONS` (opsional, default `true`)
- `REDIS_FEATURE_QUEUE` (opsional, default `true`)
- `REDIS_FEATURE_PRESENCE` (opsional, default `true`)
