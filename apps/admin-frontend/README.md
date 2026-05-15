# admin-frontend-sawithub

Frontend khusus Admin Panel SawitHub, dipisahkan dari aplikasi user (`frontend-sawithub`).

Repo ini menampung UI/UX untuk operasional admin:
- Dashboard overview
- Manajemen pengguna
- Data platform
- Analytics
- Monitoring
- Settings
- Audit log

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Struktur Routing

Routing admin-only (lihat `src/App.tsx`):
- `/` → mengarah ke `/admin`
- `/login`
- `/admin`, `/admin/users`, `/admin/data`, `/admin/analytics`, `/admin/monitoring`, `/admin/settings`, `/admin/audit`

Redirect kompatibilitas: `/dashboard`, `/users`, `/data`, dll. → setara di bawah `/admin/...`.

## Menjalankan Lokal

1. Salin file env:

```bash
cp .env.example .env
```

2. Install dependency:

```bash
npm install
```

3. Jalankan development server:

```bash
npm run dev
```

## Environment Variables

Gunakan `.env.example` sebagai baseline.

- `VITE_API_BASE_URL`
  - wajib diarahkan ke **admin backend** (`admin-backend-sawithub`)
  - contoh: `https://admin-backend-sawithub-production.up.railway.app/api`
- `VITE_APP_URL` (opsional metadata frontend)

## Auth & Session

- Login admin menggunakan endpoint backend:
  - `POST /admin/auth/login`
  - `GET /admin/auth/me`
- Token admin disimpan terpisah dari app user:
  - `sawit_admin_token`
  - `sawit_admin_user`

## Build & Lint

```bash
npm run lint
npm run build
```

## Docker (opsional, lokal)

Repo ini menyertakan `Dockerfile` + `docker-compose.yml` untuk menjalankan build Vite + **nginx** seperti lingkungan produksi di mesin lokal:

```bash
docker compose up -d --build
```

**Vercel** (deploy frontend admin) secara bawaan memakai **build Node/Vite** dari `package.json`, **bukan** Dockerfile. File Docker tetap berguna untuk uji coba lokal atau jika suatu saat deploy memakai container registry.

**GitHub Actions** (`.github/workflows/ci.yml`) hanya `npm ci`, lint, dan `npm run build` — **tanpa** image Docker.

**Railway** untuk service Go (mis. `admin-backend-sawithub`) umumnya memakai buildpack Nixpacks/Go; backend admin di repo ini **tidak** wajib punya Dockerfile. `backend-sawithub` dan `frontend-sawithub` punya Dockerfile terpisah untuk lokal/opsi container, sama seperti admin-frontend.

## Deploy Notes

- Frontend admin deploy terpisah dari frontend user (mis. proyek Vercel terpisah).
- Pastikan `VITE_API_BASE_URL` di environment deploy mengarah ke service **admin backend** aktif.
- `public/robots.txt` memblokir seluruh crawling; panel admin tidak dimaksudkan untuk SEO.
