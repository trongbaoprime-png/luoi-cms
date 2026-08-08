#!/usr/bin/env bash
# ==============================================================================
# 🚀 LƯỜI CMS & miniCRM - BỘ CÀI ĐẶT TỰ ĐỘNG 1 CLICK (1-CLICK AUTO INSTALLER)
# Tự động 100% như WordPress: Cài Node, Prisma, Build, PM2, Khởi chạy ngay lập tức!
# ==============================================================================

set -e

echo ""
echo "=============================================================================="
echo "🌴 ĐANG CÀI ĐẶT HỆ THỐNG LƯỜI CMS & miniCRM (1-CLICK INSTALLER)..."
echo "=============================================================================="
echo ""

# 1. Kiểm tra và tự động cài Node.js 20 LTS nếu máy chủ chưa có
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "📦 [1/6] Máy chủ chưa có Node.js. Đang tự động cài Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs build-essential
fi

echo "✅ [1/6] Node.js $(node -v) & NPM $(npm -v) đã sẵn sàng!"

# 2. Kiểm tra và tự động cài PM2 toàn cục
if ! command -v pm2 &> /dev/null; then
    echo "📦 [2/6] Đang cài đặt PM2 Process Manager..."
    npm install -g pm2
fi
echo "✅ [2/6] PM2 $(pm2 -v) đã sẵn sàng!"

# 3. Chuyển vào đúng thư mục dự án
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "📦 [3/6] Đang cài đặt toàn bộ gói phụ thuộc (Dependencies)..."
npm install --production=false

echo "🗄️ [4/6] Khởi tạo 4 Cơ sở dữ liệu độc lập (Core, CMS, miniCRM, Omnichannel)..."
chmod -R 777 prisma || true
npx prisma generate --schema=prisma/schema.prisma || true
npx prisma generate --schema=prisma/cms.prisma || true
npx prisma generate --schema=prisma/crm.prisma || true
npx prisma generate --schema=prisma/omnichannel.prisma || true

echo "🔨 [5/6] Đóng gói Production Next.js Build..."
npm run build

echo "🔄 [6/6] Khởi động ứng dụng bằng PM2..."
pm2 delete all || true
pm2 start npm --name "luoi-cms" -- run start
pm2 save
pm2 startup systemd -u root --hp /root || true

echo ""
echo "=============================================================================="
echo "🎉 CHÚC MỪNG BẠN! CÀI ĐẶT THÀNH CÔNG 100% LƯỜI CMS & miniCRM!"
echo "🌐 Website chính:        http://localhost:3000 hoặc https://luoidonnha.com"
echo "👥 miniCRM Khách hàng:    http://localhost:3000/admin/crm"
echo "📊 Trạng thái PM2:        pm2 list"
echo "=============================================================================="
echo ""
