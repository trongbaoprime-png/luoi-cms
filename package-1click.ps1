$ErrorActionPreference = "Stop"
Write-Host "Packaging 1-Click Installer (like WordPress) for LUOI CMS..." -ForegroundColor Cyan

$sourceDir = (Get-Location).Path
$zipFile = Join-Path $sourceDir "luoi-cms-installer.zip"
$tempDir = Join-Path $env:TEMP "luoi-cms-1click-pack"

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
    "install.sh",
    "ecosystem.config.cjs",
    ".env",
    "VPS_DEPLOYMENT_GUIDE.md"
)

foreach ($item in $includeItems) {
    $itemPath = Join-Path $sourceDir $item
    if (Test-Path $itemPath) {
        Write-Host "  -> Adding: $item" -ForegroundColor Green
        Copy-Item -Path $itemPath -Destination (Join-Path $tempDir $item) -Recurse -Force
    }
}

Write-Host "Compressing 1-Click zip package..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -CompressionLevel Optimal -Force

Remove-Item $tempDir -Recurse -Force

$zipSizeMb = [math]::Round(((Get-Item $zipFile).Length / 1MB), 2)
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "1-CLICK INSTALLER PACKAGED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "File: $zipFile" -ForegroundColor Cyan
Write-Host "Size: $zipSizeMb MB (Includes complete Database, Code, 1-Click Installer)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Green
