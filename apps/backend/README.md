# backend-sawithub

Backend service untuk platform SawitHub, dibangun dengan Go + Chi + MySQL.

## Stack

- Go 1.25
- Chi router
- MySQL
- JWT auth
- Resend (email reset password dan export laporan)

## Menjalankan Lokal

1. Salin `.env.example` ke `.env` lalu isi nilainya.
2. Install dependency:

```bash
go mod download
```

3. Jalankan server:

```bash
go run ./cmd/main.go
```

Default API: `http://localhost:8000`

## Menjalankan dengan Docker

```bash
docker compose up -d --build
```

Service default:

- Backend API: `http://localhost:8000`
- MySQL: `localhost:3306`

> Semua variabel backend disentralisasi di satu file: `.env`.

## Environment Variables

Gunakan `.env.example` sebagai sumber tunggal variabel backend.

Untuk Railway production (`www.sawithub.com`), nilai penting:

- `FRONTEND_URL=https://www.sawithub.com`
- `BASE_URL=https://www.sawithub.com`
- `DATABASE_URL=<Railway MySQL URL>`
- `JWT_SECRET=<secret production>`
- `ENCRYPTION_KEY=<32-byte key production>`
- `RESEND_API_KEY=<resend key>`
- `EMAIL_FROM=noreply@sawithub.com`
- `SUPPORT_EMAIL=bantuan@sawithub.com`
- `REDIS_ADDR=<Railway Redis host:port>`
- `REDIS_PASSWORD=<Railway Redis password>`
- `REDIS_DB=0`
- `REDIS_POOL_SIZE=20`
- `REDIS_PREFIX=sawithub:prod`
- `REDIS_TLS=true`
- `REDIS_FEATURE_RATE_LIMIT=true`
- `REDIS_FEATURE_CACHE=true`
- `REDIS_FEATURE_SESSIONS=true`
- `REDIS_FEATURE_QUEUE=true`
- `REDIS_FEATURE_PRESENCE=true`

Jika frontend di Vercel memakai rewrite `/api -> Railway`, backend tetap menerima request origin `https://www.sawithub.com`.

## Verifikasi

Jalankan pengecekan dasar:

```bash
go test ./...
```

Jalankan worker email queue (opsional saat `REDIS_FEATURE_QUEUE=true`):

```bash
go run ./cmd/worker
```

Observability Redis tambahan tersedia di `/api/health`:
- `redis_metrics`: cache hit/miss, limiter allow/deny/fallback, queue processed/retry/dlq
- `redis_queue`: antrean aktif dan DLQ depth untuk email worker

## Catatan Integrasi Frontend

- Frontend mengarah ke backend via `VITE_API_BASE_URL` (atau proxy `/api` saat dev).
- Pastikan `FRONTEND_URL` di backend sesuai origin frontend agar CORS aman.

## Redis Contract Reference

Kontrak integrasi Redis (key naming, TTL, invalidation, session revoke, queue) dipusatkan di:

- `../redis-sawithub/docs/integration/backend-sawithub.md`
