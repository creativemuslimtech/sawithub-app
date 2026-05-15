# Security Baseline

Dokumen ini mendefinisikan baseline keamanan Redis untuk SawitHub production.

## 1. Transport Security

- Wajib TLS in-transit untuk koneksi ke Railway Managed Redis.
- `REDIS_TLS_ENABLED=true` di production.
- Verifikasi server name (`REDIS_TLS_SERVER_NAME`) saat endpoint mendukung.

## 2. Secret Management and Rotation

- `REDIS_PASSWORD` disimpan di secret manager (Railway/GitHub), bukan di repo.
- Rotasi secret minimal per kuartal, atau segera setelah indikasi kompromi.
- Rotasi emergency flow:
  1. Generate credential baru.
  2. Update service backend dan worker.
  3. Deploy bertahap.
  4. Revoke credential lama.

## 3. Data Classification Rules

- Redis tidak boleh menyimpan raw PII:
  - email, phone number, password, token sensitif plaintext.
- Simpan hanya opaque token, hash, ID, atau metadata non-PII.

## 4. Keyspace Isolation

Gunakan prefix wajib:

- `sawithub:prod:auth:*`
- `sawithub:prod:ratelimit:*`
- `sawithub:prod:cache:*`
- `sawithub:prod:queue:*`
- `sawithub:prod:presence:*`

Semua key transient wajib TTL.

## 5. Command and Access Hardening

- Gunakan credential terpisah per service role.
- Hindari command berisiko tinggi dalam runtime:
  - `FLUSHALL`, `FLUSHDB`, `CONFIG SET`, `KEYS`, `DEBUG`.
- Batasi operational command ke user ops khusus.

## 6. Incident Security Controls

- Global token revoke via keyspace `auth` (session version bump).
- Selective purge per namespace tanpa menyentuh key domain lain.
- Aktifkan mode degradasi aman saat Redis tidak tersedia.

## 7. Verification Checklist

- TLS aktif.
- Tidak ada raw secret di git.
- Semua domain key memiliki TTL policy.
- Monitoring capture error rate Redis, auth revoke latency, queue backlog.
