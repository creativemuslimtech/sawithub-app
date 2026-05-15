.PHONY: dev-backend dev-admin-backend build-backend build-admin-backend \
        dev-frontend dev-admin-frontend build-all lint-go vet-go tidy-go

# ── Go ─────────────────────────────────────────────────────────────────────────
dev-backend:
	cd apps/backend && go run ./cmd/main.go

dev-admin-backend:
	cd apps/admin-backend && go run ./cmd/main.go

build-backend:
	cd apps/backend && CGO_ENABLED=0 GOOS=linux go build -o ../../dist/sawit-api ./cmd/main.go

build-admin-backend:
	cd apps/admin-backend && CGO_ENABLED=0 GOOS=linux go build -o ../../dist/sawit-admin-api ./cmd/main.go

vet-go:
	cd apps/backend && go vet ./...
	cd apps/admin-backend && go vet ./...

tidy-go:
	cd apps/backend && go mod tidy
	cd apps/admin-backend && go mod tidy

test-go:
	cd apps/backend && go test ./...
	cd apps/admin-backend && go test ./...

# ── Frontend ───────────────────────────────────────────────────────────────────
dev-frontend:
	npm run dev --workspace=apps/frontend

dev-admin-frontend:
	npm run dev --workspace=apps/admin-frontend

build-all:
	npm run build

# ── Misc ───────────────────────────────────────────────────────────────────────
install:
	npm install
