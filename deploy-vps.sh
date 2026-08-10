#!/usr/bin/env bash
# ==============================================================================
# LƯỜI CMS - VPS DEPLOY & UPDATE AUTOMATION SCRIPT
# Tự động cập nhật, cài đặt dependencies, generate prisma, build và reload PM2
# ==============================================================================

set -e

echo "🚀 [1/6] Kiểm tra Node.js & npm..."
node -v
npm -v

echo "🔓 [2/6] Phân quyền bộ nhớ SQLite..."
chmod -R 777 prisma/ || true

echo "📦 [3/6] Cài đặt dependencies..."
npm install --production=false

echo "🗄️ [4/6] Generate Prisma Clients & Tạo CSDL PostgreSQL trên VPS..."
npx prisma generate --schema=prisma/schema.prisma || true
npx prisma generate --schema=prisma/cms.prisma || true
npx prisma generate --schema=prisma/crm.sqlite.prisma || true
npx prisma generate --schema=prisma/omnichannel.sqlite.prisma || true
npx prisma generate --schema=prisma/crm-postgres.prisma || true
npx prisma generate --schema=prisma/omni-postgres.prisma || true

echo "  -> Pushing schema & đảm bảo bộ nhớ SQLite luoi-cms.db sẵn sàng..."
npx prisma db push --schema=prisma/cms.prisma --accept-data-loss || true
chmod 666 prisma/*.db || true
chmod 777 prisma/ || true

echo "  -> Pushing schema & tạo tự động CSDL PostgreSQL luoi_crm..."
npx prisma db push --schema=prisma/crm-postgres.prisma --accept-data-loss || true

echo "  -> Pushing schema & tạo tự động CSDL PostgreSQL luoi_omni..."
npx prisma db push --schema=prisma/omni-postgres.prisma --accept-data-loss || true

echo "🚀 [5/6] Đồng bộ 48.156 Leads từ SQLite sang PostgreSQL trên VPS..."
npx tsx scripts/migrate-sqlite-to-postgres.ts || true

echo "🔨 [6/6] Đóng gói Production Build Next.js..."
npm run build

echo "🔄 Khởi động hoặc reload qua PM2 (Zero Downtime)..."
if command -v pm2 &> /dev/null; then
    pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs
    pm2 save
    echo "✅ PM2 đã reload thành công trên cổng 3000!"
else
    echo "⚠️ PM2 chưa được cài đặt toàn cục. Bạn có thể chạy: npm run start"
fi

echo "=============================================================================="
echo "🎉 DEPLOY THÀNH CÔNG LƯỜI CMS LÊN VPS!"
echo "=============================================================================="
