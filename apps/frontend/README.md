# frontend-sawithub

Frontend service untuk platform SawitHub, dibangun dengan React + TypeScript + Vite.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Menjalankan Lokal

1. Salin `.env.example` ke `.env`.
2. Install dependency:

```bash
npm install
```

3. Jalankan development server:

```bash
npm run dev
```

## Environment Variables

Gunakan `.env.example` sebagai sumber tunggal variabel frontend.

- **`VITE_API_BASE_URL` (opsional)** — jika tidak diset, app memakai same-origin **`/api`**:
  - **Dev:** Vite mem-proxy `/api` → `http://localhost:8000`
  - **Deploy:** `vercel.json` diisi dari **`vercel.staging.json`** atau **`vercel.production.json`** (`scripts/use-vercel-config.sh`), rewrite `/api` → staging (`staging.backend.sawithub.com`) atau production (Railway) — tidak dicampur di satu file template.
- Set eksplisit (mis. `https://staging.backend.sawithub.com/api`) hanya untuk skenario khusus / build lokal ke host absolut.
- `VITE_APP_URL` — canonical site URL (opsional; lihat `.env.example`).

## Build & Lint

```bash
npm run lint
npm run build
```

### Guard Target Backend

Untuk mencegah salah target backend URL berulang:

- Script guard: `scripts/validate-admin-backend-target.mjs`
- Command manual: `npm run check:backend-target`
- `npm run build` otomatis menjalankan guard ini sebelum proses build.

Guard akan gagal jika:
- `rewrites` `/api/(.*)` di `vercel.json` tidak mengarah ke backend yang sesuai **lane** terdeteksi (staging vs production)
- `Content-Security-Policy` `connect-src` tidak mengizinkan host backend yang sama
- `vercel.staging.json` / `vercel.production.json` saling tertukar target `/api` (staging template mengarah ke prod atau sebaliknya)
- host admin backend ikut masuk ke `vercel.json`

## Menjalankan dengan Docker

```bash
docker compose up -d --build
```

Frontend akan tersedia di `http://localhost`.

## Deploy Vercel + Railway

- Frontend di Vercel; backend staging / production di host masing-masing.
- Browser memanggil **`/api`** pada domain frontend; Vercel rewrite ke backend lane yang benar (lihat `vercel.staging.json` vs `vercel.production.json`).
- Sebelum merge/deploy lane lain, jalankan `./scripts/use-vercel-config.sh staging|production` dan commit `vercel.json` yang sesuai (lihat `VERCEL_CONFIG_SWAP.md`).

Langkah ringkas:

1. Set env Vercel sesuai kebutuhan (biasanya **`VITE_API_BASE_URL` boleh kosong** agar pakai `/api` + rewrite).
2. Set env di Railway mengikuti `.env.example` backend.

## Catatan Integrasi Backend

- Dev proxy Vite saat ini mengarah ke `http://localhost:8000`.
- Pastikan backend mengizinkan origin frontend pada `FRONTEND_URL`.
