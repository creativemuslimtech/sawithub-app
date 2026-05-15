# Selaras dengan `admin-backend-sawithub`

## Environment

- **`VITE_API_BASE_URL`** harus mengarah ke **admin backend** (bukan `backend-sawithub`). Lihat root **`README.md`** dan **`.env.example`**.
- Dengan `baseURL` berakhiran `/api`, pemanggilan seperti `api.get('/admin/system')` menjadi `GET .../api/admin/system`, sama seperti router di `admin-backend-sawithub/main.go`.

## Route aktif di SPA (`src/App.tsx`)

Hanya halaman **admin** + **Login**. Semua request Axios yang dipakai untuk panel mengikuti prefix **`/admin/...`** sesuai backend.

| Frontend (relatif ke `/api`) | Backend |
|------------------------------|---------|
| `POST /admin/auth/login` | `POST /api/admin/auth/login` |
| `GET /admin/auth/me` | `GET /api/admin/auth/me` |
| `GET /admin/overview` | `GET /api/admin/overview` |
| `GET /admin/users` | `GET /api/admin/users` |
| `PUT /admin/users/{id}/role` | `PUT /api/admin/users/{id}/role` |
| `PUT /admin/users/{id}/status` | `PUT /api/admin/users/{id}/status` |
| `PUT /admin/users/{id}/password` | `PUT /api/admin/users/{id}/password` |
| `GET /admin/data` | `GET /api/admin/data` |
| `GET /admin/analytics` | `GET /api/admin/analytics` |
| `GET /admin/system` | `GET /api/admin/system` |
| `PUT /admin/system/api-endpoint-state` | `PUT /api/admin/system/api-endpoint-state` |
| `GET /admin/settings` | `GET /api/admin/settings` |
| `PUT /admin/settings` | `PUT /api/admin/settings` |
| `GET /admin/audit` | `GET /api/admin/audit` |

Endpoint **`PUT /admin/system/api-state`** (toggle API global) ada di backend; UI monitoring saat ini hanya men-toggle **per endpoint** lewat `api-endpoint-state`.

## `src/pages/` (admin-only)

Selain `Login.tsx` dan folder `pages/admin/`, tidak ada halaman app user: salinan lama sudah dihapus agar repo ini hanya memuat panel admin.

## Hubungan dengan `backend-sawithub`

Panel admin **tidak** memanggil user API secara langsung dari frontend ini. Toggle endpoint di monitoring mengirim **path** yang kini selaras dengan katalog di **admin-backend** (yang mengikuti path service-style user API untuk Redis).
