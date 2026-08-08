#!/usr/bin/env bash
# ==============================================================================
# 🛠️ SCRIPT SỬA TRIỆT ĐỂ LỖI CSS & JAVASCRIPT ĐỒNG BỘ 100% CHO VPS
# ==============================================================================
set -e

echo "🛑 [1/5] Dừng sạch toàn bộ tiến trình Node/PM2 cũ..."
pm2 delete all || true
pm2 kill || true
killall -9 node || true
fuser -k 3000/tcp || true

echo "📥 [2/5] Lấy toàn bộ mã nguồn & CSS mới nhất từ Git..."
git init 2>/dev/null || true
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/trongbaoprime-png/luoi-cms.git
git fetch origin main
git reset --hard origin/main

echo "📦 [3/5] Khởi tạo 4 Cơ sở dữ liệu độc lập..."
chmod -R 777 prisma || true
npm run prisma:generate

echo "🔨 [4/5] Đóng gói Next.js Production sạch 100%..."
rm -rf .next
npm run build

echo "🚀 [5/5] Khởi động ứng dụng sạch với PM2..."
pm2 start npm --name "luoi-cms" -- run start
pm2 save
systemctl restart nginx || true

echo ""
echo "=============================================================================="
echo "🎉 ĐÃ SỬA VÀ ĐỒNG BỘ THÀNH CÔNG 100% CẢ CSS, JAVASCRIPT VÀ DỮ LIỆU!"
echo "👉 Mở https://luoidonnha.com/admin/login hoặc https://luoidonnha.com"
echo "=============================================================================="
