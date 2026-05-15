# Deployment Scripts

Helper scripts untuk deployment workflow admin frontend.

## `use-vercel-config.sh`

Switch `vercel.json` configuration based on deployment environment.

```bash
./scripts/use-vercel-config.sh staging
./scripts/use-vercel-config.sh production
```

- **staging** → copies `vercel.staging.json` → `vercel.json`
- **production** → copies `vercel.production.json` → `vercel.json`

## Environment mapping

| Environment | Frontend host | Admin backend host |
| --- | --- | --- |
| staging | `staging.adminpanel.sawithub.com` | `staging.admin.backend.sawithub.com` |
| production | `adminpanel.sawithub.com` | `admin-backend-sawithub-production.up.railway.app` |

## `validate-admin-backend-target.mjs`

Runs during `npm run build`. It checks CSP + `/api/(.*)` rewrite against the expected **admin** backend for the active lane.

**How staging vs production is chosen:**

1. `VITE_ENVIRONMENT=staging|production` if set.
2. Else **read `vercel.json`** `/api` destination (committed file wins over `VERCEL_ENV`).
3. Else `VERCEL_ENV=preview|development` → **staging**.
4. Else default **staging**.

Dengan urutan ini, **Vercel Production** yang masih meng-commit `vercel.json` selaras dengan **`vercel.staging.json`** tetap lulus guard — sama seperti repo user app (`frontend-sawithub`).

## Important

- Seringnya: **`vercel.json` disamakan dengan `vercel.staging.json`** untuk preview dan production sampai Anda siap menjalankan `./scripts/use-vercel-config.sh production` dan meng-commit host produksi.
- Branch yang memang melayani **adminpanel produksi** harus meng-commit `vercel.json` yang selaras dengan `vercel.production.json`.
- Jangan memasukkan host backend **user app** ke repo admin frontend ini.
