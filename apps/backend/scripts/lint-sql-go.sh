#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
exec go run ./scripts/lint_sql_go.go
