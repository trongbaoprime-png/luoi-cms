#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/app/path-app}"
BRANCH="${MCP_DEPLOY_BRANCH:-feat/mcp-production-v1}"

log() { printf '\n[MCP DEPLOY] %s\n' "$*"; }
fail() { printf '\n[MCP DEPLOY] ERROR: %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] && log "Running as root. Prefer a dedicated deploy user after SSH key rotation."
[ -d "$PROJECT_DIR/.git" ] || fail "Git repository not found at $PROJECT_DIR"

cd "$PROJECT_DIR"

log "Preflight: current repository state"
printf 'path: %s\n' "$(pwd)"
git status --short

if [ -n "$(git status --porcelain)" ]; then
  fail "Working tree is not clean. Commit/stash existing VPS changes before deployment."
fi

for cmd in git node npm pm2 openssl curl; do
  command -v "$cmd" >/dev/null 2>&1 || fail "Missing required command: $cmd"
done

[ -f .env ] || fail ".env not found"

set -a
# shellcheck disable=SC1091
source ./.env
set +a

[ -n "${CRM_POSTGRES_URL:-${CRM_DATABASE_URL:-}}" ] || fail "CRM_POSTGRES_URL/CRM_DATABASE_URL is missing"
[ -n "${OMNI_POSTGRES_URL:-${OMNI_DATABASE_URL:-}}" ] || fail "OMNI_POSTGRES_URL/OMNI_DATABASE_URL is missing"
[ -n "${MCP_API_KEY:-}" ] || fail "MCP_API_KEY is missing"

if [ "${#MCP_API_KEY}" -lt 32 ]; then
  fail "MCP_API_KEY must be at least 32 characters"
fi

if [ -z "${ADMIN_PASS_HASH:-}" ]; then
  log "WARNING: ADMIN_PASS_HASH is not configured. Database admin accounts may still work, but environment super-admin login will be unavailable."
fi

log "Fetch and checkout $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

log "Install exact dependencies"
npm ci

log "Generate Prisma clients (NO migration/db push)"
npm run prisma:generate

log "TypeScript audit"
npm run audit

log "Production build"
npm run build

log "Start/reload PM2 processes"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

log "Wait for MCP service"
for _ in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3100/healthz >/tmp/luoi-mcp-health.json 2>/dev/null; then
    cat /tmp/luoi-mcp-health.json
    printf '\n'
    break
  fi
  sleep 1
done

curl -fsS http://127.0.0.1:3100/healthz >/dev/null || {
  pm2 logs luoi-mcp --lines 80 --nostream || true
  fail "MCP health check failed"
}

log "Verify unauthenticated MCP is rejected"
unauth_status="$(curl -sS -o /tmp/luoi-mcp-unauth.json -w '%{http_code}' \
  http://127.0.0.1:3100/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}')"
[ "$unauth_status" = "401" ] || fail "Expected HTTP 401 without token, got $unauth_status"

log "Run authenticated MCP smoke test"
MCP_TEST_URL=http://127.0.0.1:3100/mcp MCP_API_KEY="$MCP_API_KEY" npm run mcp:test

log "Deployment complete. Nginx /mcp proxy and external HTTPS test are separate gates."
pm2 status
