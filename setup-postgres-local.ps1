# ==============================================================================
# LƯỜI CMS - LOCAL POSTGRESQL ENVIRONMENT & MIGRATION SCRIPT
# Chạy trong PowerShell: .\setup-postgres-local.ps1
# ==============================================================================

Write-Host "🚀 [1/4] Cập nhật chuỗi kết nối PostgreSQL Localhost vào file .env..." -ForegroundColor Green

$pgUrlCrm = "postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_crm?schema=public"
$pgUrlOmni = "postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_omni?schema=public"

$envContent = Get-Content .env -ErrorAction SilentlyContinue
$envContent = $envContent | Where-Object { $_ -notmatch "^CRM_DATABASE_URL=" -and $_ -notmatch "^OMNI_DATABASE_URL=" -and $_ -notmatch "^CRM_POSTGRES_URL=" -and $_ -notmatch "^OMNI_POSTGRES_URL=" }
$envContent += "CRM_DATABASE_URL=`"$pgUrlCrm`""
$envContent += "OMNI_DATABASE_URL=`"$pgUrlOmni`""
$envContent += "CRM_POSTGRES_URL=`"$pgUrlCrm`""
$envContent += "OMNI_POSTGRES_URL=`"$pgUrlOmni`""
$envContent | Set-Content .env

Write-Host "🔨 [2/4] Generate toàn bộ Prisma Clients..." -ForegroundColor Green
npm run prisma:generate

Write-Host "📦 [3/4] Tạo cấu trúc Bảng trên Local PostgreSQL..." -ForegroundColor Green
$env:CRM_DATABASE_URL = $pgUrlCrm
$env:OMNI_DATABASE_URL = $pgUrlOmni
npx prisma db push --schema=prisma/crm.sqlite.prisma --accept-data-loss
npx prisma db push --schema=prisma/omnichannel.sqlite.prisma --accept-data-loss

Write-Host "🚀 [4/4] Nạp dữ liệu 48.156 Leads từ minicrm.db sang Local PostgreSQL..." -ForegroundColor Green
npx tsx scripts/migrate-sqlite-to-postgres.ts

Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "🎉 HOÀN TẤT CHUẨN HÓA MÔI TRƯỜNG POSTGRESQL TRÊN LOCALHOST!" -ForegroundColor Green
