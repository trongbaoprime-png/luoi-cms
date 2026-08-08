#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
PATCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "[DB-001] Checking patch applicability..."
git apply --check "$PATCH_DIR/DB001-postgres-foundation.patch"

echo "[DB-001] Applying patch..."
git apply "$PATCH_DIR/DB001-postgres-foundation.patch"

echo "[DB-001] Patch applied. No deploy/cutover was performed."
echo "Next: inspect git diff, then run npm run check:system."
