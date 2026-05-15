#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f ".env" ]]; then
  # shellcheck disable=SC2046
  export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env | xargs)
fi

: "${REDIS_ADDR:?REDIS_ADDR is required}"

if ! command -v redis-cli >/dev/null 2>&1; then
  echo "redis-cli is required but not installed."
  exit 1
fi

host="${REDIS_ADDR%%:*}"
port="${REDIS_ADDR##*:}"

tls_args=()
if [[ "${REDIS_TLS_ENABLED:-true}" == "true" ]]; then
  tls_args+=(--tls)
  if [[ -n "${REDIS_TLS_SERVER_NAME:-}" ]]; then
    tls_args+=(--sni "$REDIS_TLS_SERVER_NAME")
  fi
fi

auth_args=()
if [[ -n "${REDIS_PASSWORD:-}" ]]; then
  auth_args+=(-a "$REDIS_PASSWORD")
fi

echo "Checking Redis health on $host:$port ..."
redis-cli -h "$host" -p "$port" "${tls_args[@]}" "${auth_args[@]}" PING
redis-cli -h "$host" -p "$port" "${tls_args[@]}" "${auth_args[@]}" INFO server | rg "redis_version|uptime_in_seconds"

echo "Redis health check completed."
