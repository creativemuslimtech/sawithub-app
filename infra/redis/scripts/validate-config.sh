#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

required_files=(
  "README.md"
  ".env.example"
  "docs/architecture.md"
  "docs/security.md"
  "docs/operations.md"
  "docs/integration/backend-sawithub.md"
  "policies/keyspace.yml"
  "policies/ttl-matrix.yml"
  "policies/acl-policy.md"
)

for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing required file: $f"
    exit 1
  fi
done

if rg -n "password=|REDIS_PASSWORD=.*[^[:space:]]" .env.example >/dev/null; then
  echo "Do not hardcode Redis password in .env.example"
  exit 1
fi

if ! rg -n "requires_ttl: true" policies/keyspace.yml >/dev/null; then
  echo "Keyspace policy must enforce TTL requirement"
  exit 1
fi

echo "Validation passed."
