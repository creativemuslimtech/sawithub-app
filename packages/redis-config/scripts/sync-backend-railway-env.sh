#!/usr/bin/env bash
set -euo pipefail

required_vars=(
  RAILWAY_BACKEND_SERVICE_NAME
  REDIS_ADDR
  REDIS_PASSWORD
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Missing required environment variable: $var" >&2
    exit 1
  fi
done

REDIS_DB="${REDIS_DB:-0}"
REDIS_POOL_SIZE="${REDIS_POOL_SIZE:-20}"
REDIS_PREFIX="${REDIS_PREFIX:-sawithub:prod}"
REDIS_TLS="${REDIS_TLS:-false}"

REDIS_FEATURE_RATE_LIMIT="${REDIS_FEATURE_RATE_LIMIT:-true}"
REDIS_FEATURE_CACHE="${REDIS_FEATURE_CACHE:-true}"
REDIS_FEATURE_SESSIONS="${REDIS_FEATURE_SESSIONS:-true}"
REDIS_FEATURE_QUEUE="${REDIS_FEATURE_QUEUE:-true}"
REDIS_FEATURE_PRESENCE="${REDIS_FEATURE_PRESENCE:-true}"

echo "Applying Redis variables to backend service..."
railway variable set -s "$RAILWAY_BACKEND_SERVICE_NAME" \
  REDIS_ADDR="$REDIS_ADDR" \
  REDIS_PASSWORD="$REDIS_PASSWORD" \
  REDIS_DB="$REDIS_DB" \
  REDIS_POOL_SIZE="$REDIS_POOL_SIZE" \
  REDIS_PREFIX="$REDIS_PREFIX" \
  REDIS_TLS="$REDIS_TLS" \
  REDIS_FEATURE_RATE_LIMIT="$REDIS_FEATURE_RATE_LIMIT" \
  REDIS_FEATURE_CACHE="$REDIS_FEATURE_CACHE" \
  REDIS_FEATURE_SESSIONS="$REDIS_FEATURE_SESSIONS" \
  REDIS_FEATURE_QUEUE="$REDIS_FEATURE_QUEUE" \
  REDIS_FEATURE_PRESENCE="$REDIS_FEATURE_PRESENCE"

echo "Triggering backend redeploy from configured source..."
railway redeploy -s "$RAILWAY_BACKEND_SERVICE_NAME" --from-source -y

echo "Done. Redis env sync + backend redeploy requested."
