#!/usr/bin/env bash
# ==============================================================================
# LƯỜI CMS - VPS DEPLOY & UPDATE AUTOMATION SCRIPT
# Tự động cập nhật, cài đặt dependencies, generate prisma, build và reload PM2
# ==============================================================================

set -e

echo "🚀 [1/6] Kiểm tra Node.js & npm..."
node -v
npm -v

echo "📦 [2/6] Cài đặt dependencies..."
npm install --production=false

echo "🗄️ [3/6] Generate 4 Prisma Clients độc lập (Core, CMS, CRM, Omnichannel)..."
npx prisma generate --schema=prisma/schema.prisma || true
npx prisma generate --schema=prisma/cms.prisma || true
npx prisma generate --schema=prisma/crm.prisma || true
npx prisma generate --schema=prisma/omnichannel.prisma || true

echo "🔨 [4/6] Đóng gói Production Build Next.js..."
npm run build

echo "🔄 [5/6] Khởi động hoặc reload qua PM2 (Zero Downtime)..."
if command -v pm2 &> /dev/null; then
    pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs
    pm2 save
    echo "✅ PM2 đã reload thành công trên cổng 3000!"
else
    echo "⚠️ PM2 chưa được cài đặt toàn cục. Bạn có thể chạy: npm run start"
    echo "👉 Khuyến nghị cài đặt PM2: npm install -g pm2"
fi

echo "=============================================================================="
echo "🎉 DEPLOY THÀNH CÔNG LƯỜI CMS LÊN VPS!"
echo "🌐 Website đang chạy tại: http://localhost:3000"
echo "=============================================================================="
