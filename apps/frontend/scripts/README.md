# Deployment Scripts

Helper scripts untuk deployment workflow.

## 📁 Available Scripts

### `use-vercel-config.sh`

Switch `vercel.json` configuration based on deployment environment.

**Usage:**

```bash
# Staging template (same as vercel.staging.json)
./scripts/use-vercel-config.sh staging

# Production template (same as vercel.production.json)
./scripts/use-vercel-config.sh production
```

**What it does:**

- Copies `vercel.staging.json` or `vercel.production.json` to `vercel.json`
- Shows preview of the new configuration
- Reminds you to commit the change

### `validate-admin-backend-target.mjs`

Runs during `npm run build` (`check:backend-target`). It checks that `vercel.json`:

- Does not point `/api` at the **admin** backend (`admin-backend-sawithub-production…`)
- Rewrites `/api/(.*)` and CSP `connect-src` to the expected **user** backend host

**How staging vs production is chosen:**

1. `VITE_ENVIRONMENT=staging|production` if set.
2. Else **read `vercel.json`** `/api` destination: if it contains `staging.backend.sawithub.com` → **staging**; if it contains `sawithub-backend-production-92d6.up.railway.app` → **production**.
3. Else `VERCEL_ENV=preview|development` → **staging**.
4. Else default **staging**.

Jadi **build Vercel Production** tetap lolos guard selama `vercel.json` masih selaras dengan **`vercel.staging.json`** (pola umum sampai Anda sengaja mengganti ke `vercel.production.json`).

---

## 🔄 Deployment workflow

### Staging lane (default committed config)

`vercel.json` should match `vercel.staging.json` on branches that deploy to staging **or** when Production Vercel still uses the staging API/CSP template:

```bash
./scripts/use-vercel-config.sh staging
git add vercel.json
git commit -m "chore: align vercel.json with vercel.staging.json"
```

### Production template (www + production Railway)

When the **production** hostname and production user backend must be in CSP/rewrites:

```bash
./scripts/use-vercel-config.sh production
git add vercel.json
git commit -m "chore: align vercel.json with vercel.production.json"
```

---

## ⚠️ Important

1. **`vercel.json` is the source of truth at build time** — the backend-target guard inspects this file, not only env vars.
2. **Preview + Production on Vercel** can both build with `vercel.json === vercel.staging.json`; set `VITE_ENVIRONMENT` or swap to `vercel.production.json` only when you intentionally target production hosts.
3. **Do not merge conflicting `vercel.json`** across branches without re-running `use-vercel-config.sh` for that branch’s lane.
4. **Idempotent** — safe to run `use-vercel-config.sh` multiple times.

---

## 🔮 Future improvement

Consider Vercel Middleware for dynamic CSP/connect-src instead of committing different `vercel.json` per lane.
