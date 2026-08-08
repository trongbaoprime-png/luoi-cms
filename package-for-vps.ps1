$ErrorActionPreference = "Stop"
Write-Host "Packaging LUOI CMS for VPS deployment..." -ForegroundColor Cyan

$sourceDir = (Get-Location).Path
$zipFile = Join-Path $sourceDir "luoi-cms-deploy-latest.zip"
$tempDir = Join-Path $env:TEMP "luoi-cms-pack-temp"

if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$includeItems = @(
    "src",
    "prisma",
    "public",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    ".env",
    "ecosystem.config.cjs",
    "deploy-vps.sh",
    "VPS_DEPLOYMENT_GUIDE.md"
)

foreach ($item in $includeItems) {
    $itemPath = Join-Path $sourceDir $item
    if (Test-Path $itemPath) {
        Write-Host "  -> Copying: $item" -ForegroundColor Green
        Copy-Item -Path $itemPath -Destination (Join-Path $tempDir $item) -Recurse -Force
    }
}

Write-Host "Compressing clean deploy zip..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -CompressionLevel Optimal -Force

Remove-Item $tempDir -Recurse -Force

$zipSizeMb = [math]::Round(((Get-Item $zipFile).Length / 1MB), 2)
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "SUCCESSFULLY PACKAGED FOR VPS!" -ForegroundColor Green
Write-Host "Zip File: $zipFile" -ForegroundColor Cyan
Write-Host "Size: $zipSizeMb MB (Includes complete SQLite Databases: miniCRM, Pages, Settings)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Green
