# ==============================================================================
# LUOI CMS - LOCAL POSTGRESQL ENVIRONMENT & MIGRATION SCRIPT
# Run in PowerShell: .\setup-postgres-local.ps1 -User "postgres" -Password "luoicms"
# ==============================================================================

param(
    [string]$User = "postgres",
    [string]$Password = ""
)

if (-not $Password) {
    $Password = Read-Host -Prompt "Nhap mat khau PostgreSQL Localhost ($User)"
}

Write-Host "[1/4] Cap nhat chuoi ket noi PostgreSQL Localhost vao file .env..." -ForegroundColor Green

$pgUrlCrm = "postgresql://${User}:${Password}@127.0.0.1:5432/luoi_crm?schema=public"
$pgUrlOmni = "postgresql://${User}:${Password}@127.0.0.1:5432/luoi_omni?schema=public"

$envContent = Get-Content .env -ErrorAction SilentlyContinue
$envContent = $envContent | Where-Object { $_ -notmatch "^CRM_DATABASE_URL=" -and $_ -notmatch "^OMNI_DATABASE_URL=" -and $_ -notmatch "^CRM_POSTGRES_URL=" -and $_ -notmatch "^OMNI_POSTGRES_URL=" }
$envContent += "CRM_DATABASE_URL=`"$pgUrlCrm`""
$envContent += "OMNI_DATABASE_URL=`"$pgUrlOmni`""
$envContent += "CRM_POSTGRES_URL=`"$pgUrlCrm`""
$envContent += "OMNI_POSTGRES_URL=`"$pgUrlOmni`""
$envContent | Set-Content .env

Write-Host "[2/4] Generate toan bo Prisma Clients..." -ForegroundColor Green
npx prisma generate --schema=prisma/crm.sqlite.prisma
npx prisma generate --schema=prisma/omnichannel.sqlite.prisma
npx prisma generate --schema=prisma/crm-postgres.prisma
npx prisma generate --schema=prisma/omni-postgres.prisma

Write-Host "[3/4] Tao cau truc Bang tren Local PostgreSQL..." -ForegroundColor Green
$env:CRM_POSTGRES_URL = $pgUrlCrm
$env:OMNI_POSTGRES_URL = $pgUrlOmni
npx prisma db push --schema=prisma/crm-postgres.prisma --accept-data-loss
npx prisma db push --schema=prisma/omni-postgres.prisma --accept-data-loss

Write-Host "[4/4] Nap du lieu 48.156 Leads tu minicrm.db sang Local PostgreSQL..." -ForegroundColor Green
npx tsx scripts/migrate-sqlite-to-postgres.ts

Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "HOAN TAT CHUAN HOA MOI TRUONG POSTGRESQL TREN LOCALHOST!" -ForegroundColor Green
