# Powershell Script to launch OmniRoute (port 20128) and OpenClaw (port 20180) sidecars locally
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$rootDir = Split-Path -Parent $scriptDir

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Starting LƯỜI BUSINESS OS Sidecars..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Start OmniRoute Model Gateway (Port 20128)
Write-Host "🚀 Launching OmniRoute Model Gateway on http://127.0.0.1:20128..." -ForegroundColor Green
Start-Process -FilePath "cmd" -ArgumentList "/c cd /d `"$rootDir`" && npx tsx services/omniroute/index.ts" -WindowStyle Normal

Start-Sleep -Seconds 2

# 2. Start OpenClaw Agent Runtime (Port 20180)
Write-Host "🚀 Launching OpenClaw Agent Runtime on http://127.0.0.1:20180..." -ForegroundColor Green
Start-Process -FilePath "cmd" -ArgumentList "/c cd /d `"$rootDir`" && npx tsx services/openclaw/index.ts" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "✅ OmniRoute (20128) and OpenClaw (20180) sidecar processes initiated!" -ForegroundColor Yellow
