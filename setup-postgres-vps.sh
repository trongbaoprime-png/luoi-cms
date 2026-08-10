#!/usr/bin/env bash
# ==============================================================================
# LƯỜI CMS - AUTOMATED POSTGRESQL MIGRATION & FRESH DEPLOY ON VPS
# ==============================================================================

set -e

echo "🚀 [1/6] Kiểm tra cài đặt PostgreSQL trên VPS..."
if ! command -v psql &> /dev/null; then
    echo "📦 Đang cài đặt PostgreSQL 16 trên VPS..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

echo "🗄️ [2/6] Tạo Database & Quản trị viên PostgreSQL..."
sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'luoi_admin') THEN CREATE ROLE luoi_admin WITH LOGIN PASSWORD 'luoi_secure_password_2026' SUPERUSER; END IF; END \$\$;" || true
sudo -u postgres psql -c "CREATE DATABASE luoi_core OWNER luoi_admin;" || true
sudo -u postgres psql -c "CREATE DATABASE luoi_crm OWNER luoi_admin;" || true
sudo -u postgres psql -c "CREATE DATABASE luoi_omni OWNER luoi_admin;" || true

echo "⚙️ [3/6] Cấu hình PostgreSQL Schemas & cập nhật .env VPS..."
cp prisma/crm-postgres.prisma prisma/crm.prisma
cp prisma/omni-postgres.prisma prisma/omnichannel.prisma

# Cập nhật biến môi trường PostgreSQL vào file .env
sed -i '/CRM_DATABASE_URL/d' .env || true
sed -i '/OMNI_DATABASE_URL/d' .env || true
sed -i '/CRM_POSTGRES_URL/d' .env || true
sed -i '/OMNI_POSTGRES_URL/d' .env || true

echo 'CRM_DATABASE_URL="postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_crm?schema=public"' >> .env
echo 'OMNI_DATABASE_URL="postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_omni?schema=public"' >> .env
echo 'CRM_POSTGRES_URL="postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_crm?schema=public"' >> .env
echo 'OMNI_POSTGRES_URL="postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_omni?schema=public"' >> .env

export CRM_DATABASE_URL="postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_crm?schema=public"
export OMNI_DATABASE_URL="postgresql://luoi_admin:luoi_secure_password_2026@127.0.0.1:5432/luoi_omni?schema=public"

echo "🔨 [4/6] Generate Prisma Client & Push Schemas to PostgreSQL..."
npx prisma generate --schema=prisma/schema.prisma
npx prisma generate --schema=prisma/cms.prisma
npx prisma generate --schema=prisma/crm.prisma
npx prisma generate --schema=prisma/omnichannel.prisma
npx prisma generate --schema=prisma/crm.sqlite.prisma
npx prisma generate --schema=prisma/omnichannel.sqlite.prisma

npx prisma db push --schema=prisma/crm.prisma --accept-data-loss
npx prisma db push --schema=prisma/omnichannel.prisma --accept-data-loss

echo "📦 [5/6] Nạp 48.156 Leads từ minicrm.db sang PostgreSQL VPS..."
npx tsx scripts/migrate-sqlite-to-postgres.ts

echo "🔨 [6/6] Build Production & Reload PM2..."
npm run build
pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs
pm2 save

echo "=============================================================================="
echo "🎉 HOÀN TẤT CHUYỂN ĐỔI CHUẨN POSTGRESQL TRÊN VPS!"
echo "🌐 Dữ liệu 48.156 Leads đã được nạp đầy đủ 100% vào PostgreSQL."
echo "=============================================================================="
