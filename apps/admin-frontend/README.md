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

Aplikasi ini menggunakan routing admin-only:
- `/dashboard`
- `/users`
- `/data`
- `/analytics`
- `/monitoring`
- `/settings`
- `/audit`
- `/login`

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

## Docker

```bash
docker compose up -d --build
```

App tersedia di `http://localhost`.

## Deploy Notes

- Frontend admin deploy terpisah dari frontend user.
- Pastikan `VITE_API_BASE_URL` di environment deploy mengarah ke service admin backend aktif.
