#!/bin/bash

# Script to swap vercel.json based on environment
# Usage: ./scripts/use-vercel-config.sh [production|staging]

set -e

ENV=${1:-production}

case $ENV in
  production|prod)
    echo "📦 Switching to PRODUCTION Vercel config..."
    cp vercel.production.json vercel.json
    echo "✅ Now using vercel.production.json"
    echo "📝 Remember to commit this change before deploying to production"
    ;;
  staging)
    echo "📦 Switching to STAGING Vercel config..."
    cp vercel.staging.json vercel.json
    echo "✅ Now using vercel.staging.json"
    echo "📝 Remember to commit this change before deploying to staging"
    ;;
  *)
    echo "❌ Error: Invalid environment '$ENV'"
    echo ""
    echo "Usage: ./scripts/use-vercel-config.sh [production|staging]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/use-vercel-config.sh production"
    echo "  ./scripts/use-vercel-config.sh staging"
    exit 1
    ;;
esac

echo ""
echo "Current vercel.json content preview:"
echo "---"
head -n 5 vercel.json
echo "..."
