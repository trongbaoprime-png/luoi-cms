#!/bin/bash
# Linux/VPS Script to launch OmniRoute (20128) and OpenClaw (20180) sidecars via PM2 or background Node.js
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "========================================="
echo "Starting LƯỜI BUSINESS OS Sidecars..."
echo "========================================="

if command -v pm2 &> /dev/null; then
    echo "🚀 Starting sidecars using PM2..."
    pm2 start "npx tsx services/omniroute/index.ts" --name "omniroute-sidecar"
    pm2 start "npx tsx services/openclaw/index.ts" --name "openclaw-sidecar"
    pm2 save
else
    echo "🚀 Starting sidecars in background..."
    nohup npx tsx services/omniroute/index.ts > omniroute.log 2>&1 &
    nohup npx tsx services/openclaw/index.ts > openclaw.log 2>&1 &
fi

echo "✅ OmniRoute (20128) and OpenClaw (20180) sidecars launched successfully!"
