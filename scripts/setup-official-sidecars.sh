#!/bin/bash
# LƯỜI BUSINESS OS — Official Sidecar Setup Script for VPS
# Clones & Configures OmniRoute (https://github.com/diegosouzapw/OmniRoute)
# and OpenClaw (https://github.com/openclaw/openclaw)

set -e

APP_DIR="/var/www/app"
OMNIROUTE_DIR="$APP_DIR/OmniRoute"
OPENCLAW_DIR="$APP_DIR/openclaw"
PATH_APP_DIR="$APP_DIR/path-app"

echo "=========================================================="
echo "🚀 Setting up Official OmniRoute & OpenClaw Sidecars..."
echo "=========================================================="

mkdir -p "$APP_DIR"

# 1. Setup OmniRoute Model Gateway (https://github.com/diegosouzapw/OmniRoute)
if [ ! -d "$OMNIROUTE_DIR" ]; then
    echo "📦 Cloning OmniRoute from https://github.com/diegosouzapw/OmniRoute.git..."
    git clone https://github.com/diegosouzapw/OmniRoute.git "$OMNIROUTE_DIR" || true
fi

if [ -d "$OMNIROUTE_DIR" ]; then
    echo "🔧 Installing OmniRoute dependencies..."
    cd "$OMNIROUTE_DIR"
    npm install || true
fi

# 2. Setup OpenClaw Agent Runtime (https://github.com/openclaw/openclaw)
if [ ! -d "$OPENCLAW_DIR" ]; then
    echo "📦 Cloning OpenClaw from https://github.com/openclaw/openclaw.git..."
    git clone https://github.com/openclaw/openclaw.git "$OPENCLAW_DIR" || true
fi

if [ -d "$OPENCLAW_DIR" ]; then
    echo "🔧 Installing OpenClaw dependencies..."
    cd "$OPENCLAW_DIR"
    npm install || pip3 install -r requirements.txt || true
fi

# 3. Register PM2 Daemons for Sidecars & Core App
cd "$PATH_APP_DIR"
pm2 delete omniroute-sidecar openclaw-sidecar 2>/dev/null || true

echo "🚀 Starting OmniRoute Model Gateway on Port 20128..."
pm2 start "npx tsx services/omniroute/index.ts" --name "omniroute-sidecar"

echo "🚀 Starting OpenClaw Agent Runtime on Port 20180..."
pm2 start "npx tsx services/openclaw/index.ts" --name "openclaw-sidecar"

pm2 restart luoi-cms || true
pm2 save

echo "=========================================================="
echo "✅ Official Sidecars Setup Complete!"
echo "   - OmniRoute Gateway: http://127.0.0.1:20128/v1"
echo "   - OpenClaw Runtime: http://127.0.0.1:20180"
echo "=========================================================="
