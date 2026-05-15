# Vercel Configuration Swap Guide

Panduan untuk manage `vercel.json` configuration antara production dan staging environments.

---

## 📋 Config Files Overview

| File | Purpose | Domain | Backend API |
|------|---------|--------|-------------|
| `vercel.production.json` | Production config | www.sawithub.com | sawithub-backend-production-92d6.up.railway.app |
| `vercel.staging.json` | Staging config | staging.sawithub.com | staging.backend.sawithub.com |
| `vercel.json` | **Active config** yang di-deploy Vercel | - | - |

---

## 🔧 Why Do We Need This?

`vercel.json` contains environment-specific hardcoded values:

1. **Content Security Policy (CSP)** headers dengan allowed domains
2. **API rewrites** ke backend URL
3. **Domain redirects** configuration

Karena Vercel tidak support environment variables di `vercel.json`, kita perlu swap file sesuai environment yang akan di-deploy.

---

## 🚀 Using the Helper Script (Recommended)

### **Switch to Staging Config:**

```bash
./scripts/use-vercel-config.sh staging
```

Output:
```
📦 Switching to STAGING Vercel config...
✅ Now using vercel.staging.json
📝 Remember to commit this change before deploying to staging
```

### **Switch to Production Config:**

```bash
./scripts/use-vercel-config.sh production
```

Output:
```
📦 Switching to PRODUCTION Vercel config...
✅ Now using vercel.production.json
📝 Remember to commit this change before deploying to production
```

---

## 📝 Complete Deployment Workflows

### **Workflow 1: Deploy Staging**

```bash
# 1. Switch to staging branch
git checkout staging

# 2. Pull latest changes
git pull origin staging

# 3. Switch to staging config
./scripts/use-vercel-config.sh staging

# 4. Verify the config
git diff vercel.json

# 5. Commit the config change
git add vercel.json
git commit -m "chore: use staging vercel config"

# 6. Deploy
git push origin staging
# ✅ Vercel auto-deploys to staging.sawithub.com
```

### **Workflow 2: Deploy Production**

```bash
# 1. Switch to main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Merge staging if needed (optional)
# git merge staging

# 4. Switch to production config
./scripts/use-vercel-config.sh production

# 5. Verify the config
git diff vercel.json

# 6. Commit the config change
git add vercel.json
git commit -m "chore: use production vercel config"

# 7. Deploy
git push origin main
# ✅ Vercel auto-deploys to www.sawithub.com
```

### **Workflow 3: Hotfix to Production**

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. Make the fix
# ... edit code ...
git add .
git commit -m "fix: critical bug"

# 3. Merge to main
git checkout main
git merge hotfix/critical-fix

# 4. Apply production config
./scripts/use-vercel-config.sh production
git add vercel.json
git commit -m "chore: use production vercel config"

# 5. Deploy to production
git push origin main

# 6. Sync to staging
git checkout staging
git merge hotfix/critical-fix

# 7. Apply staging config
./scripts/use-vercel-config.sh staging
git add vercel.json
git commit -m "chore: use staging vercel config"

# 8. Deploy to staging
git push origin staging

# 9. Clean up
git branch -d hotfix/critical-fix
```

---

## 🔄 Manual Config Swap (Alternative)

Jika tidak bisa run script, bisa manual copy:

```bash
# For staging deployment
cp vercel.staging.json vercel.json

# For production deployment
cp vercel.production.json vercel.json
```

Jangan lupa commit after swap!

---

## ⚠️ Important Rules

### **1. Never Merge vercel.json Between Branches**

```bash
# ❌ DON'T DO THIS
git checkout main
git merge staging  # This might bring staging config to main!

# ✅ DO THIS INSTEAD
git checkout main
git merge staging
./scripts/use-vercel-config.sh production  # Re-apply production config
git add vercel.json
git commit -m "chore: use production vercel config"
```

### **2. Each Branch Maintains Its Own Config**

- **Branch `main`** should always have `vercel.json` = `vercel.production.json`
- **Branch `staging`** should always have `vercel.json` = `vercel.staging.json`

### **3. Config Files Are Safe to Commit**

- ✅ `vercel.production.json` - Safe to commit
- ✅ `vercel.staging.json` - Safe to commit
- ✅ `vercel.json` - Safe to commit (active config)
- ❌ `.env` - Never commit (in .gitignore)

---

## 🔍 Verifying Active Config

Check which config is currently active:

```bash
# Check API rewrite destination
grep "destination.*api" vercel.json

# Production should show:
# "destination": "https://sawithub-backend-production-92d6.up.railway.app/api/$1"

# Staging should show:
# "destination": "https://staging.backend.sawithub.com/api/$1"
```

Or use the script preview feature:

```bash
./scripts/use-vercel-config.sh staging
# Shows preview of the file
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Use staging config | `./scripts/use-vercel-config.sh staging` |
| Use production config | `./scripts/use-vercel-config.sh production` |
| Verify active config | `grep destination vercel.json` |
| Manual staging swap | `cp vercel.staging.json vercel.json` |
| Manual production swap | `cp vercel.production.json vercel.json` |

---

## 🔮 Future Improvement

**Goal:** Eliminate config swapping entirely

**Solution:** Migrate to Vercel Middleware for dynamic header handling

**Benefits:**
- Single `vercel.json` for all environments
- No manual config swapping
- Environment-aware CSP headers
- Safer deployment workflow

**Timeline:** Consider for Q3 2026 after current workflow stabilizes

---

## 📞 Troubleshooting

### **Problem: Deployed staging but showing production URLs**

**Cause:** Wrong config deployed

**Solution:**
```bash
git checkout staging
./scripts/use-vercel-config.sh staging
git add vercel.json
git commit -m "fix: use correct staging config"
git push origin staging
```

### **Problem: Config swap script not found**

**Cause:** Script not executable or wrong directory

**Solution:**
```bash
chmod +x scripts/use-vercel-config.sh
./scripts/use-vercel-config.sh staging
```

### **Problem: Git merge conflict on vercel.json**

**Cause:** Trying to merge vercel.json between branches

**Solution:**
```bash
# Accept their version (or ours), then re-apply correct config
git checkout --ours vercel.json  # or --theirs
git add vercel.json

# Re-apply correct config for current branch
./scripts/use-vercel-config.sh [staging|production]
git add vercel.json
git commit -m "chore: resolve config conflict and apply correct config"
```

---

**Remember:** Always run the config swap script before pushing to ensure correct environment configuration! 🚀

